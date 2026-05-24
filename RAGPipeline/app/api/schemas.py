from pydantic import BaseModel, validator
from typing import Optional

class Message(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    tenant_id: str
    history: Optional[list[Message]] = []

    @validator('question')
    def question_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Question cannot be empty')
        return v.strip()

    @validator('tenant_id')
    def tenant_id_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('tenant_id cannot be empty')
        return v.strip()

class IngestResponse(BaseModel):
    filename: str
    pages_processed: int
    chunks_stored: int
    tenant_id: str