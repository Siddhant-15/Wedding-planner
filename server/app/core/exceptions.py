# ─────────────────────────────────────────────────────────────────────────────
# core/exceptions.py
# ─────────────────────────────────────────────────────────────────────────────
from fastapi import Request
from fastapi.responses import JSONResponse
 
 
class AppError(Exception):
    status_code: int = 500
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
 
class NotFoundError(AppError):
    status_code = 404
 
class ConflictError(AppError):
    status_code = 409
 
class ForbiddenError(AppError):
    status_code = 403
 
class ValidationError(AppError):
    status_code = 422
 
 
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message, "data": None},
    )