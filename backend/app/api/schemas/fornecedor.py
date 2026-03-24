"""
Marketplace CB - Schemas Pydantic: Fornecedor e Condições Comerciais
"""

from decimal import Decimal
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.api.schemas.common import BaseSchema, PaginatedResponse, TimestampSchema
from app.infrastructure.database.models.fornecedor import (
    StatusFornecedor,
    TipoFornecedor,
)


# ── Fornecedor ───────────────────────────────────────────


class FornecedorCreate(BaseSchema):
    razao_social: str = Field(..., min_length=3, max_length=255)
    nome_fantasia: str | None = None
    cnpj: str = Field(..., min_length=14, max_length=18)
    email: EmailStr
    telefone: str | None = None
    tipo: TipoFornecedor
    senha: str = Field(..., min_length=8)

    @field_validator("cnpj")
    @classmethod
    def validate_cnpj(cls, v: str) -> str:
        cleaned = v.replace(".", "").replace("-", "").replace("/", "")
        if len(cleaned) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        return v


class FornecedorUpdate(BaseSchema):
    razao_social: str | None = Field(None, min_length=3, max_length=255)
    nome_fantasia: str | None = None
    telefone: str | None = None
    status: StatusFornecedor | None = None


class FornecedorResponse(TimestampSchema):
    id: UUID
    razao_social: str
    nome_fantasia: str | None
    cnpj: str
    email: str
    telefone: str | None
    tipo: TipoFornecedor
    status: StatusFornecedor


class FornecedorListResponse(PaginatedResponse):
    items: list[FornecedorResponse]


# ── Condições Comerciais ─────────────────────────────────


class CondicaoComercialCreate(BaseSchema):
    margem_minima: Decimal = Field(..., ge=0, le=1)
    prazo_entrega_dias: int = Field(..., ge=1)
    politica_devolucao: str | None = None


class CondicaoComercialUpdate(BaseSchema):
    margem_minima: Decimal | None = Field(None, ge=0, le=1)
    prazo_entrega_dias: int | None = Field(None, ge=1)
    politica_devolucao: str | None = None


class CondicaoComercialResponse(TimestampSchema):
    id: UUID
    fornecedor_id: UUID
    margem_minima: Decimal
    prazo_entrega_dias: int
    politica_devolucao: str | None
