"""
Marketplace CB - Interfaces de Domínio: Cliente
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.cliente.entities import Cliente


class IClienteRepository(ABC):
    @abstractmethod
    async def get_by_id(self, cliente_id: UUID) -> Cliente | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Cliente | None: ...

    @abstractmethod
    async def get_by_cpf(self, cpf: str) -> Cliente | None: ...

    @abstractmethod
    async def create_from_model(self, model: object) -> object: ...

    @abstractmethod
    async def update(self, cliente: Cliente) -> Cliente: ...

    @abstractmethod
    async def list_all(self, offset: int, limit: int) -> tuple[list[Cliente], int]: ...
