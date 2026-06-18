from functools import lru_cache
import time
import re

import numpy as np
from pydantic import SecretStr
from langchain_groq import ChatGroq
from langchain_classic.retrievers.multi_query import MultiQueryRetriever
from app.core.config import settings
from app.core.logging import get_logger
from app.retrieval.retriever import search as standard_search
from app.retrieval.parent_retriever import get_parent_retriever

logger = get_logger(__name__)

_retrieval_cache: dict[tuple[str, str], tuple[float, list[dict]]] = {}

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


def _normalize_question(question: str) -> str:
    return " ".join(question.strip().lower().split())


def _get_cached_retrieval(question: str, tenant_id: str) -> list[dict] | None:
    cache_key = (tenant_id, _normalize_question(question))
    cached = _retrieval_cache.get(cache_key)
    if not cached:
        return None

    cached_at, payload = cached
    if time.time() - cached_at > settings.retrieval_cache_ttl_seconds:
        _retrieval_cache.pop(cache_key, None)
        return None

    logger.info(
        "Retrieval cache hit for tenant '%s' question '%s'",
        tenant_id,
        question,
    )
    return [chunk.copy() for chunk in payload]


def _set_cached_retrieval(question: str, tenant_id: str, results: list[dict]) -> None:
    cache_key = (tenant_id, _normalize_question(question))
    _retrieval_cache[cache_key] = (time.time(), [chunk.copy() for chunk in results])
    logger.info(
        "Stored retrieval cache entry for tenant '%s' question '%s' with TTL %ss",
        tenant_id,
        question,
        settings.retrieval_cache_ttl_seconds,
    )


def search_multi(question: str, tenant_id: str) -> list[dict]:
    """
    Tries a direct parent-document lookup first.
    Only if the direct pass is weak do we generate query variations through Groq
    and retry with multi-query expansion.
    """
    try:
        cached_results = _get_cached_retrieval(question, tenant_id)
        if cached_results is not None:
            return cached_results

        logger.info("Expanding query for maximum recall...")

        retriever = get_multi_parent_retriever(tenant_id)

        try:
            raw_queries = retriever.llm_chain.invoke({"question": question})
            queries_list = []
            
            if hasattr(raw_queries, "lines"):
                queries_list = raw_queries.lines
            elif isinstance(raw_queries, dict) and "text" in raw_queries:
                val = raw_queries["text"]
                queries_list = val if isinstance(val, list) else val.split("\n")
            elif isinstance(raw_queries, str):
                queries_list = raw_queries.split("\n")
            elif isinstance(raw_queries, list):
                queries_list = raw_queries

            if not queries_list:
                queries_list = [question]

            cleaned_queries = []
            import re
            for q in queries_list:
                q_clean = q.strip()
                if not q_clean:
                    continue
                match = re.match(r'^\d+[\.\)\s]+(.*)', q_clean)
                if match:
                    q_clean = match.group(1).strip()
                if not q_clean.lower().startswith(("here are", "alternative versions", "questions:")):
                    cleaned_queries.append(q_clean)
            
            queries = cleaned_queries if cleaned_queries else [question]

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
            _set_cached_retrieval(question, tenant_id, expanded_results)
            return expanded_results

        logger.warning(
            "Hybrid Multi-Query Parent Retriever returned no chunks above threshold — falling back to standard"
        )
        standard_results = standard_search(question, tenant_id)
        if standard_results:
            _set_cached_retrieval(question, tenant_id, standard_results)
        return standard_results

    except Exception as e:
        logger.error(f"Hybrid Multi-Query Parent Retriever failed: {e} — falling back to standard")
        standard_results = standard_search(question, tenant_id)
        if standard_results:
            _set_cached_retrieval(question, tenant_id, standard_results)
        return standard_results
