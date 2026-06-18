from app.core.logging import get_logger


logger = get_logger(__name__)

def build_prompt(question: str, relevant_chunks: list[dict], history: list = []) -> str:
    
    sorted_chunks = sorted(
        relevant_chunks,
        key=lambda x: x.get("reranker_score", x.get("similarity", 0.0)),
        reverse=True
    )

    context_parts = []
    for i, chunk in enumerate(sorted_chunks, 1):
        source = f"{chunk['metadata'].get('filename', 'unknown')} (page {chunk['metadata'].get('page', '?')})"
        context_parts.append(f"[Source {i}: {source}]\n{chunk['content']}")

    context = "\n\n".join(context_parts)

    # Build history block
    history_block = ""
    if history:
        lines = []
        for msg in history:
            role_val = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "")
            content_val = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
            
            role = "User" if role_val.lower() == "user" else "Assistant"
            lines.append(f"{role}: {content_val}")
        history_block = "\nCONVERSATION HISTORY:\n" + "\n".join(lines) + "\n"

    prompt = f"""You are DokuMind, a helpful and precise corporate AI assistant.
Your task is to answer the user's question using ONLY the provided documents and conversation history.

RULES:
1. Answer the user's question clearly and professionally using the information provided.
2. If the documents contain a partial answer, provide what you can.
3. If the documents do NOT contain any relevant information at all, you must refuse by saying exactly: "I don't have information on this topic in your company's documents."
4. Do not invent facts or use general knowledge to fill in missing gaps.

DOCUMENTS:
{context}
{history_block}
CURRENT QUESTION: {question}

ANSWER:"""

    logger.info(f"Prompt built — {len(sorted_chunks)} sources, history: {len(history)} messages")
    return prompt