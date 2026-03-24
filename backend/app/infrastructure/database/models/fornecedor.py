"""
Marketplace CB - Modelos SQLAlchemy: Fornecedor e Condições Comerciais
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin


class TipoFornecedor(str, enum.Enum):
    INDUSTRIA = "INDUSTRIA"
    DISTRIBUIDOR = "DISTRIBUIDOR"


class StatusFornecedor(str, enum.Enum):
    PENDENTE = "PENDENTE"
    APROVADO = "APROVADO"
    REJEITADO = "REJEITADO"
    SUSPENSO = "SUSPENSO"


class FornecedorModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "fornecedores"

    razao_social: Mapped[str] = mapped_column(String(255), nullable=False)
    nome_fantasia: Mapped[str | None] = mapped_column(String(255))
    cnpj: Mapped[str] = mapped_column(String(18), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    telefone: Mapped[str | None] = mapped_column(String(20))
    tipo: Mapped[TipoFornecedor] = mapped_column(
        Enum(TipoFornecedor, name="tipo_fornecedor_enum", create_constraint=True, native_enum=False),
        nullable=False,
    )
    status: Mapped[StatusFornecedor] = mapped_column(
        Enum(StatusFornecedor, name="status_fornecedor_enum", create_constraint=True, native_enum=False),
        default=StatusFornecedor.PENDENTE,
        nullable=False,
    )
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    condicao_comercial: Mapped[CondicaoComercialModel | None] = relationship(
        "CondicaoComercialModel",
        back_populates="fornecedor",
        uselist=False,
        cascade="all, delete-orphan",
    )
    produtos: Mapped[list[ProdutoModel]] = relationship(
        "ProdutoModel",
        back_populates="fornecedor",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Fornecedor {self.razao_social} ({self.cnpj})>"


class CondicaoComercialModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "condicoes_comerciais"

    fornecedor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fornecedores.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    margem_minima: Mapped[float] = mapped_column(
        Numeric(5, 4),
        default=0.15,
        nullable=False,
    )
    prazo_entrega_dias: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    politica_devolucao: Mapped[str | None] = mapped_column(Text)

    # Relationships
    fornecedor: Mapped[FornecedorModel] = relationship(
        "FornecedorModel", back_populates="condicao_comercial"
    )

    def __repr__(self) -> str:
        return f"<CondicaoComercial fornecedor={self.fornecedor_id}>"
