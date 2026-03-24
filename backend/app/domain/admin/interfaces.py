"""
Marketplace CB - Interfaces de Repositório: Admin
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.admin.entities import Admin


class IAdminRepository(ABC):
    @abstractmethod
    async def get_by_id(self, admin_id: UUID) -> Admin | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Admin | None: ...

    @abstractmethod
    async def create(self, admin: Admin) -> Admin: ...

    @abstractmethod
    async def update(self, admin: Admin) -> Admin: ...
