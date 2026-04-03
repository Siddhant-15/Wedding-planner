# app/core/supabase.py
from supabase import Client, create_client
from app.config import settings  # ← assuming you have settings with SUPABASE_URL etc.


def get_supabase_client() -> Client:
    """
    Returns a singleton-like Supabase client instance.
    Uses service role key → full admin access (be careful in production!)
    """
    if not hasattr(get_supabase_client, "_client"):
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        
        if not url or not key:
            raise ValueError(
                "Missing Supabase configuration. "
                "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment."
            )
        
        get_supabase_client._client = create_client(url, key)
    
    return get_supabase_client._client