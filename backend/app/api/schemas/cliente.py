"""
Marketplace CB - Schemas Pydantic: Cliente
"""

from uuid import UUID

from pydantic import EmailStr, Field

from app.api.schemas.common import BaseSchema, TimestampSchema
from app.infrastructure.database.models.cliente import StatusCliente


class ClienteCreate(BaseSchema):
    nome: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    senha: str = Field(..., min_length=6)
    cpf: str | None = Field(None, max_length=14)
    telefone: str | None = Field(None, max_length=20)
    endereco: str | None = None


class ClienteUpdate(BaseSchema):
    nome: str | None = Field(None, min_length=2, max_length=255)
    telefone: str | None = Field(None, max_length=20)
    endereco: str | None = None


class ClienteResponse(TimestampSchema):
    id: UUID
    nome: str
    email: str
    cpf: str | None
    telefone: str | None
    endereco: str | None
    status: StatusCliente
    email_verificado: bool
