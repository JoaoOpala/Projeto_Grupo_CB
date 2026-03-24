"""
Marketplace CB - Modelos SQLAlchemy: Estoque e Movimentação
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base, UUIDMixin


class TipoMovimentacao(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    AJUSTE = "AJUSTE"
    RESERVA = "RESERVA"
    LIBERACAO = "LIBERACAO"


class EstoqueModel(UUIDMixin, Base):
    """Visão consolidada do estoque por produto."""

    __tablename__ = "estoque"

    produto_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("produtos.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    quantidade_disponivel: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    quantidade_reservada: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    versao: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Estoque produto={self.produto_id} disp={self.quantidade_disponivel}>"


class MovimentacaoEstoqueModel(UUIDMixin, Base):
    """Log de todas as movimentações de estoque para auditoria."""

    __tablename__ = "movimentacoes_estoque"

    produto_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("produtos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pedido_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("pedidos.id", ondelete="SET NULL"),
    )
    tipo: Mapped[TipoMovimentacao] = mapped_column(
        Enum(TipoMovimentacao, name="tipo_movimentacao_enum", create_constraint=True, native_enum=False),
        nullable=False,
    )
    quantidade_anterior: Mapped[int] = mapped_column(Integer, nullable=False)
    quantidade_movimentada: Mapped[int] = mapped_column(Integer, nullable=False)
    quantidade_posterior: Mapped[int] = mapped_column(Integer, nullable=False)
    referencia: Mapped[str | None] = mapped_column(
        String(255),
        comment="Referência externa (ex: número do pedido)",
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Movimentacao {self.tipo.value} produto={self.produto_id}>"
