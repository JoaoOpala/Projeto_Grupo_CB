"""
Marketplace CB - Interfaces de Repositório: Estoque
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.shared.estoque.entities import Estoque, MovimentacaoEstoque


class IEstoqueRepository(ABC):
    @abstractmethod
    async def get_by_produto_id(self, produto_id: UUID) -> Estoque | None: ...

    @abstractmethod
    async def get_by_produto_id_with_lock(self, produto_id: UUID) -> Estoque | None:
        """Obtém estoque com lock pessimista (SELECT FOR UPDATE)."""
        ...

    @abstractmethod
    async def create(self, estoque: Estoque) -> Estoque: ...

    @abstractmethod
    async def update(self, estoque: Estoque) -> Estoque: ...


class IMovimentacaoEstoqueRepository(ABC):
    @abstractmethod
    async def create(self, movimentacao: MovimentacaoEstoque) -> MovimentacaoEstoque: ...

    @abstractmethod
    async def list_by_produto(
        self, produto_id: UUID, offset: int = 0, limit: int = 50
    ) -> tuple[list[MovimentacaoEstoque], int]: ...
