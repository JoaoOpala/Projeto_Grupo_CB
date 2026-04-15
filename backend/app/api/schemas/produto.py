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
    # Identificação
    sku: str = Field(..., min_length=3, max_length=100)
    ean: str = Field(..., min_length=8, max_length=20, description="Código de barras EAN")
    nome: str = Field(..., min_length=3, max_length=255)
    marca: str = Field(..., min_length=1, max_length=255)
    modelo: str = Field(..., min_length=1, max_length=255)
    descricao: str | None = None
    categoria_id: UUID | None = None

    # Preço (base definido pelo fornecedor)
    preco_base: Decimal = Field(..., gt=0)

    # Estoque
    estoque_disponivel: int = Field(default=0, ge=0)

    # Mídia
    imagens: list[str] = Field(default_factory=list, description="Mínimo 1, máximo 15 fotos")
    videos: list[str] = Field(default_factory=list)

    # Medidas da embalagem
    comprimento_cm: Decimal = Field(..., gt=0, description="Comprimento da embalagem em cm")
    largura_cm: Decimal = Field(..., gt=0, description="Largura da embalagem em cm")
    altura_cm: Decimal = Field(..., gt=0, description="Altura da embalagem em cm")
    peso_kg: Decimal = Field(..., gt=0, description="Peso da embalagem em kg")

    # Atributos extras
    atributos: dict[str, Any] = Field(default_factory=dict)

    # Local de origem (endereço do fornecedor)
    local_origem: str | None = None


class ProdutoUpdate(BaseSchema):
    categoria_id: UUID | None = None
    nome: str | None = Field(None, min_length=3, max_length=255)
    marca: str | None = Field(None, min_length=1, max_length=255)
    modelo: str | None = Field(None, min_length=1, max_length=255)
    descricao: str | None = None
    preco_base: Decimal | None = Field(None, gt=0)
    imagens: list[str] | None = None
    videos: list[str] | None = None
    atributos: dict[str, Any] | None = None
    status: StatusProduto | None = None
    comprimento_cm: Decimal | None = Field(None, gt=0)
    largura_cm: Decimal | None = Field(None, gt=0)
    altura_cm: Decimal | None = Field(None, gt=0)
    peso_kg: Decimal | None = Field(None, gt=0)
    local_origem: str | None = None


class ProdutoAdminCreate(BaseSchema):
    """Schema para o Admin criar um produto em nome de um fornecedor."""
    fornecedor_id: UUID
    sku: str = Field(..., min_length=3, max_length=100)
    ean: str = Field(..., min_length=8, max_length=20)
    nome: str = Field(..., min_length=3, max_length=255)
    marca: str = Field(..., min_length=1, max_length=255)
    modelo: str = Field(..., min_length=1, max_length=255)
    descricao: str | None = None
    categoria_id: UUID | None = None
    preco_base: Decimal = Field(..., gt=0)
    preco_venda: Decimal | None = Field(None, gt=0)
    estoque_disponivel: int = Field(default=0, ge=0)
    imagens: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    comprimento_cm: Decimal = Field(..., gt=0)
    largura_cm: Decimal = Field(..., gt=0)
    altura_cm: Decimal = Field(..., gt=0)
    peso_kg: Decimal = Field(..., gt=0)
    local_origem: str | None = None
    atributos: dict[str, Any] = Field(default_factory=dict)


class ProdutoAdminUpdate(BaseSchema):
    """Schema exclusivo para o Admin atualizar campos gerenciados pela plataforma."""
    preco_venda: Decimal | None = Field(None, gt=0, description="Preço de venda definido pelo Admin")
    local_origem: str | None = None
    status: StatusProduto | None = None


class ProdutoResponse(TimestampSchema):
    id: UUID
    fornecedor_id: UUID
    categoria_id: UUID | None
    sku: str
    ean: str | None
    nome: str
    marca: str | None
    modelo: str | None
    descricao: str | None
    preco_base: Decimal
    preco_venda: Decimal | None
    estoque_disponivel: int
    imagens: list[str] | None
    videos: list[str] | None
    atributos: dict[str, Any] | None
    status: StatusProduto
    comprimento_cm: Decimal | None
    largura_cm: Decimal | None
    altura_cm: Decimal | None
    peso_kg: Decimal | None
    local_origem: str | None


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
