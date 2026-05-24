import numpy as np
from pydantic import SecretStr
from langchain_groq import ChatGroq
from langchain_classic.retrievers.multi_query import MultiQueryRetriever
from app.core.config import settings
from app.core.logging import get_logger
from app.retrieval.retriever import search as standard_search
from app.retrieval.parent_retriever import get_parent_retriever

logger = get_logger(__name__)

def get_multi_parent_retriever(tenant_id: str):
    """
    Returns a MultiQueryRetriever wrapped around a ParentDocumentRetriever
    scoped to a specific tenant's collection.
    """
    # Get the base parent document retriever
    parent_retriever = get_parent_retriever(tenant_id)

    # LLM used only to generate query variations
    llm = ChatGroq(
        api_key=SecretStr(settings.groq_api_key),
        model=settings.groq_model,
        temperature=0,
    )

    # Wrap the parent document retriever in MultiQueryRetriever
    retriever = MultiQueryRetriever.from_llm(
        retriever=parent_retriever,
        llm=llm,
    )

    logger.info(f"Hybrid Multi-Query Parent-Document Retriever ready for tenant '{tenant_id}'")
    return retriever



def search_multi(question: str, tenant_id: str) -> list[dict]:
    """
    Tries Hybrid Multi-Query Parent-Document Retriever first.
    Obtains the child similarity scores directly from Chroma vector search
    and maps them to parent documents, avoiding expensive CPU re-embeddings.
    Falls back to standard retriever if it fails.
    """
    try:
        retriever = get_multi_parent_retriever(tenant_id)
        parent_retriever = retriever.retriever
        child_vectorstore = parent_retriever.vectorstore

        # 1. Generate query variations using llm_chain
        try:
            # llm_chain returns parsed lines (list of queries)
            queries = retriever.llm_chain.invoke({"question": question})
            if not isinstance(queries, list):
                queries = [question]
            else:
                # Clean up query variations
                cleaned_queries = []
                for q in queries:
                    q_clean = q.strip()
                    if not q_clean:
                        continue
                    # Strip number prefixes (e.g. "1. Query" -> "Query")
                    import re
                    match = re.match(r'^\d+[\.\)\s]+(.*)', q_clean)
                    if match:
                        q_clean = match.group(1).strip()
                    # Ignore conversational headers from LLM
                    if not q_clean.lower().startswith(("here are", "alternative versions", "questions:")):
                        cleaned_queries.append(q_clean)
                queries = cleaned_queries
        except Exception as e:
            logger.warning(f"Failed to generate query variations: {e} — using original question only")
            queries = [question]

        if question not in queries:
            queries.append(question)

        # 2. Query child collection with score (cosine distance)
        child_docs_with_scores = []
        for q in queries:
            try:
                results = child_vectorstore.similarity_search_with_score(
                    q, k=settings.top_k_results
                )
                child_docs_with_scores.extend(results)
            except Exception as e:
                logger.warning(f"Child vector search failed for query '{q}': {e}")

        # 3. Deduplicate and keep maximum similarity score for each parent doc ID
        parent_doc_map = {}
        for child_doc, distance in child_docs_with_scores:
            # Chroma configured with hnsw:space=cosine returns distance = 1 - cosine_similarity
            similarity = 1.0 - float(distance)
            if similarity >= settings.similarity_threshold:
                parent_id = child_doc.metadata.get("doc_id")
                if parent_id:
                    if parent_id not in parent_doc_map or similarity > parent_doc_map[parent_id]:
                        parent_doc_map[parent_id] = similarity

        if not parent_doc_map:
            logger.warning("Hybrid Multi-Query Parent Retriever returned no chunks above threshold — falling back to standard")
            return standard_search(question, tenant_id)

        # 4. Fetch parent documents in batch from docstore
        parent_ids = list(parent_doc_map.keys())
        parent_docs = parent_retriever.docstore.mget(parent_ids)

        results = []
        for parent_id, doc in zip(parent_ids, parent_docs):
            if doc is None:
                continue

            similarity = parent_doc_map[parent_id]
            logger.info(
                f"Multi-Query Parent chunk from '{doc.metadata.get('filename', 'unknown')}' "
                f"p.{doc.metadata.get('page', '?')} — child similarity: {similarity:.3f}"
            )
            results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "similarity": similarity
            })

        logger.info(
            f"Hybrid Multi-Query Parent Retriever returned {len(results)} chunks above threshold "
            f"{settings.similarity_threshold}"
        )
        return results

    except Exception as e:
        logger.error(f"Hybrid Multi-Query Parent Retriever failed: {e} — falling back to standard")
        return standard_search(question, tenant_id)