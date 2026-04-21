from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from app.api.schemas import ChatRequest, ChatResponse, IngestResponse
from app.pipeline import ingest, chat_stream
from app.core.logging import get_logger
import re




logger = get_logger(__name__)

router = APIRouter()

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    tenant_id: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if file.size and file.size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")
    
    try:
        file_bytes = await file.read()
        result = ingest(file_bytes, file.filename, tenant_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail="Ingestion failed")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    def generate():
        for token in chat_stream(request.question, request.tenant_id):
            yield token
    
    return StreamingResponse(generate(), media_type="text/plain")






def validate_tenant_id(tenant_id: str):
    if not re.match(r'^[a-zA-Z0-9_-]+$', tenant_id):
        raise HTTPException(status_code=400, detail="Invalid tenant_id format")