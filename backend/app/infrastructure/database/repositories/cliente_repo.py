"""
Marketplace CB - Repository: Cliente
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.cliente.entities import Cliente
from app.domain.cliente.interfaces import IClienteRepository
from app.infrastructure.database.models.cliente import ClienteModel


class ClienteRepository(IClienteRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: ClienteModel) -> Cliente:
        return Cliente(
            id=model.id,
            nome=model.nome,
            email=model.email,
            cpf=model.cpf,
            telefone=model.telefone,
            endereco=model.endereco,
            status=model.status,
            email_verificado=model.email_verificado,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, cliente_id: UUID) -> Cliente | None:
        stmt = select(ClienteModel).where(ClienteModel.id == cliente_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Cliente | None:
        stmt = select(ClienteModel).where(ClienteModel.email == email)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_cpf(self, cpf: str) -> Cliente | None:
        stmt = select(ClienteModel).where(ClienteModel.cpf == cpf)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_model_by_email(self, email: str) -> ClienteModel | None:
        """Retorna o model diretamente (para verificação de senha)."""
        stmt = select(ClienteModel).where(ClienteModel.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_from_model(self, model: ClienteModel) -> ClienteModel:
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return model

    async def update(self, cliente: Cliente) -> Cliente:
        stmt = select(ClienteModel).where(ClienteModel.id == cliente.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.nome = cliente.nome
        model.telefone = cliente.telefone
        model.endereco = cliente.endereco
        model.status = cliente.status
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def list_all(self, offset: int = 0, limit: int = 20) -> tuple[list[Cliente], int]:
        count_result = await self.session.execute(
            select(func.count()).select_from(ClienteModel)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ClienteModel)
            .order_by(ClienteModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total
