"""
app/Dependencies/AdminAuth.py

FastAPI dependency that validates the admin JWT and returns the
current admin payload dict.

Usage:
    current_admin: dict = Depends(get_current_admin)
    super_admin:   dict = Depends(require_super_admin)
"""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token

_bearer = HTTPBearer(auto_error=True)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    Decode the Bearer token and verify:
      - token type is 'access'
      - role is 'admin'

    Returns a dict with keys: id, email, role, sub
    """
    token = credentials.credentials
    payload = decode_token(token, refresh=False)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if getattr(payload, "role", None) != "admin":
        print("Role",getattr(payload, "role", None))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # decode_token returns a TokenPayload-like object; normalise to dict
    return {
        "id":    getattr(payload, "id",    None),
        "email": getattr(payload, "sub",   None),
        "role":  getattr(payload, "role",  "admin"),
    }


async def require_super_admin(
    current_admin: dict = Depends(get_current_admin),
) -> dict:
    """Only allow super_admin role."""
    if current_admin.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super-admin access required",
        )
    return current_admin


async def require_reviewer_or_above(
    current_admin: dict = Depends(get_current_admin),
) -> dict:
    """Allow reviewer, operations, super_admin — block support-only accounts."""
    allowed = {"reviewer", "operations", "super_admin", "admin"}
    print("role",current_admin.get("role"))
    if current_admin.get("role") not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviewer or higher access required",
        )
    return current_admin