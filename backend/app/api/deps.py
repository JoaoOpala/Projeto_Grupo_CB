"""
Marketplace CB - Dependency Injection
Dependências compartilhadas injetadas nos routers via FastAPI Depends.
"""

from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.infrastructure.security.jwt import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_session(db: AsyncSession = Depends(get_db)) -> AsyncGenerator[AsyncSession, None]:
    yield db


async def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> dict:
    """Extrai e valida o payload do token JWT."""
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


async def get_current_user_id(payload: dict = Depends(get_current_user_payload)) -> UUID:
    """Retorna o UUID do usuário autenticado."""
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    return UUID(sub)


def require_role(allowed_roles: list[str]):
    """Factory de dependency que verifica role do usuário."""

    async def _check_role(payload: dict = Depends(get_current_user_payload)) -> dict:
        user_role = payload.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente",
            )
        return payload

    return _check_role
