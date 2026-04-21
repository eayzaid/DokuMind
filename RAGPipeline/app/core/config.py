from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Groq
    groq_api_key: str
    groq_model: str = "llama-3.1-8b-instant"

    # ChromaDB
    chroma_persist_dir: str = "./chroma_db"

    # Retrieval
    similarity_threshold: float = 0.2
    top_k_results: int = 4

    class Config:
        env_file = ".env"

settings = Settings()