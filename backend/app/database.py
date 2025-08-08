import os
from supabase import create_client, Client
from typing import Optional

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get or create Supabase client singleton"""
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        
        _supabase_client = create_client(supabase_url, supabase_key)
    
    return _supabase_client

def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with service role key"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    
    return create_client(supabase_url, supabase_service_key)
