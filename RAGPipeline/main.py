import chromadb
from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title="DokuMind RAG Service",
    description="RAG pipeline microservice for DokuMindEntreprise",
    version="0.1.0"
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    try:
        client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        client.list_collections()
        return {"status": "ok", "chromadb": "ok", "model": settings.groq_model}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}