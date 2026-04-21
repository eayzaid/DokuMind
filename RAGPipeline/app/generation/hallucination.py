from app.core.logging import get_logger

logger = get_logger(__name__)

FALLBACK_RESPONSE = (
    "I don't have information on this topic in your company's documents. "
    "Please check with your HR department or consult the relevant policy directly."
)

def should_fallback(relevant_chunks: list) -> bool:
    """
    Returns True if no relevant chunks were found,
    meaning the LLM should not attempt to answer.
    """
    return len(relevant_chunks) == 0

def get_fallback_response() -> str:
    logger.info("No relevant chunks found — returning fallback response")
    return FALLBACK_RESPONSE