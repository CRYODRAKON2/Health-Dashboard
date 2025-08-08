from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Vitals models
class VitalsCreate(BaseModel):
    heart_rate: int
    temperature: float
    spo2: int
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    notes: Optional[str] = None

class VitalsResponse(BaseModel):
    id: int
    user_id: str
    heart_rate: int
    temperature: float
    spo2: int
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Document models
class DocumentResponse(BaseModel):
    id: int
    user_id: str
    file_name: str
    file_url: str
    file_size: int
    file_type: str
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Chat models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None
    timestamp: datetime

# User models
class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Auth models
class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
