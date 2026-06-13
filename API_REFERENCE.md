# DokuMind RAG Service — REST API Integration Guide

This document provides the exact HTTP methods, headers, query parameters, request bodies, and JSON response formats for the DokuMind RAG Pipeline microservice endpoints. 

---

## 📋 Base URL
By default, the server runs on:
`http://localhost:8000`

All endpoints are prefixed with `/api` (except the `/health` endpoint).

---

## 🔌 API Endpoints Summary

### 1. Ingest PDF Document
Ingests a document page-by-page, processes standard chunks (800 chars) + child-parent layers, generates embeddings, and saves them to tenant-isolated collections.
* **HTTP Method**: `POST`
* **Path**: `/api/ingest`
* **Request Content-Type**: `multipart/form-data`
* **Request Payload**:
  * `file`: (Binary PDF file)
  * `tenant_id`: `string` (Only letters, numbers, hyphens, and underscores allowed)

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

#### 📤 JSON Error Response (422 Unprocessable Content - e.g. empty PDF or invalid formatting):
```json
{
  "detail": "No text could be extracted from 'test.pdf'. Only text-based PDFs are supported."
}
```

---

### 2. Streaming Chat Response
Connects to a Server-Sent Events (SSE) stream returning tokenized answer chunks from the Llama 3.1 8B model based on the retrieved context documents.
* **HTTP Method**: `POST`
* **Path**: `/api/chat`
* **Request Content-Type**: `application/json`
* **Request Body Schema**:
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
* **Payload**: Raw streamed text tokens (e.g. `The`, ` remote`, ` work`, ` policy`, ` allows...`).

---

### 3. List Ingested Documents
Retrieves a summary of all PDF documents currently stored and indexed for a specific company tenant.
* **HTTP Method**: `GET`
* **Path**: `/api/documents`
* **Query Parameters**:
  * `tenant_id`: `company_alpha` (Required)

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

### 4. Delete Ingested Document
Removes all vector representations, metadata nodes, child chunks, and persistent parent page store blocks belonging to a specific file for a tenant.
* **HTTP Method**: `DELETE`
* **Path**: `/api/documents`
* **Query Parameters**:
  * `filename`: `policy_remote_work.pdf` (Required)
  * `tenant_id`: `company_alpha` (Required)

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

#### 📤 JSON Error Response (404 Not Found - e.g. document not found in collection):
```json
{
  "detail": "No document 'policy_remote_work.pdf' found for tenant 'company_alpha'"
}
```

---

### 5. Health Check
Checks the backend infrastructure status by verifying active database connectivity to ChromaDB and reporting configuration metrics.
* **HTTP Method**: `GET`
* **Path**: `/health`

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
