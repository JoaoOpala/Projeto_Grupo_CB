"""
Marketplace CB - Interfaces de Repositório: Catálogo
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.shared.catalogo.entities import Produto, ProdutoLoja


class IProdutoRepository(ABC):
    @abstractmethod
    async def get_by_id(self, produto_id: UUID) -> Produto | None: ...

    @abstractmethod
    async def get_by_sku(self, sku: str) -> Produto | None: ...

    @abstractmethod
    async def list_by_fornecedor(
        self, fornecedor_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]: ...

    @abstractmethod
    async def list_ativos(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]: ...

    @abstractmethod
    async def create(self, produto: Produto) -> Produto: ...

    @abstractmethod
    async def update(self, produto: Produto) -> Produto: ...


class IProdutoLojaRepository(ABC):
    @abstractmethod
    async def get_by_id(self, produto_loja_id: UUID) -> ProdutoLoja | None: ...

    @abstractmethod
    async def list_by_loja(
        self, loja_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[ProdutoLoja], int]: ...

    @abstractmethod
    async def find_by_produto_id(self, produto_id: UUID) -> list[ProdutoLoja]: ...

    @abstractmethod
    async def create(self, produto_loja: ProdutoLoja) -> ProdutoLoja: ...

    @abstractmethod
    async def update(self, produto_loja: ProdutoLoja) -> ProdutoLoja: ...
