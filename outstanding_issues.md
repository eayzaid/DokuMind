# DokuMind RAG Pipeline — Outstanding Issues & Bugs

This document compiles all logical bugs, security/data isolation leaks, performance bottlenecks, and code inconsistencies identified in the DokuMind RAG Pipeline codebase. Use this as a guide to resume work and prioritize fixes.

---

## 1. Major Logical & Security Bugs

### 🔴 Page Metadata is Lost in Parent Document Retriever Path
* **Location:** [`RAGPipeline/app/pipeline.py` (L48-49)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/pipeline.py#L48-L49) & [`RAGPipeline/app/retrieval/parent_retriever.py` (L52-65)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/parent_retriever.py#L52-L65)
* **Problem:** In `pipeline.py`, the contents of all extracted PDF pages are joined into a single string (`full_text`) and sent to `ingest_with_parent_retriever`, which constructs a single `Document` metadata-tagged with only the `filename` and `tenant_id`. As a result, when the parent retriever splits the text into parent and child chunks, the page numbers are lost. The prompt builder prints `(page ?)` for these sources.
* **Impact:** Loss of page citation in generated LLM answers when using the parent retriever path.
* **Proposed Fix:** Update `ingest_with_parent_retriever` to accept `pages: list[dict]`, convert each page into a LangChain `Document` containing its page-specific metadata, and ingest them as a list.

### 🔴 Document Deletion Does Not Clean Up Parent/Child Stores
* **Location:** [`RAGPipeline/app/ingestion/embedder.py` (`delete_document`)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/ingestion/embedder.py#L68-L82)
* **Problem:** The `delete_document` function only deletes documents from the standard collection (`tenant_{tenant_id}`). It fails to delete the associated child chunks from `tenant_{tenant_id}_child` and parent documents from the local key-value store (`docstore_{tenant_id}`).
* **Impact:** 
  * **Data Privacy/Isolation Leak:** Deleted documents can still be retrieved by the parent retriever and surfaced to the user.
  * **Storage Leak:** Dead documents will accumulate indefinitely, slowing down lookups.
* **Proposed Fix:** Update `delete_document` to also remove the document ID/chunks from the child collection and clean up references in the local file store.

### 🟡 Mismatched Vector Distance Metrics (Cosine vs. L2)
* **Location:** [`RAGPipeline/app/retrieval/parent_retriever.py` (L30-34)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/parent_retriever.py#L30-L34) vs [`RAGPipeline/app/ingestion/embedder.py` (L29-32)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/ingestion/embedder.py#L29-L32)
* **Problem:** In `embedder.py`, Chroma is created using cosine similarity: `metadata={"hnsw:space": "cosine"}`. In `parent_retriever.py`, the LangChain `Chroma` instance is created without explicit space configuration, defaulting to Chroma's default **L2 Distance**.
* **Impact:** Mismatched distance metrics between the two paths. Vector search results in the parent/child path will be ordered by L2 distance, not cosine similarity, causing inconsistent relevance sorting.
* **Proposed Fix:** Ensure the `Chroma` instance in `parent_retriever.py` is configured with `collection_metadata={"hnsw:space": "cosine"}`.

---

## 2. Architectural & Performance Bottlenecks

### 🟡 Re-initializing HuggingFace Embeddings on Every Request (Memory/CPU Leak)
* **Location:** [`RAGPipeline/app/retrieval/parent_retriever.py` (`get_parent_retriever`)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/parent_retriever.py#L25-L28)
* **Problem:** The function instantiates `HuggingFaceEmbeddings` locally on every execution instead of caching the model instance.
* **Impact:** Memory leaks and significant CPU latency. Every single chat query or document ingestion will trigger model verification or loading overhead.
* **Proposed Fix:** Cache the `HuggingFaceEmbeddings` model in a global singleton inside `parent_retriever.py`, similar to how `_embedding_model` is cached in `embedder.py`.

### 🟡 Double Embedding Computation on Search Path
* **Location:** [`RAGPipeline/app/retrieval/multi_retriever.py` (L52-66)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/multi_retriever.py#L52-L66)
* **Problem:** In order to perform manual cosine similarity checks on the retrieved parent documents, the code re-embeds the original query and the text of all retrieved parent chunks on the fly using `model.encode`.
* **Impact:** Generates redundant embedding computations on CPU, adding several hundred milliseconds of latency per user question.
* **Proposed Fix:** Instead of re-embedding parent documents on the fly, compute similarity using the child chunks' pre-existing vector similarity, or pass the child similarity score along.

### 🟡 DB Connection Overhead & SQLite Concurrency Locks
* **Location:** [`RAGPipeline/app/ingestion/embedder.py` (`get_chroma_collection`)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/ingestion/embedder.py#L20-L25) and [`RAGPipeline/app/retrieval/parent_retriever.py`](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/parent_retriever.py)
* **Problem:** The code initializes a new `chromadb.PersistentClient` on every single database operation (ingesting, searching, listing documents, deleting).
* **Impact:** In an asynchronous server like FastAPI, concurrent writes or reads will encounter sqlite thread locks (`database is locked`), causing requests to fail.
* **Proposed Fix:** Initialize a single shared Chroma DB client at the application startup level and share it across the modules.

---

## 3. Code Consistency & API Resilience Issues

### 🟡 Missing Dependency in `requirements.txt`
* **Location:** [`RAGPipeline/requirements.txt`](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/requirements.txt)
* **Problem:** `multi_retriever.py` imports `from langchain_groq import ChatGroq`, but `langchain-groq` is not pinned or declared in `requirements.txt`.
* **Impact:** Clean environments or container builds will fail to start due to `ImportError`.
* **Proposed Fix:** Add `langchain-groq` to `requirements.txt` with its appropriate version.

### 🟡 Unhandled Exceptions in streaming HTTP Response
* **Location:** [`RAGPipeline/app/pipeline.py` (`chat_stream`)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/pipeline.py#L76-L89)
* **Problem:** The streaming generator does not catch errors during the retrieval phase (`prepare_rag_prompt`).
* **Impact:** If Chroma fails or the LLM API is rate-limited, the streaming connection has already started sending `200 OK` headers. An unhandled exception will abruptly crash the network socket, leaving the client application hanging without showing a readable error.
* **Proposed Fix:** Wrap `prepare_rag_prompt` and LLM invocation in a try-except block inside `chat_stream` to yield a clean, user-friendly fallback text before closing the stream.

### 🟢 Hardcoded Mock Similarity Score
* **Location:** [`RAGPipeline/app/retrieval/parent_retriever.py` (L85)](file:///home/badr-laklach/GithubRepos/rag_pipeline/RAGPipeline/app/retrieval/parent_retriever.py#L85)
* **Problem:** When returning chunks, `search_with_parent_retriever` hardcodes `"similarity": 1.0`.
* **Impact:** Mismatch in ranking logic if scores are compared or merged down the line.
