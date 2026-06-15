import os
from pydantic import Field
from pydantic_settings import BaseSettings

# Absolute base directory of RAGPipeline
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    # Groq
    groq_api_key: str=Field(default="")
    groq_model: str = "llama-3.1-8b-instant"

    # ChromaDB
    chroma_host: str = "chromadb"
    chroma_port: int = 8000
    chroma_persist_dir: str = os.path.join(BASE_DIR, "chroma_db")

    # Retrieval
    similarity_threshold: float = 0.35
    top_k_results: int = 6
    top_k_after_rerank: int = 3

    class Config:
        env_file = ".env"

settings = Settings()