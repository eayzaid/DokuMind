# DokuMind RAG Pipeline

The **RAG Pipeline** is the Python document intelligence service behind DokuMind. It parses PDFs, creates tenant-isolated vector indexes, reranks retrieval results, and generates grounded answers with Groq.

## Main Stages

### 1. Ingestion

Triggered by `POST /api/ingest`.

* `loader.py` extracts text from text-based PDFs using `pypdf`.
* `chunker.py` splits pages into standard chunks.
* `embedder.py` stores those chunks in a tenant-scoped Chroma collection named `tenant_{tenant_id}`.
* `parent_retriever.py` also stores parent documents and child chunks for parent-document retrieval.

### 2. Retrieval

* `multi_retriever.py` generates query variants with Groq and searches the tenant child collection.
* `retriever.py` performs a standard vector search fallback.
* `reranker.py` uses `ms-marco-MiniLM-L-6-v2` to reorder the candidates.

### 3. Generation

* `prompt_builder.py` assembles the final prompt.
* `llm.py` sends the prompt to Groq with `temperature=0.1`.
* `hallucination.py` returns a fallback response when no chunks pass the similarity gate.

## API

All endpoints except `/health` require `tenant_id`.

### `POST /api/ingest`

Uploads a PDF, extracts text, chunks it, and stores the vectors.

### `POST /api/chat`

Returns a streamed plain-text response from the RAG service. The gateway wraps this for the frontend.

### `GET /api/documents`

Lists the documents stored for a tenant.

### `DELETE /api/documents`

Deletes a document from the tenant vector store and parent store.

### `GET /health`

Checks Chroma connectivity.

## Runtime Configuration

`RAGPipeline/app/core/config.py` defines the defaults used by the service:

* `groq_model = llama-3.1-8b-instant`
* `chroma_host = chromadb`
* `chroma_port = 8000`
* `similarity_threshold = 0.35`
* `top_k_results = 6`
* `top_k_after_rerank = 3`

The service reads overrides from `RAGPipeline/.env`.

Recommended variables:

```env
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
CHROMA_HOST=chromadb
CHROMA_PORT=8000
```
