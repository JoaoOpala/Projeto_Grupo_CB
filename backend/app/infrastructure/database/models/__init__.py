"""
Marketplace CB - SQLAlchemy ORM Models
Importação centralizada de todos os modelos para registro no metadata.
"""

from app.infrastructure.database.models.vendedor import VendedorModel, LojaModel
from app.infrastructure.database.models.fornecedor import (
    FornecedorModel,
    CondicaoComercialModel,
)
from app.infrastructure.database.models.produto import (
    ProdutoModel,
    CategoriaModel,
    ProdutoLojaModel,
)
from app.infrastructure.database.models.pedido import PedidoModel, ItemPedidoModel
from app.infrastructure.database.models.estoque import (
    EstoqueModel,
    MovimentacaoEstoqueModel,
)
from app.infrastructure.database.models.admin import AdminModel

__all__ = [
    "VendedorModel",
    "LojaModel",
    "FornecedorModel",
    "CondicaoComercialModel",
    "ProdutoModel",
    "CategoriaModel",
    "ProdutoLojaModel",
    "PedidoModel",
    "ItemPedidoModel",
    "EstoqueModel",
    "MovimentacaoEstoqueModel",
    "AdminModel",
]
