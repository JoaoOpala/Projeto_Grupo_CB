"""
Marketplace CB - Schemas Pydantic: Pedido e ItemPedido
"""

from decimal import Decimal
from uuid import UUID

from pydantic import EmailStr, Field

from app.api.schemas.common import (
    BaseSchema,
    EnderecoSchema,
    PaginatedResponse,
    TimestampSchema,
)
from app.infrastructure.database.models.pedido import StatusPedido


# ── ItemPedido ───────────────────────────────────────────


class ItemPedidoCreate(BaseSchema):
    produto_id: UUID
    quantidade: int = Field(..., ge=1)


class ItemPedidoResponse(BaseSchema):
    id: UUID
    produto_id: UUID
    quantidade: int
    preco_unitario: Decimal
    preco_total: Decimal
    produto_nome: str
    produto_sku: str


# ── Pedido ───────────────────────────────────────────────


class PedidoCreate(BaseSchema):
    loja_id: UUID
    cliente_nome: str = Field(..., min_length=3, max_length=255)
    cliente_email: EmailStr
    cliente_telefone: str | None = None
    endereco_entrega: EnderecoSchema
    itens: list[ItemPedidoCreate] = Field(..., min_length=1)


class PedidoUpdateStatus(BaseSchema):
    status: StatusPedido
    codigo_rastreio: str | None = None
    observacoes: str | None = None


class PedidoResponse(TimestampSchema):
    id: UUID
    numero_pedido: str
    loja_id: UUID
    fornecedor_id: UUID
    cliente_nome: str
    cliente_email: str
    cliente_telefone: str | None
    endereco_entrega: dict
    valor_produtos: Decimal
    valor_frete: Decimal
    valor_desconto: Decimal
    valor_total: Decimal
    valor_comissao_plataforma: Decimal
    valor_comissao_vendedor: Decimal
    status: StatusPedido
    codigo_rastreio: str | None
    observacoes: str | None
    itens: list[ItemPedidoResponse]


class PedidoListResponse(PaginatedResponse):
    items: list[PedidoResponse]
