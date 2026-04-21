from app.core.logging import get_logger

logger = get_logger(__name__)

def build_prompt(question: str, relevant_chunks: list[dict]) -> str:
    """
    Builds the final prompt sent to the LLM.
    Context is assembled from retrieved chunks, ordered by similarity.
    """
    # Sort chunks by similarity, most relevant first
    sorted_chunks = sorted(relevant_chunks, key=lambda x: x["similarity"], reverse=True)
    
    context_parts = []
    for i, chunk in enumerate(sorted_chunks, 1):
        source = f"{chunk['metadata']['filename']} (page {chunk['metadata']['page']})"
        context_parts.append(f"[Source {i}: {source}]\n{chunk['content']}")
    
    context = "\n\n".join(context_parts)
    
    prompt = f"""You are a document assistant. Your role is to answer questions based strictly on the company documents provided below.

Rules:
- Answer ONLY using the information in the documents below
- If the answer is not in the documents, say exactly: "I don't have information on this topic in your company's documents."
- Never use your general knowledge to fill gaps
- Be concise and precise
- If you quote a policy, mention which document it comes from

DOCUMENTS:
{context}

QUESTION: {question}

ANSWER:"""
    
    logger.info(f"Built prompt with {len(sorted_chunks)} sources, total length: {len(prompt)} chars")
    return prompt