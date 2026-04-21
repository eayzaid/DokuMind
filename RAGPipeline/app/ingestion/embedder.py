import chromadb
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Load the embedding model once when the module is imported
# This avoids reloading it on every request (it's 80MB)
_embedding_model = None

def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model: all-MiniLM-L6-v2")
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Embedding model loaded")
    return _embedding_model

def get_chroma_collection(tenant_id: str):
    """
    Returns the ChromaDB collection for a specific tenant.
    Each tenant gets their own isolated collection.
    """
    client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    
    collection_name = f"tenant_{tenant_id}"
    
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    
    return collection

def store_chunks(chunks: list[dict], tenant_id: str) -> int:
    """
    Embeds chunks and stores them in the tenant's ChromaDB collection.
    Returns the number of chunks stored.
    """
    if not chunks:
        logger.warning("No chunks to store")
        return 0
    
    model = get_embedding_model()
    collection = get_chroma_collection(tenant_id)
    
    # Extract content for embedding
    texts = [chunk["content"] for chunk in chunks]
    ids = [chunk["metadata"]["chunk_id"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]
    
    logger.info(f"Generating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=False).tolist()
    
    # Store in ChromaDB — upsert means "insert or update if already exists"
    # This way re-uploading a document doesn't create duplicates
    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )
    
    logger.info(f"Stored {len(chunks)} chunks in collection 'tenant_{tenant_id}'")
    return len(chunks)