from sentence_transformers import SentenceTransformer
from app.ingestion.embedder import get_embedding_model, get_chroma_collection
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def search(question: str, tenant_id: str) -> list[dict]:
    """
    Searches ChromaDB for chunks relevant to the question.
    Returns only chunks above the similarity threshold.
    """
    model = get_embedding_model()
    collection = get_chroma_collection(tenant_id)
    
    if collection.count() == 0:
        logger.warning(f"Collection for tenant '{tenant_id}' is empty")
        return []
    
    # Embed the question using the same model used for documents
    # This is critical — query and documents must use the same embedding space
    question_embedding = model.encode([question]).tolist()
    
    results = collection.query(
        query_embeddings=question_embedding,
        n_results=settings.top_k_results,
        include=["documents", "metadatas", "distances"]
    )
    
    # ChromaDB returns distances (lower = more similar with cosine)
    # Convert to similarity scores (higher = more similar)
    relevant_chunks = []
    
    for doc, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        similarity = 1 - distance
        
        logger.info(f"Chunk from '{metadata['filename']}' p.{metadata['page']} — similarity: {similarity:.3f}")
        
        if similarity >= settings.similarity_threshold:
            relevant_chunks.append({
                "content": doc,
                "metadata": metadata,
                "similarity": similarity
            })
    
    logger.info(f"Found {len(relevant_chunks)} relevant chunks above threshold {settings.similarity_threshold}")
    return relevant_chunks