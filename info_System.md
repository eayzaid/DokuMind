# DokuMind RAG Pipeline — Comprehensive System Architecture

## 1. System Overview
The DokuMind RAG Pipeline is a highly specialized, independent Python microservice designed to handle document intelligence for the DokuMind enterprise platform. It operates as a REST API that ingests PDF documents, processes them into dense semantic embeddings, and exposes a streaming chat interface. This allows users to query their private company documents using advanced Retrieval-Augmented Generation (RAG) techniques.

The system is designed with strict multi-tenancy in mind, ensuring that data from different companies remains physically isolated at the vector database level.

---

## 2. Exact Folder Structure
The project is strictly organized to separate concerns (Routing, Core Config, Ingestion, Retrieval, and Generation).

```text
RAGPipeline/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Pinned dependency versions
├── tests/                      # Unit testing directory
├── data/                       # Sample documents (e.g., test.pdf)
├── chroma_db/                  # Persistent local vector database storage
└── app/
    ├── __init__.py
    ├── pipeline.py             # Top-level orchestrator (ingest, chat, chat_stream)
    ├── api/                    # REST API Layer
    │   ├── __init__.py
    │   ├── routes.py           # Endpoints: POST /ingest, POST /chat
    │   └── schemas.py          # Pydantic validation models
    ├── core/                   # Shared Utilities & Configuration
    │   ├── __init__.py
    │   ├── config.py           # Pydantic BaseSettings (loads .env)
    │   └── logging.py          # Centralized logger factory
    ├── generation/             # LLM Inference & Guardrails
    │   ├── __init__.py
    │   ├── hallucination.py    # Fallback guard against hallucination
    │   ├── llm.py              # Groq API integration (streaming/blocking)
    │   └── prompt_builder.py   # Context + Question prompt injection
    ├── ingestion/              # Data Preprocessing Pipeline
    │   ├── __init__.py
    │   ├── loader.py           # pypdf extraction & validation
    │   ├── chunker.py          # RecursiveCharacterTextSplitter
    │   └── embedder.py         # paraphrase-multilingual-MiniLM-L12-v2 vector generation
    └── retrieval/              # Advanced Semantic Search
        ├── __init__.py
        ├── retriever.py        # Standard cosine similarity retriever
        ├── multi_retriever.py  # LangChain MultiQueryRetriever
        └── parent_retriever.py # LangChain ParentDocumentRetriever
```

---

## 3. Core Technologies & Exact Versions
The architecture leverages a modern, high-performance Python stack optimized for speed and accuracy.

- **API Framework**: `fastapi` (0.135.3) & `uvicorn` (0.43.0) — High-performance asynchronous REST API layer.
- **Vector Database**: `chromadb` (1.5.5) — Local, persistent vector store configured for cosine similarity search.
- **LLM Inference**: `groq` (1.1.2) — Ultra-low latency inference engine utilizing LPUs. The system exclusively uses the `llama-3.1-8b-instant` model.
- **Embeddings**: `sentence-transformers` (5.3.0) — Local embedding generation via HuggingFace using the robust and highly accurate multilingual `paraphrase-multilingual-MiniLM-L12-v2` model.
- **Orchestration**: `langchain-text-splitters` (1.1.1), `langchain-chroma`, and `langchain-groq` for advanced retrieval strategies.
- **Document Processing**: `pypdf` (6.9.2) for raw PDF text extraction.
- **Configuration**: `pydantic-settings` (2.13.1) for type-safe environment variable (`.env`) validation.

---

## 4. Pipeline Architecture (Deep Dive)
The application is logically separated into three distinct phases: **Ingestion**, **Retrieval**, and **Generation**.

