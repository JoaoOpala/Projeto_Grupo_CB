"""
Marketplace CB - Schemas Compartilhados
Schemas Pydantic reutilizáveis em múltiplos módulos.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Schema base com configuração padrão."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class TimestampSchema(BaseSchema):
    created_at: datetime
    updated_at: datetime


class PaginationParams(BaseSchema):
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseSchema):
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseSchema):
    message: str


class IDResponse(BaseSchema):
    id: UUID


class EnderecoSchema(BaseSchema):
    logradouro: str
    numero: str
    complemento: str | None = None
    bairro: str
    cidade: str
    estado: str
    cep: str
    pais: str = "BR"
