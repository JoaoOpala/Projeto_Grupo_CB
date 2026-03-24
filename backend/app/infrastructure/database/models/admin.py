"""
Marketplace CB - Modelos SQLAlchemy: Administrador
"""

from __future__ import annotations

import enum

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin


class RoleAdminEnum(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    MODERADOR = "MODERADOR"
    SUPORTE = "SUPORTE"


class AdminModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "admins"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleAdminEnum] = mapped_column(
        Enum(RoleAdminEnum, name="role_admin_enum", create_constraint=True, native_enum=False),
        default=RoleAdminEnum.MODERADOR,
        nullable=False,
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Admin {self.nome} ({self.role.value})>"
