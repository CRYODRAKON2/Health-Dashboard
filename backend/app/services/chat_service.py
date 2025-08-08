import os
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.chains import RetrievalQA
from app.database import get_supabase_client
from app.models import ChatResponse

class ChatService:
    def __init__(self):
        self.supabase = get_supabase_client()
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def get_response(self, user_id: str, message: str) -> ChatResponse:
        """Get AI response using RAG with user's documents"""
        try:
            # Get user's documents
            documents = await self._get_user_documents(user_id)
            
            if not documents:
                # No documents available, provide general health advice
                response = await self._get_general_health_response(message)
                return ChatResponse(
                    response=response,
                    sources=None,
                    timestamp=datetime.utcnow()
                )
            
            # For now, use all documents as context (simplified approach)
            context = self._create_simple_context(documents)
            
            # Generate response using Gemini
            prompt = self._create_prompt(message, context)
            response = await self._generate_response(prompt)
            
            # Extract sources
            sources = [doc.get('file_name', 'Unknown') for doc in documents]
            
            return ChatResponse(
                response=response,
                sources=sources,
                timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"Error in get_response: {e}")
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    async def _get_user_documents(self, user_id: str) -> List[dict]:
        """Get user's documents from database"""
        try:
            response = self.supabase.table("documents").select("extracted_text, file_name").eq("user_id", user_id).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching user documents: {e}")
            return []

    async def _create_vector_store(self, documents: List[dict]):
        """Create vector store from documents"""
        try:
            # Prepare documents for vector store
            texts = []
            metadatas = []
            
            for doc in documents:
                if doc.get("extracted_text"):
                    # Split text into chunks
                    chunks = self.text_splitter.split_text(doc["extracted_text"])
                    
                    for chunk in chunks:
                        texts.append(chunk)
                        metadatas.append({"source": doc["file_name"]})
            
            if not texts:
                return None
            
            # Create embeddings and vector store
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=os.getenv("GEMINI_API_KEY")
            )
            
            # For simplicity, we'll use a simple similarity search instead of full vector store
            # In production, you'd use SupabaseVectorStore or similar
            return SimpleVectorStore(texts, metadatas, embeddings)
            
        except Exception as e:
            print(f"Error creating vector store: {e}")
            return None

    def _create_simple_context(self, documents) -> str:
        """Create context from all documents"""
        context_parts = []
        for doc in documents:
            if doc.get('extracted_text'):
                context_parts.append(f"From {doc.get('file_name', 'Unknown')}:\n{doc['extracted_text']}")
        
        return "\n\n".join(context_parts)

    def _create_context(self, relevant_docs) -> str:
        """Create context from relevant documents"""
        context_parts = []
        for doc in relevant_docs:
            context_parts.append(f"From {doc.metadata.get('source', 'Unknown')}:\n{doc.page_content}")
        
        return "\n\n".join(context_parts)

    def _create_prompt(self, message: str, context: str) -> str:
        """Create prompt for Gemini"""
        return f"""You are a helpful health assistant. Use the following context from the user's medical documents to answer their question. If the context doesn't contain relevant information, provide general health advice but always mention that you're not a doctor and they should consult healthcare professionals for medical decisions.

Context from user's documents:
{context}

User's question: {message}

Please provide a helpful, accurate, and safe response:"""

    async def _generate_response(self, prompt: str) -> str:
        """Generate response using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating response: {e}")
            # Return a more helpful error message
            return f"I apologize, but I'm having trouble generating a response right now. Error: {str(e)}"

    async def _get_general_health_response(self, message: str) -> str:
        """Get general health response when no documents are available"""
        prompt = f"""You are a helpful health assistant. The user has asked: {message}

Please provide general health information and advice. Always remind them that you're not a doctor and they should consult healthcare professionals for medical decisions.

Response:"""
        
        return await self._generate_response(prompt)


class SimpleVectorStore:
    """Simple vector store implementation for similarity search"""
    
    def __init__(self, texts, metadatas, embeddings):
        self.texts = texts
        self.metadatas = metadatas
        self.embeddings = embeddings
        self.embeddings_list = embeddings.embed_documents(texts)
    
    def similarity_search(self, query: str, k: int = 3):
        """Simple similarity search using cosine similarity"""
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        # Get query embedding
        query_embedding = self.embeddings.embed_query(query)
        
        # Calculate similarities
        similarities = cosine_similarity([query_embedding], self.embeddings_list)[0]
        
        # Get top k results
        top_indices = np.argsort(similarities)[-k:][::-1]
        
        # Create document objects
        from langchain.schema import Document
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Minimum similarity threshold
                doc = Document(
                    page_content=self.texts[idx],
                    metadata=self.metadatas[idx]
                )
                results.append(doc)
        
        return results
