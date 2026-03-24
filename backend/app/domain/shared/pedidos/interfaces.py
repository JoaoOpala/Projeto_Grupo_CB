"""
Marketplace CB - Interfaces de Repositório: Pedidos
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.shared.pedidos.entities import Pedido


class IPedidoRepository(ABC):
    @abstractmethod
    async def get_by_id(self, pedido_id: UUID) -> Pedido | None: ...

    @abstractmethod
    async def get_by_numero(self, numero_pedido: str) -> Pedido | None: ...

    @abstractmethod
    async def list_by_loja(
        self, loja_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]: ...

    @abstractmethod
    async def list_by_fornecedor(
        self, fornecedor_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]: ...

    @abstractmethod
    async def create(self, pedido: Pedido) -> Pedido: ...

    @abstractmethod
    async def update(self, pedido: Pedido) -> Pedido: ...
