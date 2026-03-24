"""
Marketplace CB - Repository: Estoque
Inclui suporte a lock pessimista (SELECT FOR UPDATE).
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.domain.shared.estoque.entities import Estoque, MovimentacaoEstoque
from app.domain.shared.estoque.interfaces import (
    IEstoqueRepository,
    IMovimentacaoEstoqueRepository,
)
from app.infrastructure.database.models.estoque import (
    EstoqueModel,
    MovimentacaoEstoqueModel,
)


class EstoqueRepository(IEstoqueRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: EstoqueModel) -> Estoque:
        return Estoque(
            id=model.id,
            produto_id=model.produto_id,
            quantidade_disponivel=model.quantidade_disponivel,
            quantidade_reservada=model.quantidade_reservada,
            versao=model.versao,
            atualizado_em=model.atualizado_em,
        )

    async def get_by_produto_id(self, produto_id: UUID) -> Estoque | None:
        stmt = select(EstoqueModel).where(EstoqueModel.produto_id == produto_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_produto_id_with_lock(self, produto_id: UUID) -> Estoque | None:
        """SELECT FOR UPDATE — lock pessimista para reserva de estoque no checkout."""
        stmt = select(EstoqueModel).where(EstoqueModel.produto_id == produto_id)
        # SQLite não suporta SELECT FOR UPDATE; aplicar apenas em PostgreSQL
        if not get_settings().is_sqlite:
            stmt = stmt.with_for_update()
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, estoque: Estoque) -> Estoque:
        model = EstoqueModel(
            id=estoque.id,
            produto_id=estoque.produto_id,
            quantidade_disponivel=estoque.quantidade_disponivel,
            quantidade_reservada=estoque.quantidade_reservada,
            versao=estoque.versao,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, estoque: Estoque) -> Estoque:
        stmt = select(EstoqueModel).where(EstoqueModel.id == estoque.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.quantidade_disponivel = estoque.quantidade_disponivel
        model.quantidade_reservada = estoque.quantidade_reservada
        model.versao = estoque.versao
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update_by_produto_id(
        self, produto_id: UUID, quantidade_disponivel: int
    ) -> Estoque | None:
        stmt = select(EstoqueModel).where(EstoqueModel.produto_id == produto_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        model.quantidade_disponivel = quantidade_disponivel
        model.versao += 1
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)


class MovimentacaoEstoqueRepository(IMovimentacaoEstoqueRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: MovimentacaoEstoqueModel) -> MovimentacaoEstoque:
        return MovimentacaoEstoque(
            id=model.id,
            produto_id=model.produto_id,
            pedido_id=model.pedido_id,
            tipo=model.tipo,
            quantidade_anterior=model.quantidade_anterior,
            quantidade_movimentada=model.quantidade_movimentada,
            quantidade_posterior=model.quantidade_posterior,
            referencia=model.referencia,
            criado_em=model.criado_em,
        )

    async def create(self, movimentacao: MovimentacaoEstoque) -> MovimentacaoEstoque:
        model = MovimentacaoEstoqueModel(
            id=movimentacao.id,
            produto_id=movimentacao.produto_id,
            pedido_id=movimentacao.pedido_id,
            tipo=movimentacao.tipo,
            quantidade_anterior=movimentacao.quantidade_anterior,
            quantidade_movimentada=movimentacao.quantidade_movimentada,
            quantidade_posterior=movimentacao.quantidade_posterior,
            referencia=movimentacao.referencia,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def list_by_produto(
        self, produto_id: UUID, offset: int = 0, limit: int = 50
    ) -> tuple[list[MovimentacaoEstoque], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(MovimentacaoEstoqueModel)
            .where(MovimentacaoEstoqueModel.produto_id == produto_id)
        )
        total = count_result.scalar_one()

        stmt = (
            select(MovimentacaoEstoqueModel)
            .where(MovimentacaoEstoqueModel.produto_id == produto_id)
            .order_by(MovimentacaoEstoqueModel.criado_em.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total
