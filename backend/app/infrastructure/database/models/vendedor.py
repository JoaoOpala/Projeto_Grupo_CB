"""
Marketplace CB - Modelos SQLAlchemy: Vendedor e Loja
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin


class TipoPessoa(str, enum.Enum):
    FISICA = "FISICA"
    JURIDICA = "JURIDICA"


class StatusVendedor(str, enum.Enum):
    PENDENTE = "PENDENTE"
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"


class VendedorModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "vendedores"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    cpf_cnpj: Mapped[str] = mapped_column(String(18), unique=True, nullable=False, index=True)
    telefone: Mapped[str | None] = mapped_column(String(20))
    tipo_pessoa: Mapped[TipoPessoa] = mapped_column(
        Enum(TipoPessoa, name="tipo_pessoa_enum", create_constraint=True, native_enum=False),
        nullable=False,
    )
    status: Mapped[StatusVendedor] = mapped_column(
        Enum(StatusVendedor, name="status_vendedor_enum", create_constraint=True, native_enum=False),
        default=StatusVendedor.PENDENTE,
        nullable=False,
    )
    comissao_padrao: Mapped[float] = mapped_column(
        Numeric(5, 4),
        default=0.10,
        nullable=False,
    )
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships — use string references to avoid circular imports
    loja: Mapped[LojaModel | None] = relationship(
        "LojaModel",
        back_populates="vendedor",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Vendedor {self.nome} ({self.email})>"


class LojaModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lojas"

    vendedor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("vendedores.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    nome_loja: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    descricao: Mapped[str | None] = mapped_column(Text)
    logo_url: Mapped[str | None] = mapped_column(String(512))
    ativa: Mapped[bool] = mapped_column(default=True, nullable=False)

    # Relationships
    vendedor: Mapped[VendedorModel] = relationship("VendedorModel", back_populates="loja")
    produtos_loja: Mapped[list[ProdutoLojaModel]] = relationship(
        "ProdutoLojaModel",
        back_populates="loja",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Loja {self.nome_loja}>"
