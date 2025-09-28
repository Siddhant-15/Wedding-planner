# from fastapi import APIRouter
# from pydantic import BaseModel
# from typing import List
# from supabase import create_client
# from app.config import settings

# # Supabase setup
# SUPABASE_URL = settings.SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY
# supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# # Pydantic schema for request body
# class DeleteFilesRequest(BaseModel):
#     file_paths: List[str]

# # Router
# router = APIRouter()

# @router.delete("/storage/delete-files")
# def delete_files_api(request: DeleteFilesRequest):
#     """
#     Delete files from Supabase Storage.
#     Pass a list of file paths in the request body.

#     Example:
#     {
#       "file_paths": ["services/uuid1.jpg", "services/uuid2.jpg"]
#     }
#     """
#     try:
#         res = supabase.storage.from_("service-images").remove(request.file_paths)
#         return {"deleted": request.file_paths, "response": res}
#     except Exception as e:
#         return {"error": str(e)}
