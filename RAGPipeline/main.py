from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings
from app.core.logging import get_logger
from app.ingestion.embedder import get_chroma_client, get_embedding_model
from app.retrieval.reranker import get_reranker

logger = get_logger(__name__)

app = FastAPI(
    title="DokuMind RAG Service",
    description="RAG pipeline microservice for DokuMindEntreprise",
    version="0.1.0"
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
def warmup_runtime():
    """
    Preload the shared embedding model and Chroma client so the first chat or
    ingest request does not pay the cold-start penalty.
    """
    try:
        get_embedding_model()
        get_chroma_client()
        get_reranker()
        logger.info("RAG runtime warmup complete")
    except Exception as e:
        logger.warning(f"RAG runtime warmup skipped or incomplete: {e}")

@app.get("/health")
def health():
    try:
        client = get_chroma_client()
        client.list_collections()
        return {"status": "ok", "chromadb": "ok", "model": settings.groq_model}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}
