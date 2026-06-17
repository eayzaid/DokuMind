import os
from functools import lru_cache
import json
from langchain_chroma import Chroma
from langchain_classic.retrievers import ParentDocumentRetriever
from langchain_classic.storage import LocalFileStore
from langchain_classic.storage._lc_store import create_kv_docstore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from app.core.config import settings
from app.core.logging import get_logger
from app.ingestion.embedder import get_embedding_model

logger = get_logger(__name__)

child_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50,
)

parent_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
)

class CachedSentenceTransformerEmbeddings(Embeddings):
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        model = get_embedding_model()
        return model.encode(texts, show_progress_bar=False).tolist()

    def embed_query(self, text: str) -> list[float]:
        model = get_embedding_model()
        return model.encode(text, show_progress_bar=False).tolist()

@lru_cache(maxsize=1)
def get_embedding_wrapper():
    """Cache the LangChain embedding wrapper once per process."""
    return CachedSentenceTransformerEmbeddings()

@lru_cache(maxsize=256)
def get_parent_retriever(tenant_id: str):
    embeddings = get_embedding_wrapper()

    vectorstore = Chroma(
        collection_name=f"tenant_{tenant_id}_child",
        embedding_function=embeddings,
        persist_directory=settings.chroma_persist_dir,
        collection_metadata={"hnsw:space": "cosine"},
    )

    # Persistent file store — survives server restarts
    store_path = os.path.join(settings.chroma_persist_dir, f"docstore_{tenant_id}")
    os.makedirs(store_path, exist_ok=True)
    fs = LocalFileStore(store_path)
    docstore = create_kv_docstore(fs)

    retriever = ParentDocumentRetriever(
        vectorstore=vectorstore,
        docstore=docstore,
        child_splitter=child_splitter,
        parent_splitter=parent_splitter,
    )

    return retriever


def ingest_with_parent_retriever(pages: list[dict], tenant_id: str):
    """
    Ingests a document using ParentDocumentRetriever page-by-page.
    Call this alongside your standard embedder.store_chunks().
    """
    retriever = get_parent_retriever(tenant_id)

    docs = []
    for page in pages:
        metadata = page["metadata"].copy()
        metadata["tenant_id"] = tenant_id
        
        docs.append(Document(
            page_content=page["content"],
            metadata=metadata
        ))

    retriever.add_documents(docs)
    filename = pages[0]["metadata"]["filename"] if pages else "unknown"
    logger.info(f"ParentDocumentRetriever ingested '{filename}' with {len(pages)} pages for tenant '{tenant_id}'")


def search_with_parent_retriever(question: str, tenant_id: str) -> list[dict]:
    """
    Searches using child chunks but returns parent chunks to LLM.
    """
    retriever = get_parent_retriever(tenant_id)

    try:
        docs = retriever.invoke(question)
    except Exception as e:
        logger.error(f"ParentDocumentRetriever search failed: {e}")
        return []

    results = []
    for doc in docs:
        results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity": 1.0
        })

    logger.info(f"ParentDocumentRetriever returned {len(results)} parent chunks")
    return results
