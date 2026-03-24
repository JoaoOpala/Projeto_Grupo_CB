"""
Marketplace CB - Repository: Pedido
"""

import random
import string
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.domain.shared.pedidos.entities import ItemPedido, Pedido
from app.domain.shared.pedidos.interfaces import IPedidoRepository
from app.infrastructure.database.models.pedido import (
    ItemPedidoModel,
    PedidoModel,
    StatusPedido,
)


class PedidoRepository(IPedidoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: PedidoModel) -> Pedido:
        itens = [
            ItemPedido(
                id=item.id,
                produto_id=item.produto_id,
                quantidade=item.quantidade,
                preco_unitario=item.preco_unitario,
                preco_total=item.preco_total,
                produto_nome=item.produto_nome,
                produto_sku=item.produto_sku,
            )
            for item in model.itens
        ]
        return Pedido(
            id=model.id,
            numero_pedido=model.numero_pedido,
            loja_id=model.loja_id,
            fornecedor_id=model.fornecedor_id,
            cliente_nome=model.cliente_nome,
            cliente_email=model.cliente_email,
            cliente_telefone=model.cliente_telefone,
            endereco_entrega=model.endereco_entrega,
            itens=itens,
            valor_produtos=model.valor_produtos,
            valor_frete=model.valor_frete,
            valor_desconto=model.valor_desconto,
            valor_total=model.valor_total,
            valor_comissao_plataforma=model.valor_comissao_plataforma,
            valor_comissao_vendedor=model.valor_comissao_vendedor,
            status=model.status,
            codigo_rastreio=model.codigo_rastreio,
            observacoes=model.observacoes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _gerar_numero_pedido() -> str:
        ts = datetime.now(timezone.utc).strftime("%y%m%d")
        rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"MCB-{ts}-{rand}"

    async def get_by_id(self, pedido_id: UUID) -> Pedido | None:
        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .where(PedidoModel.id == pedido_id)
        )
        result = await self.session.execute(stmt)
        model = result.unique().scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_numero(self, numero_pedido: str) -> Pedido | None:
        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .where(PedidoModel.numero_pedido == numero_pedido)
        )
        result = await self.session.execute(stmt)
        model = result.unique().scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_by_loja(
        self, loja_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(PedidoModel)
            .where(PedidoModel.loja_id == loja_id)
        )
        total = count_result.scalar_one()

        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .where(PedidoModel.loja_id == loja_id)
            .order_by(PedidoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total

    async def list_by_fornecedor(
        self, fornecedor_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(PedidoModel)
            .where(PedidoModel.fornecedor_id == fornecedor_id)
        )
        total = count_result.scalar_one()

        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .where(PedidoModel.fornecedor_id == fornecedor_id)
            .order_by(PedidoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total

    async def list_all(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        count_result = await self.session.execute(
            select(func.count()).select_from(PedidoModel)
        )
        total = count_result.scalar_one()

        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .order_by(PedidoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.unique().scalars().all()
        return [self._to_entity(m) for m in models], total

    async def create(self, pedido: Pedido) -> Pedido:
        numero = pedido.numero_pedido or self._gerar_numero_pedido()
        model = PedidoModel(
            id=pedido.id,
            numero_pedido=numero,
            loja_id=pedido.loja_id,
            fornecedor_id=pedido.fornecedor_id,
            cliente_nome=pedido.cliente_nome,
            cliente_email=pedido.cliente_email,
            cliente_telefone=pedido.cliente_telefone,
            endereco_entrega=pedido.endereco_entrega,
            valor_produtos=float(pedido.valor_produtos),
            valor_frete=float(pedido.valor_frete),
            valor_desconto=float(pedido.valor_desconto),
            valor_total=float(pedido.valor_total),
            valor_comissao_plataforma=float(pedido.valor_comissao_plataforma),
            valor_comissao_vendedor=float(pedido.valor_comissao_vendedor),
            status=pedido.status,
        )
        for item in pedido.itens:
            model.itens.append(
                ItemPedidoModel(
                    id=item.id,
                    produto_id=item.produto_id,
                    quantidade=item.quantidade,
                    preco_unitario=float(item.preco_unitario),
                    preco_total=float(item.preco_total),
                    produto_nome=item.produto_nome,
                    produto_sku=item.produto_sku,
                )
            )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model, ["itens"])
        return self._to_entity(model)

    async def update(self, pedido: Pedido) -> Pedido:
        stmt = (
            select(PedidoModel)
            .options(joinedload(PedidoModel.itens))
            .where(PedidoModel.id == pedido.id)
        )
        result = await self.session.execute(stmt)
        model = result.unique().scalar_one()
        model.status = pedido.status
        model.codigo_rastreio = pedido.codigo_rastreio
        model.observacoes = pedido.observacoes
        await self.session.flush()
        await self.session.refresh(model, ["itens"])
        return self._to_entity(model)
