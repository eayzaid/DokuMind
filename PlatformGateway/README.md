# DokuMind Platform Gateway

The **Platform Gateway** is the central entry point for DokuMind. It is a Spring Boot service that handles authentication, tenant-aware authorization, user management, MinIO file storage, and proxying document requests to the RAG pipeline.

The gateway uses Spring MVC for controllers and WebClient for downstream calls. It is not a pure reactive service.

## Responsibilities

1. JWT login, signup, refresh, and logout using an access token plus an `HttpOnly` refresh-token cookie.
2. Company-scoped tenant isolation via the `companyId` claim in the JWT.
3. User management for the real roles in the codebase: `SUPER_RH`, `RH`, `ASSISTANT`, and `WORKER`.
4. PDF archival in MinIO, with files stored under a company-prefixed object key.
5. Proxying document ingestion, listing, deletion, preview, and chat to the RAG pipeline.

## API Surface

All routes are exposed on port `8080`.

### Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/auth/signup` | `POST` | Registers a new company and its first `SUPER_RH` user. |
| `/auth/login` | `POST` | Authenticates credentials and returns an access token. |
| `/auth/refresh` | `GET` | Returns a fresh access token using the refresh cookie. |
| `/auth/logout` | `POST` | Clears the refresh cookie. |

### Authentication payloads

`POST /auth/signup`

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "companyAddress": "1 Main Street",
  "email": "john.doe@acme.com",
  "password": "SecurePassword123!"
}
```

`POST /auth/login`

```json
{
  "email": "john.doe@acme.com",
  "password": "SecurePassword123!"
}
```

`200 OK`

```json
{
  "accessToken": "eyJhbGciOi...",
  "role": "SUPER_RH"
}
```

### Document Management

The browser does not send `tenant_id`. The gateway resolves the active company from the JWT and injects it into downstream requests.

| Endpoint | Method | Description |
|---|---|---|
| `/documents/ingest` | `POST` | Uploads a PDF to MinIO and forwards it to the RAG pipeline for ingestion. |
| `/documents/chat` | `POST` | Proxies chat requests to the RAG pipeline and streams the answer back to the client. |
| `/documents` | `GET` | Lists the indexed documents for the active company. |
| `/documents` | `DELETE` | Deletes a document from MinIO and the RAG vector store. |
| `/documents/preview/{filename}` | `GET` | Streams the PDF inline from MinIO. |

### User Management

| Endpoint | Method | Description |
|---|---|---|
| `/users` | `GET` | Lists users in the active company. |
| `/users/{userId}` | `GET` | Returns a user profile. |
| `/users` | `POST` | Creates a new `RH`, `ASSISTANT`, or `WORKER` user. |
| `/users/{userId}` | `PUT` | Updates a user. |
| `/users/{userId}/reset` | `POST` | Resets a user password. |
| `/users/{userId}` | `DELETE` | Deletes a user. |

## Runtime Notes

The gateway relies on `PlatformGateway/src/main/resources/application.properties` for its runtime settings.

The real config keys used by the code are:

* `spring.datasource.url`
* `spring.datasource.username`
* `spring.datasource.password`
* `minio.url`
* `minio.access.name`
* `minio.access.secret`
* `minio.bucket.name`
* `rag.pipeline.url`
* `application.secret.access_token`
* `application.secret.refresh_token`
* `application.expiration.access_token`
* `application.expiration.refresh_token`
* `spring.mvc.async.request-timeout`
* `spring.servlet.multipart.max-file-size`
* `spring.servlet.multipart.max-request-size`

The file upload limit is configured through Spring multipart properties in the same file.
