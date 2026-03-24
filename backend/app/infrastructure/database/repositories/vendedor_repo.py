"""
Marketplace CB - Repository: Vendedor e Loja
Implementação concreta dos repositórios usando SQLAlchemy.
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.domain.vendedor.entities import Loja, Vendedor
from app.domain.vendedor.interfaces import ILojaRepository, IVendedorRepository
from app.infrastructure.database.models.vendedor import LojaModel, VendedorModel


class VendedorRepository(IVendedorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: VendedorModel) -> Vendedor:
        loja = None
        if model.loja:
            loja = Loja(
                id=model.loja.id,
                vendedor_id=model.loja.vendedor_id,
                nome_loja=model.loja.nome_loja,
                slug=model.loja.slug,
                descricao=model.loja.descricao,
                logo_url=model.loja.logo_url,
                ativa=model.loja.ativa,
                created_at=model.loja.created_at,
                updated_at=model.loja.updated_at,
            )
        return Vendedor(
            id=model.id,
            nome=model.nome,
            email=model.email,
            cpf_cnpj=model.cpf_cnpj,
            telefone=model.telefone,
            tipo_pessoa=model.tipo_pessoa,
            status=model.status,
            comissao_padrao=model.comissao_padrao,
            loja=loja,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, vendedor_id: UUID) -> Vendedor | None:
        stmt = (
            select(VendedorModel)
            .options(joinedload(VendedorModel.loja))
            .where(VendedorModel.id == vendedor_id)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Vendedor | None:
        stmt = (
            select(VendedorModel)
            .options(joinedload(VendedorModel.loja))
            .where(VendedorModel.email == email)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_cpf_cnpj(self, cpf_cnpj: str) -> Vendedor | None:
        stmt = select(VendedorModel).where(VendedorModel.cpf_cnpj == cpf_cnpj)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_model_by_email(self, email: str) -> VendedorModel | None:
        """Retorna o model diretamente (para verificação de senha)."""
        stmt = select(VendedorModel).where(VendedorModel.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, vendedor: Vendedor) -> Vendedor:
        model = VendedorModel(
            id=vendedor.id,
            nome=vendedor.nome,
            email=vendedor.email,
            cpf_cnpj=vendedor.cpf_cnpj,
            telefone=vendedor.telefone,
            tipo_pessoa=vendedor.tipo_pessoa,
            status=vendedor.status,
            comissao_padrao=vendedor.comissao_padrao,
            senha_hash="",  # será definido pelo use case
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def create_from_model(self, model: VendedorModel) -> VendedorModel:
        """Cria diretamente do model (para incluir senha_hash)."""
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return model

    async def update(self, vendedor: Vendedor) -> Vendedor:
        stmt = select(VendedorModel).where(VendedorModel.id == vendedor.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.nome = vendedor.nome
        model.telefone = vendedor.telefone
        model.status = vendedor.status
        model.comissao_padrao = vendedor.comissao_padrao
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def list_all(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Vendedor], int]:
        count_stmt = select(func.count()).select_from(VendedorModel)
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = (
            select(VendedorModel)
            .options(joinedload(VendedorModel.loja))
            .order_by(VendedorModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total


class LojaRepository(ILojaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: LojaModel) -> Loja:
        return Loja(
            id=model.id,
            vendedor_id=model.vendedor_id,
            nome_loja=model.nome_loja,
            slug=model.slug,
            descricao=model.descricao,
            logo_url=model.logo_url,
            ativa=model.ativa,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, loja_id: UUID) -> Loja | None:
        stmt = select(LojaModel).where(LojaModel.id == loja_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_vendedor_id(self, vendedor_id: UUID) -> Loja | None:
        stmt = select(LojaModel).where(LojaModel.vendedor_id == vendedor_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_slug(self, slug: str) -> Loja | None:
        stmt = select(LojaModel).where(LojaModel.slug == slug)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, loja: Loja) -> Loja:
        model = LojaModel(
            id=loja.id,
            vendedor_id=loja.vendedor_id,
            nome_loja=loja.nome_loja,
            slug=loja.slug,
            descricao=loja.descricao,
            logo_url=loja.logo_url,
            ativa=loja.ativa,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, loja: Loja) -> Loja:
        stmt = select(LojaModel).where(LojaModel.id == loja.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.nome_loja = loja.nome_loja
        model.slug = loja.slug
        model.descricao = loja.descricao
        model.logo_url = loja.logo_url
        model.ativa = loja.ativa
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)
