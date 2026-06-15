# DokuMind Platform Gateway Service

The **Platform Gateway** is the central entry point and orchestrator for the DokuMind platform. Built using **Spring Boot 3** and the **Spring WebFlux (Reactive Stack)**, it handles security, user identity, multi-tenant separation, original document storage, and acts as a secure reverse proxy to the **RAG Pipeline** microservice.

---

## 🛠️ Key Responsibilities

1. **Identity & Security (JWT)**:
   - Authenticates users using JWT-based access tokens and HTTP-Only refresh token cookies.
   - Manages role-based access control (RBAC) across five user roles: `ADMIN`, `SUPER_RH`, `RH`, `ASSISTANT`, and `WORKER`.
2. **Strict Multi-Tenancy**:
   - Every user belongs to a company (tenant). The gateway extracts the `companyId` (UUID) from the JWT claims.
   - It injects this ID as the `tenant_id` query parameter/payload for all downstream RAG Pipeline requests, preventing unauthorized cross-company context queries or ingestion.
3. **Document Archival (MinIO)**:
   - Stores the original PDF files securely in an object store (**MinIO**) partitioned by company UUID (e.g., `bucket/company_uuid/filename.pdf`).
   - Serves secure, authenticated PDF document previews to authorized company staff.
4. **Reactive Orchestration**:
   - Proxies long-running uploads and Server-Sent Event (SSE) chat streams to the python RAG microservice asynchronously using `WebClient`.

---

## 🔌 API Endpoints Reference

All gateway routes are exposed on port `8080`.

### 🔑 Authentication (`/auth`)

| Endpoint | Method | Headers/Cookies | Description |
|---|---|---|---|
| `/auth/signup` | `POST` | None | Registers a new company and its initial `SUPER_RH` (HR Director) account. Sets refresh token cookie. |
| `/auth/login` | `POST` | None | Authenticates user credentials. Returns an access token and sets an `HttpOnly` refresh token cookie. |
| `/auth/refresh` | `GET` | Cookie: `refresh_token` | Standard silent token refresh. Returns a fresh short-lived access token. |
| `/auth/logout` | `POST` | None | Incalidates the current session by clearing the `refresh_token` cookie. |

#### Sign-Up Request Payload Schema (`POST /auth/signup`)
```json
{
  "companyName": "Acme Corp",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "password": "SecurePassword123"
}
```

#### Login Request Payload Schema (`POST /auth/login`)
```json
{
  "email": "john.doe@acme.com",
  "password": "SecurePassword123"
}
```

#### Access Token Response Format (`200 OK`)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

---

### 📂 Document Management & Chat (`/documents`)

*Note: The user does not need to send the `tenant_id` in requests; the gateway resolves the active user's company identity from the JWT context.*

| Endpoint | Method | Content-Type | Description |
|---|---|---|---|
| `/documents/ingest` | `POST` | `multipart/form-data` | Uploads a PDF to MinIO and sends it to the RAG Pipeline for text extraction, chunking, and embedding. |
| `/documents/chat` | `POST` | `application/json` | Dispatches the query and chat history to the RAG Pipeline. Returns a token stream. |
| `/documents` | `GET` | None | Lists all documents stored and indexed for the active tenant. |
| `/documents` | `DELETE` | Query Param: `filename` | Removes the document from MinIO and deletes its vector chunks/parent segments from the RAG store. |
| `/documents/preview/{filename}` | `GET` | None | Streams the raw PDF file directly from MinIO with inline headers for browser display. |

#### Chat Request Payload Schema (`POST /documents/chat`)
```json
{
  "question": "What is the remote work policy?",
  "history": [
    {
      "role": "user",
      "content": "Hello."
    },
    {
      "role": "assistant",
      "content": "Hi, how can I help you today?"
    }
  ]
}
```

#### Chat Response Format (`200 OK`)
* **Content-Type**: `text/event-stream`
* **Response**: Streamed text chunk tokens (e.g. `Under`, ` the`, ` remote`, ` work`, ` policy...`).

#### List Documents Response (`200 OK`)
```json
{
  "tenant_id": "8ca09e1e-257a-42db-a5c7-98782bb1a54f",
  "documents": [
    {
      "filename": "HR_Policy_2026.pdf",
      "chunks": 32
    }
  ],
  "total_chunks": 32
}
```

---

### 👥 User Management (`/users`)

Provides administration utilities for managing employee accounts. Access control is enforced based on Roles (e.g., only HR roles can create workers/assistants).

| Endpoint | Method | Query / Path Parameters | Description |
|---|---|---|---|
| `/users` | `GET` | Query: `page` (default 0), `first_name`, `last_name`, `role` (optional filters) | Lists users in the company. |
| `/users/{userId}` | `GET` | Path: `userId` (UUID) | Retrieves full user profile information. |
| `/users` | `POST` | None | Creates a new user within the company. |
| `/users/{userId}` | `PUT` | Path: `userId` (UUID) | Updates user fields (first name, last name, role, email). |
| `/users/{userId}/reset` | `POST` | Path: `userId` (UUID) | Resets the password of the specified user. |
| `/users/{userId}` | `DELETE` | Path: `userId` (UUID) | Deletes the user profile. |

#### Create/Update User Request Payload (`POST /users` / `PUT /users/{userId}`)
```json
{
  "email": "employee@acme.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "WORKER"
}
```

---

## ⚙️ Core Configuration Variables

These values are configured in the `application.yml` and loaded from environment variables in production:
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string.
- `MINIO_URL`, `MINIO_ACCESS_NAME`, `MINIO_ACCESS_SECRET`: MinIO credentials.
- `RAG_PIPELINE_URL`: Endpoint of the Python microservice (`http://ragpipeline:8000`).
- `APPLICATION_SECRET_ACCESS_TOKEN`, `APPLICATION_SECRET_REFRESH_TOKEN`: Cryptographic keys used for signing JWTs.
