from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    tenant_id: str

class ChatResponse(BaseModel):
    answer: str
    tenant_id: str

class IngestResponse(BaseModel):
    filename: str
    pages_processed: int
    chunks_stored: int
    tenant_id: str