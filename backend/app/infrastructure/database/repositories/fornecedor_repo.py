"""
Marketplace CB - Repository: Fornecedor
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.domain.fornecedor.entities import CondicoesComerciais, Fornecedor
from app.domain.fornecedor.interfaces import IFornecedorRepository
from app.infrastructure.database.models.fornecedor import (
    CondicaoComercialModel,
    FornecedorModel,
    StatusFornecedor,
)


class FornecedorRepository(IFornecedorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: FornecedorModel) -> Fornecedor:
        condicoes = None
        if model.condicao_comercial:
            cc = model.condicao_comercial
            condicoes = CondicoesComerciais(
                id=cc.id,
                fornecedor_id=cc.fornecedor_id,
                margem_minima=cc.margem_minima,
                prazo_entrega_dias=cc.prazo_entrega_dias,
                politica_devolucao=cc.politica_devolucao,
            )
        return Fornecedor(
            id=model.id,
            razao_social=model.razao_social,
            nome_fantasia=model.nome_fantasia,
            cnpj=model.cnpj,
            email=model.email,
            telefone=model.telefone,
            tipo=model.tipo,
            status=model.status,
            condicoes_comerciais=condicoes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, fornecedor_id: UUID) -> Fornecedor | None:
        stmt = (
            select(FornecedorModel)
            .options(joinedload(FornecedorModel.condicao_comercial))
            .where(FornecedorModel.id == fornecedor_id)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_cnpj(self, cnpj: str) -> Fornecedor | None:
        stmt = select(FornecedorModel).where(FornecedorModel.cnpj == cnpj)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Fornecedor | None:
        stmt = (
            select(FornecedorModel)
            .options(joinedload(FornecedorModel.condicao_comercial))
            .where(FornecedorModel.email == email)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_model_by_email(self, email: str) -> FornecedorModel | None:
        stmt = select(FornecedorModel).where(FornecedorModel.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_from_model(self, model: FornecedorModel) -> FornecedorModel:
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return model

    async def create(self, fornecedor: Fornecedor) -> Fornecedor:
        model = FornecedorModel(
            id=fornecedor.id,
            razao_social=fornecedor.razao_social,
            nome_fantasia=fornecedor.nome_fantasia,
            cnpj=fornecedor.cnpj,
            email=fornecedor.email,
            telefone=fornecedor.telefone,
            tipo=fornecedor.tipo,
            status=fornecedor.status,
            senha_hash="",
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, fornecedor: Fornecedor) -> Fornecedor:
        stmt = select(FornecedorModel).where(FornecedorModel.id == fornecedor.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.razao_social = fornecedor.razao_social
        model.nome_fantasia = fornecedor.nome_fantasia
        model.telefone = fornecedor.telefone
        model.status = fornecedor.status
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update_status(self, fornecedor_id: UUID, status: StatusFornecedor) -> None:
        stmt = select(FornecedorModel).where(FornecedorModel.id == fornecedor_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.status = status
        await self.session.flush()

    async def list_all(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Fornecedor], int]:
        count_result = await self.session.execute(
            select(func.count()).select_from(FornecedorModel)
        )
        total = count_result.scalar_one()

        stmt = (
            select(FornecedorModel)
            .options(joinedload(FornecedorModel.condicao_comercial))
            .order_by(FornecedorModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total

    async def list_by_status(
        self, status: str, offset: int = 0, limit: int = 20
    ) -> tuple[list[Fornecedor], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(FornecedorModel)
            .where(FornecedorModel.status == status)
        )
        total = count_result.scalar_one()

        stmt = (
            select(FornecedorModel)
            .options(joinedload(FornecedorModel.condicao_comercial))
            .where(FornecedorModel.status == status)
            .order_by(FornecedorModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total

    async def save_condicao_comercial(
        self, fornecedor_id: UUID, margem_minima: float, prazo_entrega_dias: int,
        politica_devolucao: str | None = None,
    ) -> CondicaoComercialModel:
        stmt = select(CondicaoComercialModel).where(
            CondicaoComercialModel.fornecedor_id == fornecedor_id
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.margem_minima = margem_minima
            model.prazo_entrega_dias = prazo_entrega_dias
            model.politica_devolucao = politica_devolucao
        else:
            model = CondicaoComercialModel(
                fornecedor_id=fornecedor_id,
                margem_minima=margem_minima,
                prazo_entrega_dias=prazo_entrega_dias,
                politica_devolucao=politica_devolucao,
            )
            self.session.add(model)

        await self.session.flush()
        await self.session.refresh(model)
        return model
