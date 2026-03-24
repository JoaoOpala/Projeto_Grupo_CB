"""
Marketplace CB - Interfaces de Repositório: Vendedor
Contratos abstratos seguindo Dependency Inversion Principle.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.vendedor.entities import Vendedor, Loja


class IVendedorRepository(ABC):
    @abstractmethod
    async def get_by_id(self, vendedor_id: UUID) -> Vendedor | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Vendedor | None: ...

    @abstractmethod
    async def get_by_cpf_cnpj(self, cpf_cnpj: str) -> Vendedor | None: ...

    @abstractmethod
    async def create(self, vendedor: Vendedor) -> Vendedor: ...

    @abstractmethod
    async def update(self, vendedor: Vendedor) -> Vendedor: ...

    @abstractmethod
    async def list_all(self, offset: int = 0, limit: int = 20) -> tuple[list[Vendedor], int]: ...


class ILojaRepository(ABC):
    @abstractmethod
    async def get_by_id(self, loja_id: UUID) -> Loja | None: ...

    @abstractmethod
    async def get_by_vendedor_id(self, vendedor_id: UUID) -> Loja | None: ...

    @abstractmethod
    async def get_by_slug(self, slug: str) -> Loja | None: ...

    @abstractmethod
    async def create(self, loja: Loja) -> Loja: ...

    @abstractmethod
    async def update(self, loja: Loja) -> Loja: ...
