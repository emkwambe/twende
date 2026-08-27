"""Shared FastAPI dependencies."""
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from auth_service import get_current_user as _get_current_user_from_service
from database import get_db

security = HTTPBearer(auto_error=False)


def _get_auth_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials]
) -> str:
    if credentials:
        return credentials.credentials
    auth_header = request.headers.get("Authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:]
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    token = _get_auth_token(request, credentials)
    return _get_current_user_from_service(db, token)
