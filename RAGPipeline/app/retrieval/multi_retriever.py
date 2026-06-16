from functools import lru_cache

import numpy as np
from pydantic import SecretStr
from langchain_groq import ChatGroq
from langchain_classic.retrievers.multi_query import MultiQueryRetriever
from app.core.config import settings
from app.core.logging import get_logger
from app.retrieval.retriever import search as standard_search
from app.retrieval.parent_retriever import get_parent_retriever

logger = get_logger(__name__)

@lru_cache(maxsize=256)
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


def _collect_parent_chunks(queries: list[str], tenant_id: str) -> list[dict]:
    """
    Query the tenant child collection and map matching child chunks back to
    parent documents.
    """
    parent_retriever = get_parent_retriever(tenant_id)
    child_vectorstore = parent_retriever.vectorstore

    child_docs_with_scores = []
    for q in queries:
        try:
            results = child_vectorstore.similarity_search_with_score(
                q, k=settings.top_k_results
            )
            child_docs_with_scores.extend(results)
        except Exception as e:
            logger.warning(f"Child vector search failed for query '{q}': {e}")

    parent_doc_map = {}
    for child_doc, distance in child_docs_with_scores:
        similarity = 1.0 - float(distance)
        if similarity < settings.similarity_threshold:
            continue

        parent_id = child_doc.metadata.get("doc_id")
        if parent_id and (
            parent_id not in parent_doc_map or similarity > parent_doc_map[parent_id]
        ):
            parent_doc_map[parent_id] = similarity

    if not parent_doc_map:
        return []

    parent_ids = list(parent_doc_map.keys())
    parent_docs = parent_retriever.docstore.mget(parent_ids)

    results = []
    for parent_id, doc in zip(parent_ids, parent_docs):
        if doc is None:
            continue

        similarity = parent_doc_map[parent_id]
        logger.info(
            f"Parent chunk from '{doc.metadata.get('filename', 'unknown')}' "
            f"p.{doc.metadata.get('page', '?')} — child similarity: {similarity:.3f}"
        )
        results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity": similarity
        })

    return results


def search_multi(question: str, tenant_id: str) -> list[dict]:
    """
    Tries a direct parent-document lookup first.
    Only if the direct pass is weak do we generate query variations through Groq
    and retry with multi-query expansion.
    """
    try:
        direct_results = _collect_parent_chunks([question], tenant_id)
        if len(direct_results) >= settings.top_k_after_rerank:
            logger.info(
                "Direct parent retrieval returned %d chunks; skipping query expansion",
                len(direct_results),
            )
            return direct_results

        logger.info(
            "Direct parent retrieval returned %d chunks; expanding the query",
            len(direct_results),
        )

        retriever = get_multi_parent_retriever(tenant_id)

        try:
            queries = retriever.llm_chain.invoke({"question": question})
            if not isinstance(queries, list):
                queries = [question]
            else:
                cleaned_queries = []
                for q in queries:
                    q_clean = q.strip()
                    if not q_clean:
                        continue
                    import re
                    match = re.match(r'^\d+[\.\)\s]+(.*)', q_clean)
                    if match:
                        q_clean = match.group(1).strip()
                    if not q_clean.lower().startswith(("here are", "alternative versions", "questions:")):
                        cleaned_queries.append(q_clean)
                queries = cleaned_queries
        except Exception as e:
            logger.warning(f"Failed to generate query variations: {e} — using original question only")
            queries = [question]

        if question not in queries:
            queries.append(question)

        expanded_results = _collect_parent_chunks(queries, tenant_id)
        if expanded_results:
            logger.info(
                "Hybrid Multi-Query Parent Retriever returned %d chunks above threshold %s",
                len(expanded_results),
                settings.similarity_threshold,
            )
            return expanded_results

        logger.warning(
            "Hybrid Multi-Query Parent Retriever returned no chunks above threshold — falling back to standard"
        )
        return standard_search(question, tenant_id)

    except Exception as e:
        logger.error(f"Hybrid Multi-Query Parent Retriever failed: {e} — falling back to standard")
        return standard_search(question, tenant_id)
