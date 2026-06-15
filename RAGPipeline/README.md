# DokuMind RAG Pipeline Microservice

The **RAG (Retrieval-Augmented Generation) Pipeline** is an independent, high-performance Python microservice designed to serve as the document intelligence engine for the DokuMind platform. It processes uploaded PDFs, manages dense semantic vectors in a multi-tenant layout, and generates deterministic grounded responses from private documents.

---

## 🛠️ Technology Stack

* **API Layer**: `FastAPI` (0.135.3) + `Uvicorn` (0.43.0)
* **LLM Engine**: `Groq LPU` (`llama-3.1-8b-instant` or `llama-3.3-70b-versatile`) for sub-second text generation
* **Vector Store**: `ChromaDB` (configured with Cosine Similarity)
* **Embedding Model**: Local HuggingFace `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional dense vectors)
* **Re-ranking Model**: `sentence-transformers/CrossEncoder` (`ms-marco-MiniLM-L-6-v2`)
* **Orchestration**: `LangChain` framework components
* **PDF Parser**: `pypdf` (6.9.2)

---

## 🧱 Subsystem Architecture

The pipeline is split into three main operational phases:

### 📥 1. Document Ingestion (`app/ingestion/`)
Triggered by `POST /api/ingest`.
- **Text Extraction (`loader.py`)**: Reads the uploaded PDF bytes page-by-page using `pypdf`. Performs basic text validation and rejects scanned image-only or empty files.
- **Parent-Child Chunking (`chunker.py` & `parent_retriever.py`)**: 
  - **Child Splits**: Small, fine-grained chunks of **300 characters** (with 50 character overlap) are embedded and stored in the ChromaDB collection `tenant_{tenant_id}_child` for high-precision semantic matching.
  - **Parent Splits**: Larger context blocks of **800 characters** (with 150 character overlap) are saved in a disk-backed `LocalFileStore` (`docstore_{tenant_id}`) to preserve broader surrounding details.
- **Tenant Isolation**: Chroma collections and file stores are dynamically partitioned per `tenant_id`. Cross-tenant data leaks are physically impossible.

### 🔍 2. Advanced Retrieval (`app/retrieval/`)
- **Multi-Query Expansion (`multi_retriever.py`)**: Generates multiple semantic variations of the user's question via LLM to bridge phrasing gaps between queries and document text.
- **Parent Retrieval Matcher (`parent_retriever.py`)**: Searches the high-precision child vector store, finds the matching child ID, and instantly pulls the corresponding parent context from the local file store.
- **Zero-Latency Embeddings**: Retrieves similarity scores directly from ChromaDB and associates them with parent contexts, preventing redundant CPU re-embedding.
- **Cross-Encoder Re-ranking**: Integrates MS-MARCO to mathematically rank and trim contexts before generation.

### ✍️ 3. Generation & Guardrails (`app/generation/`)
- **Hallucination Guard (`hallucination.py`)**: Evaluates the similarity scores of the retrieved documents. If no matches pass the minimum threshold (`similarity_threshold >= 0.2`), the pipeline halts and returns a static safe fallback: *"I don't have information on this topic..."*. This prevents the LLM from hallucinating.
- **Deterministic Inference (`llm.py`)**: Queries Groq with a temperature of `0.0` to force factual consistency.
- **Prompt injection (`prompt_builder.py`)**: Structures retrieved contexts alongside strict system directives instructing the model to ONLY answer using the supplied facts.

---

## 🔌 API Endpoints Reference

All endpoints (except `/health`) require `tenant_id`. The default server runs on `http://localhost:8000`.

### 1. Ingest PDF (`POST /api/ingest`)
* **Content-Type**: `multipart/form-data`
* **Request Payload**:
  * `file`: (Binary PDF file)
  * `tenant_id`: `string`
* **Response (200 OK)**:
```json
{
  "filename": "annual_report.pdf",
  "pages_processed": 5,
  "chunks_stored": 15,
  "tenant_id": "acme-corp"
}
```

### 2. Streaming Chat (`POST /api/chat`)
* **Content-Type**: `application/json`
* **Request Payload**:
```json
{
  "question": "What is the remote work policy?",
  "tenant_id": "acme-corp",
  "history": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```
* **Response (200 OK)**: Streams raw text tokens.

### 3. List Documents (`GET /api/documents`)
* **Query Parameter**: `tenant_id=acme-corp`
* **Response (200 OK)**:
```json
{
  "tenant_id": "acme-corp",
  "documents": [
    {
      "filename": "annual_report.pdf",
      "chunks": 15
    }
  ],
  "total_chunks": 15
}
```

### 4. Delete Document (`DELETE /api/documents`)
* **Query Parameters**: `filename=annual_report.pdf` & `tenant_id=acme-corp`
* **Response (200 OK)**:
```json
{
  "deleted_chunks": 15,
  "filename": "annual_report.pdf",
  "tenant_id": "acme-corp"
}
```

### 5. Health Check (`GET /health`)
* **Response (200 OK)**:
```json
{
  "status": "ok",
  "chromadb": "ok",
  "model": "llama-3.1-8b-instant"
}
```

---

## ⚙️ Environment Configuration

Create a `.env` in the `RAGPipeline` folder:
```env
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.1-8b-instant
CHROMA_HOST=localhost
CHROMA_PORT=8000
```
