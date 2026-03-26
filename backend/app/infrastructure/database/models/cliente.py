"""
Marketplace CB - Modelo SQLAlchemy: Cliente
"""

from __future__ import annotations

import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin


class StatusCliente(str, enum.Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"


class ClienteModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "clientes"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    cpf: Mapped[str | None] = mapped_column(String(14), unique=True, index=True)
    telefone: Mapped[str | None] = mapped_column(String(20))
    endereco: Mapped[str | None] = mapped_column(Text)
    status: Mapped[StatusCliente] = mapped_column(
        Enum(StatusCliente, name="status_cliente_enum", create_constraint=True, native_enum=False),
        default=StatusCliente.ATIVO,
        nullable=False,
    )
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<Cliente {self.nome} ({self.email})>"
