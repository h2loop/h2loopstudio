from typing import Any, Dict, Optional, List

from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    embeddings: Optional[List[float]] = []


class CustomDoc(BaseModel):
    asset_id: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    filename: Optional[str] = ""
    filepath: Optional[str] = ""
    uploaded_by: str
    status: str
    message: Optional[str] = ""
    error: bool = False


class QueryPayload(BaseModel):
    query: str
    chat_id: str
    user: str
    asset_ids: List[str]
    embeddings: Optional[List[float]] = []


class ContextChunk(BaseModel):
    text: str
    metadata: str
    query: str
    score: float = 0


class QueryResponse(BaseModel):
    chat_id: str
    user: str
    response: Optional[str] = ""
    complete: bool
    sources: Optional[List[str]] = []


class DatasheetPayload(BaseModel):
    datasheet_id: str
    datasheet_content: str
    additional_instruction: str
    user: str


class HardwareSchematicsPayload(BaseModel):
    request_id: str
    pdfs: List[str]
    user: str


class CodeFile(BaseModel):
    fileName: str
    code: str
    language: str


class CodeResponse(BaseModel):
    datasheet_id: str
    user: str
    files: List[CodeFile]


class DeviceTreeResponse(BaseModel):
    request_id: str
    user: str
    response: str


class DebugPayload(BaseModel):
    request_id: str
    log: str
    user: str


class DebugResponse(BaseModel):
    request_id: str
    user: str
    response: str
