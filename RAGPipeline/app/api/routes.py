import asyncio
import re

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.api.schemas import ChatRequest, IngestResponse
from app.core.config import settings
from app.core.logging import get_logger
from app.ingestion.embedder import delete_document, get_chroma_collection
from app.pipeline import chat_stream, ingest

logger = get_logger(__name__)

router = APIRouter()


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def validate_tenant_id(tenant_id: str):
    """Rejects tenant IDs with invalid characters."""
    if not re.match(r'^[a-zA-Z0-9_-]+$', tenant_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid tenant_id format. Only letters, numbers, - and _ are allowed."
        )


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    tenant_id: str = Form(...)
):
    validate_tenant_id(tenant_id)

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")

    try:
        # Run in executor so it doesn't block the server during heavy processing
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: ingest(file_bytes, file.filename, tenant_id)
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Ingestion failed for '{file.filename}': {e}")
        raise HTTPException(status_code=500, detail="Ingestion failed")


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    validate_tenant_id(request.tenant_id)

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    def generate():
        for token in chat_stream(
            request.question,
            request.tenant_id,
            request.history or []
        ):
            yield token

    return StreamingResponse(generate(), media_type="text/plain")


@router.get("/documents")
async def list_documents(tenant_id: str):
    """
    Returns all documents ingested for a tenant.
    Spring Boot calls this to display the document library.
    """
    validate_tenant_id(tenant_id)

    try:
        collection = get_chroma_collection(tenant_id)
        results = collection.get(include=["metadatas"])

        doc_map = {}
        for meta in results["metadatas"]:
            fname = meta.get("filename", "unknown")
            doc_map[fname] = doc_map.get(fname, 0) + 1

        documents = [
            {"filename": fname, "chunks": count}
            for fname, count in doc_map.items()
        ]

        return {
            "tenant_id": tenant_id,
            "documents": documents,
            "total_chunks": collection.count()
        }
    except Exception as e:
        logger.error(f"List documents failed for tenant '{tenant_id}': {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents")
async def delete_document_endpoint(
    filename: str,
    tenant_id: str
):
    """
    Removes all chunks for a specific document from a tenant's collection.
    Spring Boot calls this when AdminRH deletes a document.
    """
    validate_tenant_id(tenant_id)

    if not filename or not filename.strip():
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    try:
        deleted = delete_document(filename, tenant_id)

        if deleted == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No document '{filename}' found for tenant '{tenant_id}'"
            )

        return {
            "deleted_chunks": deleted,
            "filename": filename,
            "tenant_id": tenant_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete failed for '{filename}': {e}")
        raise HTTPException(status_code=500, detail=str(e))