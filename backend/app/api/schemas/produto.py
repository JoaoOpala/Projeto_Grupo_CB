"""
Marketplace CB - Schemas Pydantic: Produto, Categoria e ProdutoLoja
"""

from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import Field

from app.api.schemas.common import BaseSchema, PaginatedResponse, TimestampSchema
from app.infrastructure.database.models.produto import StatusProduto


# ── Categoria ────────────────────────────────────────────


class CategoriaCreate(BaseSchema):
    nome: str = Field(..., min_length=2, max_length=255)
    descricao: str | None = None
    categoria_pai_id: UUID | None = None


class CategoriaResponse(TimestampSchema):
    id: UUID
    nome: str
    slug: str
    descricao: str | None
    categoria_pai_id: UUID | None
    ativa: bool


# ── Produto ──────────────────────────────────────────────


class ProdutoCreate(BaseSchema):
    categoria_id: UUID | None = None
    sku: str = Field(..., min_length=3, max_length=100)
    nome: str = Field(..., min_length=3, max_length=255)
    descricao: str | None = None
    preco_base: Decimal = Field(..., gt=0)
    preco_venda_sugerido: Decimal = Field(..., gt=0)
    estoque_disponivel: int = Field(default=0, ge=0)
    imagens: list[str] = Field(default_factory=list)
    atributos: dict[str, Any] = Field(default_factory=dict)
    peso_kg: Decimal | None = Field(None, gt=0)


class ProdutoUpdate(BaseSchema):
    categoria_id: UUID | None = None
    nome: str | None = Field(None, min_length=3, max_length=255)
    descricao: str | None = None
    preco_base: Decimal | None = Field(None, gt=0)
    preco_venda_sugerido: Decimal | None = Field(None, gt=0)
    imagens: list[str] | None = None
    atributos: dict[str, Any] | None = None
    status: StatusProduto | None = None
    peso_kg: Decimal | None = Field(None, gt=0)


class ProdutoResponse(TimestampSchema):
    id: UUID
    fornecedor_id: UUID
    categoria_id: UUID | None
    sku: str
    nome: str
    descricao: str | None
    preco_base: Decimal
    preco_venda_sugerido: Decimal
    estoque_disponivel: int
    imagens: list[str] | None
    atributos: dict[str, Any] | None
    status: StatusProduto
    peso_kg: Decimal | None


class ProdutoListResponse(PaginatedResponse):
    items: list[ProdutoResponse]


# ── ProdutoLoja ──────────────────────────────────────────


class ProdutoLojaCreate(BaseSchema):
    produto_id: UUID
    preco_venda: Decimal = Field(..., gt=0)


class ProdutoLojaUpdate(BaseSchema):
    preco_venda: Decimal | None = Field(None, gt=0)
    visivel: bool | None = None
    destaque: bool | None = None


class ProdutoLojaResponse(TimestampSchema):
    id: UUID
    produto_id: UUID
    loja_id: UUID
    preco_venda: Decimal
    margem: Decimal
    visivel: bool
    destaque: bool
