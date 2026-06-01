# DokuMind RAG Pipeline Microservice

**DokuMind** is an enterprise SaaS platform for intelligent knowledge management. This repository contains the independent Python RAG (Retrieval-Augmented Generation) pipeline microservice, designed to handle document ingestion, multi-tenant vector storage, semantic search, and streaming chat for private company documents.

It exposes a high-performance REST API that acts as a secure knowledge engine for the DokuMind Spring Boot backend.

---

## 🌟 Core Architectural Features

* **Multi-Tenant Vector Isolation**: Strictly enforces physical data separation by dynamically partitioning vector collections (`tenant_{tenant_id}`) and parent key-value stores (`docstore_{tenant_id}`) per company.
* **Hybrid Retrieval (Multi-Query + Parent-Document)**: 
  * Generates multiple query variations via LLM to bridge phrasing gaps.
  * Queries high-precision 300-character child chunks in ChromaDB.
  * Batch-retrieves corresponding 800-character parent chunks from a persistent `LocalFileStore`.
* **Zero-Latency Embedding Optimization**: Directly matches precomputed vector cosine similarity scores of child chunks from ChromaDB and forwards them to parent contexts, completely removing CPU double-embedding bottlenecks on query paths.
* **MS-MARCO Cross-Encoder Re-ranking**: Integrates `ms-marco-MiniLM-L-6-v2` to mathematically rank chunk relevance before context assembly.
* **Hallucination Prevention Guardrails**: Stops the LLM from utilizing internal training weights if matching retrieved document contexts fall below the `similarity_threshold`.

---

## 🛠️ Technology Stack

* **API Layer**: `FastAPI` + `Uvicorn`
* **Orchestrator**: `LangChain`
* **Vector Store**: `ChromaDB` (configured using cosine similarity)
* **Embeddings**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (Local execution)
* **LLM Engine**: `Groq LPU` (`llama-3.1-8b-instant`) for ultra-low latency inference
* **Re-ranking**: `sentence-transformers/CrossEncoder` (`ms-marco-MiniLM-L-6-v2`)

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+
* Groq API Key (Set up your key on [Groq Console](https://console.groq.com/))

### 2. Installation & Setup
Navigate to the root directory and set up a virtual environment:

```bash
# Clone the repository
git clone https://github.com/eayzaid/DokuMind.git
cd DokuMind

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install exact pinned dependencies
pip install -r RAGPipeline/requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `RAGPipeline` folder:

```env
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.1-8b-instant
```

### 4. Running the Server
Run the Uvicorn ASGI server:

```bash
cd RAGPipeline
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI docs will be available at `http://localhost:8000/docs`.

---

## 🔌 Detailed API Reference & JSON Formats

All API endpoints (except `/health`) are prefixed with `/api`. By default, the microservice runs on `http://localhost:8000`.

### 1. Ingest PDF Document (`POST /api/ingest`)
Processes a text-based PDF page-by-page, chunking them into parent-child structures and embedding them into a tenant-isolated ChromaDB collection.
* **HTTP Method**: `POST`
* **Content-Type**: `multipart/form-data`
* **Payload**:
  * `file`: (Binary PDF file)
  * `tenant_id`: `string` (e.g. `company_alpha`)

#### 📥 Curl Example:
```bash
curl -X POST "http://localhost:8000/api/ingest" \
  -F "file=@/path/to/test.pdf" \
  -F "tenant_id=company_alpha"
```

#### 📤 JSON Response Format (200 OK):
```json
{
  "filename": "test.pdf",
  "pages_processed": 4,
  "chunks_stored": 13,
  "tenant_id": "company_alpha"
}
```

#### 📤 JSON Error Response (422 Unprocessable Content):
```json
{
  "detail": "No text could be extracted from 'test.pdf'. Only text-based PDFs are supported."
}
```

---

### 2. Streaming Chat Response (`POST /api/chat`)
Streams response tokens dynamically via Server-Sent Events (SSE) using the Groq Llama 3.1 8B model grounded by retrieved context documents.
* **HTTP Method**: `POST`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "question": "What is the company remote work policy?",
  "tenant_id": "company_alpha",
  "history": [
    {
      "role": "user",
      "content": "Hello, I have a question about HR."
    },
    {
      "role": "assistant",
      "content": "Sure, please ask your question."
    }
  ]
}
```
*Note: The `history` field is optional and defaults to `[]`.*

#### 📥 Curl Example:
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the remote policy?", "tenant_id": "company_alpha"}'
```

#### 📤 Streaming Response Format (200 OK):
* **Response Content-Type**: `text/plain`
* **Payload**: Streamed raw text tokens (e.g. `The`, ` remote`, ` work`, ` policy`, ` allows...`).

---

### 3. List Ingested Documents (`GET /api/documents`)
Lists all documents currently indexed for a specific tenant workspace.
* **HTTP Method**: `GET`
* **Query Parameters**:
  * `tenant_id`: `string` (Required)

#### 📥 Curl Example:
```bash
curl "http://localhost:8000/api/documents?tenant_id=company_alpha"
```

#### 📤 JSON Response Format (200 OK):
```json
{
  "tenant_id": "company_alpha",
  "documents": [
    {
      "filename": "policy_remote_work.pdf",
      "chunks": 12
    },
    {
      "filename": "code_of_conduct.pdf",
      "chunks": 28
    }
  ],
  "total_chunks": 40
}
```

---

### 4. Delete Document (`DELETE /api/documents`)
Removes all vector child nodes, document metadata, and parent files from the database and disk storage.
* **HTTP Method**: `DELETE`
* **Query Parameters**:
  * `filename`: `string` (Required)
  * `tenant_id`: `string` (Required)

#### 📥 Curl Example:
```bash
curl -X DELETE "http://localhost:8000/api/documents?filename=policy_remote_work.pdf&tenant_id=company_alpha"
```

#### 📤 JSON Response Format (200 OK):
```json
{
  "deleted_chunks": 12,
  "filename": "policy_remote_work.pdf",
  "tenant_id": "company_alpha"
}
```

#### 📤 JSON Error Response (404 Not Found):
```json
{
  "detail": "No document 'policy_remote_work.pdf' found for tenant 'company_alpha'"
}
```

---

### 5. Health Check (`GET /health`)
Retrieves service health status and configurations.
* **HTTP Method**: `GET`

#### 📥 Curl Example:
```bash
curl "http://localhost:8000/health"
```

#### 📤 JSON Response Format (200 OK - Healthy):
```json
{
  "status": "ok",
  "chromadb": "ok",
  "model": "llama-3.1-8b-instant"
}
```

#### 📤 JSON Response Format (200 OK - Degraded):
```json
{
  "status": "degraded",
  "error": "SQLite connection timeout"
}
```

