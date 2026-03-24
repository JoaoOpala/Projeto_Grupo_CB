"""
Marketplace CB - Repositório Concreto: Admin
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.admin.entities import Admin, RoleAdmin
from app.domain.admin.interfaces import IAdminRepository
from app.infrastructure.database.models.admin import AdminModel


class AdminRepository(IAdminRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: AdminModel) -> Admin:
        return Admin(
            id=model.id,
            nome=model.nome,
            email=model.email,
            role=RoleAdmin(model.role.value),
            ativo=model.ativo,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, admin_id: UUID) -> Admin | None:
        result = await self.session.get(AdminModel, admin_id)
        return self._to_entity(result) if result else None

    async def get_by_email(self, email: str) -> Admin | None:
        stmt = select(AdminModel).where(AdminModel.email == email)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_model_by_email(self, email: str) -> AdminModel | None:
        """Retorna o model diretamente (para verificação de senha)."""
        stmt = select(AdminModel).where(AdminModel.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, admin: Admin) -> Admin:
        model = AdminModel(
            id=admin.id,
            nome=admin.nome,
            email=admin.email,
            role=admin.role.value,
            ativo=admin.ativo,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, admin: Admin) -> Admin:
        model = await self.session.get(AdminModel, admin.id)
        if model:
            model.nome = admin.nome
            model.email = admin.email
            model.role = admin.role.value
            model.ativo = admin.ativo
            await self.session.flush()
            await self.session.refresh(model)
        return self._to_entity(model)
