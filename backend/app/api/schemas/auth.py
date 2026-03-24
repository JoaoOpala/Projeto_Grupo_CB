"""
Marketplace CB - Schemas Pydantic: Autenticação
"""

from pydantic import EmailStr, Field

from app.api.schemas.common import BaseSchema


class LoginRequest(BaseSchema):
    email: EmailStr
    senha: str = Field(..., min_length=1)


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseSchema):
    refresh_token: str
