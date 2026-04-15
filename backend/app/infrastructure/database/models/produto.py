"""
Marketplace CB - Modelos SQLAlchemy: Produto, Categoria e ProdutoLoja
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import (
    Boolean,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON

from app.infrastructure.database.base import Base, TimestampMixin, UUIDMixin
from app.config import get_settings

# Usar JSON genérico para SQLite, JSONB para PostgreSQL
_settings = get_settings()
JsonType = JSON if _settings.is_sqlite else JSONB


class StatusProduto(str, enum.Enum):
    RASCUNHO = "RASCUNHO"
    MODERACAO = "MODERACAO"
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    REJEITADO = "REJEITADO"


class CategoriaModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "categorias"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    descricao: Mapped[str | None] = mapped_column(Text)
    categoria_pai_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categorias.id", ondelete="SET NULL"),
    )
    ativa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Self-referential
    subcategorias: Mapped[list[CategoriaModel]] = relationship(
        "CategoriaModel",
        back_populates="categoria_pai",
        cascade="all, delete-orphan",
    )
    categoria_pai: Mapped[CategoriaModel | None] = relationship(
        "CategoriaModel",
        back_populates="subcategorias",
        remote_side="CategoriaModel.id",
    )
    produtos: Mapped[list[ProdutoModel]] = relationship(
        "ProdutoModel", back_populates="categoria"
    )

    def __repr__(self) -> str:
        return f"<Categoria {self.nome}>"


class ProdutoModel(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "produtos"

    fornecedor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fornecedores.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    categoria_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categorias.id", ondelete="SET NULL"),
        index=True,
    )
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    ean: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    marca: Mapped[str | None] = mapped_column(String(255))
    modelo: Mapped[str | None] = mapped_column(String(255))
    descricao: Mapped[str | None] = mapped_column(Text)
    preco_base: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    preco_venda: Mapped[float | None] = mapped_column(Numeric(12, 2))
    estoque_disponivel: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    imagens: Mapped[dict | None] = mapped_column(JsonType, default=list)
    videos: Mapped[dict | None] = mapped_column(JsonType, default=list)
    atributos: Mapped[dict | None] = mapped_column(JsonType, default=dict)
    status: Mapped[StatusProduto] = mapped_column(
        Enum(StatusProduto, name="status_produto_enum", create_constraint=True, native_enum=False),
        default=StatusProduto.RASCUNHO,
        nullable=False,
    )
    # Medidas da embalagem
    comprimento_cm: Mapped[float | None] = mapped_column(Numeric(8, 2))
    largura_cm: Mapped[float | None] = mapped_column(Numeric(8, 2))
    altura_cm: Mapped[float | None] = mapped_column(Numeric(8, 2))
    peso_kg: Mapped[float | None] = mapped_column(Numeric(8, 3))
    # Campo definido pelo admin
    local_origem: Mapped[str | None] = mapped_column(String(500))

    # Relationships
    fornecedor: Mapped[FornecedorModel] = relationship(
        "FornecedorModel", back_populates="produtos"
    )
    categoria: Mapped[CategoriaModel | None] = relationship(
        "CategoriaModel", back_populates="produtos"
    )
    lojas: Mapped[list[ProdutoLojaModel]] = relationship(
        "ProdutoLojaModel",
        back_populates="produto",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Produto {self.sku} - {self.nome}>"


class ProdutoLojaModel(UUIDMixin, TimestampMixin, Base):
    """Tabela de associação: produtos selecionados por cada loja/vendedor."""

    __tablename__ = "produtos_loja"

    produto_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("produtos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    loja_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lojas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    preco_venda: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    margem: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    visivel: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    destaque: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    produto: Mapped[ProdutoModel] = relationship("ProdutoModel", back_populates="lojas")
    loja: Mapped[LojaModel] = relationship("LojaModel", back_populates="produtos_loja")

    def __repr__(self) -> str:
        return f"<ProdutoLoja produto={self.produto_id} loja={self.loja_id}>"