### Phase A: Document Ingestion (`app/ingestion/`)
Triggered via `POST /api/ingest`.
1. **Extraction (`loader.py`)**: Receives raw bytes of an uploaded PDF file. Uses `pypdf` to extract text page-by-page. It validates content and automatically discards empty or scanned (image-only) pages to ensure only clean data enters the vector space.
2. **Standard Chunking (`chunker.py`)**: Uses LangChain's `RecursiveCharacterTextSplitter`. Text is broken down into chunks of exactly **800 characters** with an overlap of **150 characters**. This overlap is crucial for preserving contextual continuity across chunk boundaries. Each chunk is tagged with deep metadata (filename, page number, unique chunk ID).
3. **Embedding (`embedder.py`)**: Converts the text chunks into dense floating-point vector representations using `paraphrase-multilingual-MiniLM-L12-v2`.
4. **Storage & Multi-Tenancy**: Vectors, text, and metadata are upserted into ChromaDB. Data isolation is strictly enforced by creating dedicated ChromaDB collections for each company (e.g., `tenant_{tenant_id}`). This physical isolation guarantees Company A can never query Company B's knowledge base.
5. **Parent Document Ingestion (`parent_retriever.py`)**: In parallel, the raw list of page contents and metadata is passed to `ingest_with_parent_retriever`. By avoiding block string concatenation, each page is added to the parent retriever as a distinct LangChain `Document`. This preserves page numbers throughout child chunk splits and parent document lookups.

### Phase B: Advanced Retrieval (`app/retrieval/`)
The system implements multiple retrieval strategies to maximize document recall.

1. **Standard Retriever (`retriever.py`)**: 
   - Embeds the user's question using the same `paraphrase-multilingual-MiniLM-L12-v2` model.
   - Performs a Cosine Similarity search against the tenant's collection.
   - Retrieves the top 4 chunks (`top_k_results = 4`).
   - Dynamically filters out irrelevant noise by strictly enforcing a `similarity_threshold >= 0.2`.

2. **Multi-Query Retriever (`multi_retriever.py`)**: 
   - Uses an LLM (`ChatGroq`) to generate multiple semantic variations of the user's original query.
   - This overcomes cases where the user's phrasing doesn't perfectly match the document's phrasing.
   - It executes all query variations against ChromaDB and unions the results to ensure maximum coverage.

3. **Parent Document Retriever (`parent_retriever.py`)**:
   - Uses a dual-chunking strategy.
   - **Child Splitter**: Creates small, highly specific chunks (300 chars, 50 overlap) stored in a separate collection (`tenant_{tenant_id}_child`) configured with **cosine similarity** (`"hnsw:space": "cosine"`) for high-precision semantic matching.
   - **Parent Splitter**: Maintains larger chunks (800 chars, 150 overlap) in a persistent disk-backed `LocalFileStore` (`docstore_{tenant_id}`) to survive server restarts.
   - When a small child chunk is matched, the system returns the larger parent chunk from the `LocalFileStore` to the LLM, providing maximum surrounding context while maintaining pinpoint search accuracy.

### Phase C: Generation & Guardrails (`app/generation/`)
Triggered via `POST /api/chat`.
1. **Hallucination Guard (`hallucination.py`)**: Before querying the LLM, the system checks the results from the retriever. If no chunks pass the similarity threshold, the pipeline instantly aborts and returns a hardcoded fallback: *"I don't have information on this topic..."*. This physically prevents the LLM from relying on its general training weights to guess an answer.
2. **Prompt Builder (`prompt_builder.py`)**: Context chunks are formatted and injected into a strict system prompt. The LLM is explicitly instructed to:
   - "Answer ONLY using the information in the documents below"
   - "If you quote a policy, mention which document it comes from"
3. **LLM Inference (`llm.py`)**: The prompt is dispatched to Groq (`llama-3.1-8b-instant`). The temperature is explicitly locked to `0.0` (or `0.1` in standard runs) to maximize determinism, reducing creative liberties and ensuring factual accuracy. Responses are returned via a streaming Generator for ultra-low latency UI feedback.

---

## 5. REST API Endpoints

### `POST /api/ingest`
- **Payload**: `multipart/form-data` containing `file` (PDF) and `tenant_id` (string).
- **Validation**: Enforces strict PDF-only validation and a 50MB file size limit.
- **Output**: Returns a JSON object with the number of pages processed and chunks successfully embedded and stored.

### `POST /api/chat`
- **Payload**: JSON `{"question": "string", "tenant_id": "string"}`
- **Validation**: Rejects empty questions and malformed tenant IDs.
- **Output**: Streams the text response directly from the LLM using HTTP Server-Sent Events / raw streaming text.
