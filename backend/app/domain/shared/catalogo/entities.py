"""
Marketplace CB - Entidades de Domínio Compartilhado: Catálogo de Produtos
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import UUID, uuid4


class StatusProduto(str, Enum):
    RASCUNHO = "RASCUNHO"
    MODERACAO = "MODERACAO"
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    REJEITADO = "REJEITADO"


@dataclass
class Categoria:
    id: UUID = field(default_factory=uuid4)
    nome: str = ""
    slug: str = ""
    descricao: str | None = None
    categoria_pai_id: UUID | None = None
    ativa: bool = True


@dataclass
class Produto:
    id: UUID = field(default_factory=uuid4)
    fornecedor_id: UUID = field(default_factory=uuid4)
    categoria_id: UUID | None = None
    sku: str = ""
    ean: str | None = None
    nome: str = ""
    marca: str | None = None
    modelo: str | None = None
    descricao: str | None = None
    preco_base: Decimal = Decimal("0.00")
    preco_venda: Decimal | None = None
    estoque_disponivel: int = 0
    imagens: list[str] = field(default_factory=list)
    videos: list[str] = field(default_factory=list)
    atributos: dict[str, Any] = field(default_factory=dict)
    status: StatusProduto = StatusProduto.RASCUNHO
    comprimento_cm: Decimal | None = None
    largura_cm: Decimal | None = None
    altura_cm: Decimal | None = None
    peso_kg: Decimal | None = None
    local_origem: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def esta_disponivel(self) -> bool:
        return self.status == StatusProduto.ATIVO and self.estoque_disponivel > 0

    def calcular_margem(self, preco_venda: Decimal) -> Decimal:
        if self.preco_base == 0:
            return Decimal("0")
        return (preco_venda - self.preco_base) / self.preco_base


@dataclass
class ProdutoLoja:
    id: UUID = field(default_factory=uuid4)
    produto_id: UUID = field(default_factory=uuid4)
    loja_id: UUID = field(default_factory=uuid4)
    preco_venda: Decimal = Decimal("0.00")
    margem: Decimal = Decimal("0.00")
    visivel: bool = True
    destaque: bool = False
