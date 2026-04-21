from app.ingestion.loader import load_pdf
from app.ingestion.chunker import chunk_pages
from app.ingestion.embedder import store_chunks
from app.retrieval.retriever import search
from app.generation.hallucination import should_fallback, get_fallback_response
from app.generation.prompt_builder import build_prompt
from app.generation.llm import generate, stream
from app.core.logging import get_logger
from typing import Generator

logger = get_logger(__name__)

def ingest(file_bytes: bytes, filename: str, tenant_id: str) -> dict:
    """
    Full ingestion pipeline: PDF → chunks → vectors → ChromaDB
    """
    logger.info(f"Starting ingestion: '{filename}' for tenant '{tenant_id}'")
    
    pages = load_pdf(file_bytes, filename)
    chunks = chunk_pages(pages, filename)
    stored = store_chunks(chunks, tenant_id)
    
    return {
        "filename": filename,
        "pages_processed": len(pages),
        "chunks_stored": stored,
        "tenant_id": tenant_id
    }

def chat(question: str, tenant_id: str) -> str:
    """
    Full RAG pipeline: question → retrieval → prompt → LLM → answer
    Non-streaming version, good for testing.
    """
    logger.info(f"Chat request from tenant '{tenant_id}': '{question}'")
    
    relevant_chunks = search(question, tenant_id)
    
    if should_fallback(relevant_chunks):
        return get_fallback_response()
    
    prompt = build_prompt(question, relevant_chunks)
    return generate(prompt)

def chat_stream(question: str, tenant_id: str) -> Generator[str, None, None]:
    """
    Streaming version of the RAG pipeline.
    Yields tokens as they arrive from the LLM.
    """
    logger.info(f"Streaming chat from tenant '{tenant_id}': '{question}'")
    
    relevant_chunks = search(question, tenant_id)
    
    if should_fallback(relevant_chunks):
        yield get_fallback_response()
        return
    
    prompt = build_prompt(question, relevant_chunks)
    yield from stream(prompt)