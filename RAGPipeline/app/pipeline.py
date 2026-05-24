from typing import Generator, Optional
from app.ingestion.loader import load_pdf
from app.ingestion.chunker import chunk_pages
from app.ingestion.embedder import store_chunks
from app.retrieval.multi_retriever import search_multi as search
from app.retrieval.reranker import rerank
from app.retrieval.parent_retriever import ingest_with_parent_retriever
from app.generation.hallucination import should_fallback, get_fallback_response
from app.generation.prompt_builder import build_prompt
from app.generation.llm import generate, stream
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def prepare_rag_prompt(question: str, tenant_id: str, history: list = []) -> Optional[str]:
    """
    Unified RAG step: Retrieval -> Fallback Check -> Cross-Encoder Reranking -> Slicing -> Prompt Assembly.
    Returns the fully compiled prompt, or None if the hallucination guard fires.
    """
    # 1. Retrieve chunks (using our hybrid Multi-Query Parent Retriever)
    relevant_chunks = search(question, tenant_id)
    
    # 2. Check if we have relevant info
    if should_fallback(relevant_chunks):
        return None
    
    # 3. Rerank using Cross-Encoder
    relevant_chunks = rerank(question, relevant_chunks)
    
    # 4. Slice to top K after rerank
    relevant_chunks = relevant_chunks[:settings.top_k_after_rerank]
    
    # 5. Build prompt
    return build_prompt(question, relevant_chunks, history)


def ingest(file_bytes: bytes, filename: str, tenant_id: str) -> dict:
    """
    Full ingestion pipeline: PDF → chunks → vectors → ChromaDB + Parent KV Store
    """
    logger.info(f"Starting ingestion: '{filename}' for tenant '{tenant_id}'")
    
    pages = load_pdf(file_bytes, filename)
    chunks = chunk_pages(pages, filename)
    stored = store_chunks(chunks, tenant_id)

    ingest_with_parent_retriever(pages, tenant_id)
    
    logger.info(f"Ingestion complete: {stored} standard chunks + parent docs stored")

    return {
        "filename": filename,
        "pages_processed": len(pages),
        "chunks_stored": stored,
        "tenant_id": tenant_id
    }


def chat(question: str, tenant_id: str) -> str:
    """
    Full RAG pipeline: question → retrieval → prompt → LLM → answer
    Blocking chat endpoint. Guaranteed to return the exact same answer quality as stream.
    """
    logger.info(f"Chat request from tenant '{tenant_id}': '{question}'")
    
    try:
        prompt = prepare_rag_prompt(question, tenant_id)
    except Exception as e:
        logger.error(f"Error preparing RAG prompt: {e}")
        return "An error occurred during document retrieval. Please try again."
    
    if prompt is None:
        return get_fallback_response()
        
    try:
        return generate(prompt)
    except Exception as e:
        logger.error(f"Error generating LLM response: {e}")
        return "An error occurred while generating the answer. Please try again."


def chat_stream(question: str, tenant_id: str, history: list = []) -> Generator[str, None, None]:
    """
    Streaming version of the RAG pipeline.
    Yields tokens as they arrive from the LLM.
    """
    logger.info(f"Streaming chat from tenant '{tenant_id}': '{question}'")
    
    try:
        prompt = prepare_rag_prompt(question, tenant_id, history)
    except Exception as e:
        logger.error(f"Error preparing RAG prompt stream: {e}")
        yield "An error occurred during document retrieval. Please try again."
        return
    
    if prompt is None:
        yield get_fallback_response()
        return
        
    try:
        yield from stream(prompt)
    except Exception as e:
        logger.error(f"Error streaming LLM response: {e}")
        yield "An error occurred while generating the answer. Please try again."