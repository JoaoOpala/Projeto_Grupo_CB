"""
Marketplace CB - Schemas Pydantic: Vendedor e Loja
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.api.schemas.common import BaseSchema, PaginatedResponse, TimestampSchema
from app.infrastructure.database.models.vendedor import StatusVendedor, TipoPessoa


# ── Vendedor ─────────────────────────────────────────────


class VendedorCreate(BaseSchema):
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    cpf_cnpj: str = Field(..., min_length=11, max_length=18)
    telefone: str | None = None
    tipo_pessoa: TipoPessoa
    senha: str = Field(..., min_length=8)

    @field_validator("cpf_cnpj")
    @classmethod
    def validate_cpf_cnpj(cls, v: str) -> str:
        cleaned = v.replace(".", "").replace("-", "").replace("/", "")
        if len(cleaned) not in (11, 14):
            raise ValueError("CPF deve ter 11 dígitos ou CNPJ 14 dígitos")
        return v


class VendedorUpdate(BaseSchema):
    nome: str | None = Field(None, min_length=3, max_length=255)
    telefone: str | None = None
    status: StatusVendedor | None = None


class VendedorResponse(TimestampSchema):
    id: UUID
    nome: str
    email: str
    cpf_cnpj: str
    telefone: str | None
    tipo_pessoa: TipoPessoa
    status: StatusVendedor
    comissao_padrao: Decimal


class VendedorListResponse(PaginatedResponse):
    items: list[VendedorResponse]


# ── Loja ─────────────────────────────────────────────────


class LojaCreate(BaseSchema):
    nome_loja: str = Field(..., min_length=3, max_length=255)
    descricao: str | None = None
    logo_url: str | None = None


class LojaUpdate(BaseSchema):
    nome_loja: str | None = Field(None, min_length=3, max_length=255)
    descricao: str | None = None
    logo_url: str | None = None
    ativa: bool | None = None


class LojaResponse(TimestampSchema):
    id: UUID
    vendedor_id: UUID
    nome_loja: str
    slug: str
    descricao: str | None
    logo_url: str | None
    ativa: bool
