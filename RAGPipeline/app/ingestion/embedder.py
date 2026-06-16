from functools import lru_cache

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
        logger.info("Loading embedding model: paraphrase-multilingual-MiniLM-L12-v2")
        _embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        logger.info("Embedding model loaded")
    return _embedding_model

@lru_cache(maxsize=1)
def get_chroma_client():
    """Return a shared Chroma HTTP client for the process."""
    logger.info(
        "Creating shared Chroma HTTP client for %s:%s",
        settings.chroma_host,
        settings.chroma_port,
    )
    return chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)

@lru_cache(maxsize=256)
def get_chroma_collection(tenant_id: str):
    """
    Returns the ChromaDB collection for a specific tenant.
    Each tenant gets their own isolated collection.
    """
    client = get_chroma_client()
    
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

def delete_document(filename: str, tenant_id: str) -> int:
    """
    Deletes all chunks belonging to a filename from a tenant's collection.
    Also cleans up the parent retriever's child collection and parent docstore.
    """
    collection = get_chroma_collection(tenant_id)

    results = collection.get(where={"filename": filename})

    deleted_count = 0
    if results["ids"]:
        collection.delete(ids=results["ids"])
        deleted_count = len(results["ids"])
        logger.info(f"Deleted {deleted_count} standard chunks for '{filename}' from tenant '{tenant_id}'")
    else:
        logger.warning(f"No standard chunks found for '{filename}' in tenant '{tenant_id}'")

    # Clean up parent retriever's child collection and parent docstore
    import os
    from langchain_classic.storage import LocalFileStore

    client = get_chroma_client()
    child_collection_name = f"tenant_{tenant_id}_child"
    
    try:
        # Check if child collection exists
        child_collection = client.get_collection(name=child_collection_name)
        child_results = child_collection.get(where={"filename": filename}, include=["metadatas"])
        
        if child_results["ids"]:
            # Extract parent doc IDs
            parent_doc_ids = list({
                meta["doc_id"]
                for meta in child_results["metadatas"]
                if meta and "doc_id" in meta
            })
            
            # Delete child chunks
            child_collection.delete(ids=child_results["ids"])
            logger.info(f"Deleted {len(child_results['ids'])} child chunks for '{filename}' from tenant '{tenant_id}'")
            
            # Delete parent documents
            if parent_doc_ids:
                store_path = os.path.join(settings.chroma_persist_dir, f"docstore_{tenant_id}")
                if os.path.exists(store_path):
                    fs = LocalFileStore(store_path)
                    fs.mdelete(parent_doc_ids)
                    logger.info(f"Deleted {len(parent_doc_ids)} parent documents for '{filename}' from docstore_{tenant_id}")
    except Exception as e:
        logger.warning(f"Parent/child cleanup skipped or failed for '{filename}' (tenant '{tenant_id}'): {e}")

    return deleted_count
