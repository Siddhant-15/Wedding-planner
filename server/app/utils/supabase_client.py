from supabase import create_client
from app.config import settings

# Get keys from environment variables (recommended)
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY

# Initialize client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
