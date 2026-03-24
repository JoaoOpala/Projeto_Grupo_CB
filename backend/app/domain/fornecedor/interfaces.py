"""
Marketplace CB - Interfaces de Repositório: Fornecedor
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.fornecedor.entities import Fornecedor


class IFornecedorRepository(ABC):
    @abstractmethod
    async def get_by_id(self, fornecedor_id: UUID) -> Fornecedor | None: ...

    @abstractmethod
    async def get_by_cnpj(self, cnpj: str) -> Fornecedor | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Fornecedor | None: ...

    @abstractmethod
    async def create(self, fornecedor: Fornecedor) -> Fornecedor: ...

    @abstractmethod
    async def update(self, fornecedor: Fornecedor) -> Fornecedor: ...

    @abstractmethod
    async def list_all(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Fornecedor], int]: ...

    @abstractmethod
    async def list_by_status(
        self, status: str, offset: int = 0, limit: int = 20
    ) -> tuple[list[Fornecedor], int]: ...
