import os
import io
import PyPDF2
from typing import List
from datetime import datetime
from fastapi import HTTPException, UploadFile
from app.database import get_supabase_client
from app.models import DocumentResponse

class DocumentService:
    def __init__(self):
        self.supabase = get_supabase_client()

    async def get_user_documents(self, user_id: str) -> List[DocumentResponse]:
        """Get all documents for a user"""
        try:
            response = self.supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            if response.data:
                return [DocumentResponse(**doc) for doc in response.data]
            return []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching documents: {str(e)}")

    async def upload_and_process_document(self, user_id: str, file: UploadFile) -> DocumentResponse:
        """Upload a document, extract text, and store in database"""
        try:
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Extract text based on file type
            extracted_text = ""
            if file.filename.lower().endswith('.pdf'):
                extracted_text = self._extract_text_from_pdf(file_content)
            elif file.filename.lower().endswith('.txt'):
                extracted_text = file_content.decode('utf-8')
            
            # Upload file to Supabase Storage
            file_path = f"documents/{user_id}/{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            
            # Upload to storage
            storage_response = self.supabase.storage.from_("documents").upload(
                file_path, 
                file_content,
                {"content-type": file.content_type}
            )
            
            if not storage_response:
                raise HTTPException(status_code=500, detail="Failed to upload file to storage")
            
            # Get public URL
            file_url = self.supabase.storage.from_("documents").get_public_url(file_path)
            
            # Store document metadata in database
            document_data = {
                "user_id": user_id,
                "file_name": file.filename,
                "file_url": file_url,
                "file_size": file_size,
                "file_type": file.content_type or "application/octet-stream",
                "extracted_text": extracted_text,
                "created_at": datetime.utcnow().isoformat()
            }
            
            db_response = self.supabase.table("documents").insert(document_data).execute()
            
            if db_response.data:
                return DocumentResponse(**db_response.data[0])
            else:
                raise HTTPException(status_code=500, detail="Failed to save document metadata")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

    async def delete_document(self, user_id: str, document_id: int):
        """Delete a document and its file"""
        try:
            # Get document info first
            response = self.supabase.table("documents").select("*").eq("id", document_id).eq("user_id", user_id).execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="Document not found or access denied")
            
            document = response.data[0]
            
            # Delete from storage
            try:
                # Extract file path from URL
                file_url = document["file_url"]
                file_path = file_url.split("/documents/")[-1] if "/documents/" in file_url else None
                
                if file_path:
                    self.supabase.storage.from_("documents").remove([file_path])
            except Exception as e:
                # Log error but continue with database deletion
                print(f"Error deleting file from storage: {e}")
            
            # Delete from database
            self.supabase.table("documents").delete().eq("id", document_id).eq("user_id", user_id).execute()
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

    def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF content using PyPDF2"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

    async def get_document_summary(self, user_id: str) -> dict:
        """Get a summary of user's documents"""
        try:
            response = self.supabase.table("documents").select("*").eq("user_id", user_id).execute()
            
            if not response.data:
                return {
                    "total_documents": 0,
                    "total_size": 0,
                    "file_types": {}
                }
            
            documents = response.data
            total_size = sum(doc.get("file_size", 0) for doc in documents)
            file_types = {}
            
            for doc in documents:
                file_type = doc.get("file_type", "unknown")
                file_types[file_type] = file_types.get(file_type, 0) + 1
            
            return {
                "total_documents": len(documents),
                "total_size": total_size,
                "file_types": file_types
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching document summary: {str(e)}")
