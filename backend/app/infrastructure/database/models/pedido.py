"""
Marketplace CB - Modelos SQLAlchemy: Pedido e ItemPedido
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin


class StatusPedido(str, enum.Enum):
    AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO"
    PAGO = "PAGO"
    PREPARANDO = "PREPARANDO"
    ENVIADO = "ENVIADO"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"
    DEVOLVIDO = "DEVOLVIDO"


class PedidoModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "pedidos"

    numero_pedido: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True,
    )
    loja_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lojas.id", ondelete="RESTRICT"),
        nullable=False, index=True,
    )
    fornecedor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fornecedores.id", ondelete="RESTRICT"),
        nullable=False, index=True,
    )

    # Dados do cliente
    cliente_nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cliente_email: Mapped[str] = mapped_column(String(255), nullable=False)
    cliente_telefone: Mapped[str | None] = mapped_column(String(20))
    endereco_entrega: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Valores
    valor_produtos: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    valor_frete: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    valor_desconto: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    valor_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Comissões
    valor_comissao_plataforma: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    valor_comissao_vendedor: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)

    status: Mapped[StatusPedido] = mapped_column(
        Enum(StatusPedido, name="status_pedido_enum", create_constraint=True, native_enum=False),
        default=StatusPedido.AGUARDANDO_PAGAMENTO,
        nullable=False, index=True,
    )
    codigo_rastreio: Mapped[str | None] = mapped_column(String(100))
    observacoes: Mapped[str | None] = mapped_column(Text)

    # Relationships
    itens: Mapped[list[ItemPedidoModel]] = relationship(
        "ItemPedidoModel",
        back_populates="pedido",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Pedido {self.numero_pedido} status={self.status.value}>"


class ItemPedidoModel(UUIDMixin, Base):
    __tablename__ = "itens_pedido"

    pedido_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False,
    )
    produto_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("produtos.id", ondelete="RESTRICT"), nullable=False,
    )
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    preco_unitario: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    preco_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Snapshot
    produto_nome: Mapped[str] = mapped_column(String(255), nullable=False)
    produto_sku: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    pedido: Mapped[PedidoModel] = relationship("PedidoModel", back_populates="itens")

    def __repr__(self) -> str:
        return f"<ItemPedido {self.produto_sku} x{self.quantidade}>"
