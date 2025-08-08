from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta

from app.database import get_supabase_client
from app.auth_supabase import get_current_user_id
from app.models import VitalsCreate, VitalsResponse, DocumentResponse, ChatRequest, ChatResponse
from app.services.vitals_service import VitalsService
from app.services.document_service import DocumentService
from app.services.chat_service import ChatService

load_dotenv()

app = FastAPI(
    title="Health Dashboard API",
    description="API for personal health dashboard with AI-powered document analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security - using Supabase Auth

# Services
vitals_service = VitalsService()
document_service = DocumentService()
chat_service = ChatService()

@app.get("/")
async def root():
    return {"message": "Health Dashboard API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Note: Authentication is now handled by Supabase Auth directly
# The frontend uses Supabase Auth, and the backend verifies tokens with Supabase

# Vitals endpoints
@app.get("/vitals", response_model=List[VitalsResponse])
async def get_vitals(user_id: str = Depends(get_current_user_id)):
    return await vitals_service.get_user_vitals(user_id)

@app.post("/vitals", response_model=VitalsResponse)
async def create_vitals(
    vitals: VitalsCreate,
    user_id: str = Depends(get_current_user_id)
):
    return await vitals_service.create_vitals(user_id, vitals)

@app.delete("/vitals/{vital_id}")
async def delete_vitals(
    vital_id: int,
    user_id: str = Depends(get_current_user_id)
):
    await vitals_service.delete_vitals(user_id, vital_id)
    return {"message": "Vital deleted successfully"}

# Document endpoints
@app.get("/documents", response_model=List[DocumentResponse])
async def get_documents(user_id: str = Depends(get_current_user_id)):
    return await document_service.get_user_documents(user_id)

@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed")
    
    return await document_service.upload_and_process_document(user_id, file)

@app.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    user_id: str = Depends(get_current_user_id)
):
    await document_service.delete_document(user_id, document_id)
    return {"message": "Document deleted successfully"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    user_id: str = Depends(get_current_user_id)
):
    return await chat_service.get_response(user_id, chat_request.message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
