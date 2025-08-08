import os
from fastapi import HTTPException, Depends, Header
from typing import Optional
from app.database import get_supabase_client

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from Supabase Auth token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.replace("Bearer ", "")
        
        # Verify token with Supabase
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user.user
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Get current user ID from Supabase Auth token"""
    user = await get_current_user(authorization)
    return user.id
