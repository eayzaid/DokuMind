from sentence_transformers import CrossEncoder
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

import threading

_reranker_model = None
_reranker_lock = threading.Lock()

def get_reranker():
    global _reranker_model
    with _reranker_lock:
        if _reranker_model is None:
            logger.info("Loading reranker model: cross-encoder/ms-marco-MiniLM-L-6-v2")
            _reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            logger.info("Reranker model loaded")
    return _reranker_model

def rerank(question: str, chunks: list[dict]) -> list[dict]:
    """
    Re-scores retrieved chunks by relevance to the question.
    Returns chunks sorted by reranker score, highest first.
    """
    if not chunks:
        return []

    reranker = get_reranker()

    # Cross-encoder scores each (question, chunk) pair
    pairs = [(question, chunk["content"]) for chunk in chunks]
    scores = reranker.predict(pairs)

    # Attach reranker score to each chunk and filter garbage
    valid_chunks = []
    for chunk, score in zip(chunks, scores):
        score_val = float(score)
        chunk["reranker_score"] = score_val
        if score_val >= settings.reranker_threshold:
            valid_chunks.append(chunk)

    # Sort by reranker score descending
    reranked = sorted(valid_chunks, key=lambda x: x["reranker_score"], reverse=True)

    logger.info(f"Reranked {len(reranked)} chunks")
    for i, chunk in enumerate(reranked):
        logger.info(
            f"  Rank {i+1}: '{chunk['metadata'].get('filename','?')}' "
            f"p.{chunk['metadata'].get('page','?')} — "
            f"score: {chunk['reranker_score']:.3f}"
        )

    return reranked