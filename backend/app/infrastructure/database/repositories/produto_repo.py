"""
Marketplace CB - Repository: Produto, Categoria e ProdutoLoja
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.shared.catalogo.entities import Produto, ProdutoLoja
from app.domain.shared.catalogo.interfaces import IProdutoLojaRepository, IProdutoRepository
from app.infrastructure.database.models.produto import (
    CategoriaModel,
    ProdutoLojaModel,
    ProdutoModel,
    StatusProduto,
)


class ProdutoRepository(IProdutoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: ProdutoModel) -> Produto:
        return Produto(
            id=model.id,
            fornecedor_id=model.fornecedor_id,
            categoria_id=model.categoria_id,
            sku=model.sku,
            ean=model.ean,
            nome=model.nome,
            marca=model.marca,
            modelo=model.modelo,
            descricao=model.descricao,
            preco_base=model.preco_base,
            preco_venda=model.preco_venda,
            estoque_disponivel=model.estoque_disponivel,
            imagens=model.imagens or [],
            videos=model.videos or [],
            atributos=model.atributos or {},
            status=model.status,
            comprimento_cm=model.comprimento_cm,
            largura_cm=model.largura_cm,
            altura_cm=model.altura_cm,
            peso_kg=model.peso_kg,
            local_origem=model.local_origem,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, produto_id: UUID) -> Produto | None:
        stmt = select(ProdutoModel).where(ProdutoModel.id == produto_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_sku(self, sku: str) -> Produto | None:
        stmt = select(ProdutoModel).where(ProdutoModel.sku == sku)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_by_fornecedor(
        self, fornecedor_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(ProdutoModel)
            .where(ProdutoModel.fornecedor_id == fornecedor_id)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ProdutoModel)
            .where(ProdutoModel.fornecedor_id == fornecedor_id)
            .order_by(ProdutoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def list_ativos(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(ProdutoModel)
            .where(ProdutoModel.status == StatusProduto.ATIVO)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ProdutoModel)
            .where(ProdutoModel.status == StatusProduto.ATIVO)
            .order_by(ProdutoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def list_by_status(
        self, status: StatusProduto, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(ProdutoModel)
            .where(ProdutoModel.status == status)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ProdutoModel)
            .where(ProdutoModel.status == status)
            .order_by(ProdutoModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def create(self, produto: Produto) -> Produto:
        model = ProdutoModel(
            id=produto.id,
            fornecedor_id=produto.fornecedor_id,
            categoria_id=produto.categoria_id,
            sku=produto.sku,
            ean=produto.ean,
            nome=produto.nome,
            marca=produto.marca,
            modelo=produto.modelo,
            descricao=produto.descricao,
            preco_base=float(produto.preco_base),
            preco_venda=float(produto.preco_venda) if produto.preco_venda else None,
            estoque_disponivel=produto.estoque_disponivel,
            imagens=produto.imagens,
            videos=produto.videos,
            atributos=produto.atributos,
            status=produto.status,
            comprimento_cm=float(produto.comprimento_cm) if produto.comprimento_cm else None,
            largura_cm=float(produto.largura_cm) if produto.largura_cm else None,
            altura_cm=float(produto.altura_cm) if produto.altura_cm else None,
            peso_kg=float(produto.peso_kg) if produto.peso_kg else None,
            local_origem=produto.local_origem,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, produto: Produto) -> Produto:
        stmt = select(ProdutoModel).where(ProdutoModel.id == produto.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.categoria_id = produto.categoria_id
        model.nome = produto.nome
        model.marca = produto.marca
        model.modelo = produto.modelo
        model.descricao = produto.descricao
        model.preco_base = float(produto.preco_base)
        model.preco_venda = float(produto.preco_venda) if produto.preco_venda else None
        model.imagens = produto.imagens
        model.videos = produto.videos
        model.atributos = produto.atributos
        model.status = produto.status
        model.comprimento_cm = float(produto.comprimento_cm) if produto.comprimento_cm else None
        model.largura_cm = float(produto.largura_cm) if produto.largura_cm else None
        model.altura_cm = float(produto.altura_cm) if produto.altura_cm else None
        model.peso_kg = float(produto.peso_kg) if produto.peso_kg else None
        model.local_origem = produto.local_origem
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update_status(self, produto_id: UUID, status: StatusProduto) -> None:
        stmt = select(ProdutoModel).where(ProdutoModel.id == produto_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.status = status
        await self.session.flush()

    async def search(
        self, query: str, offset: int = 0, limit: int = 20
    ) -> tuple[list[Produto], int]:
        filter_expr = ProdutoModel.nome.ilike(f"%{query}%")
        count_result = await self.session.execute(
            select(func.count())
            .select_from(ProdutoModel)
            .where(filter_expr, ProdutoModel.status == StatusProduto.ATIVO)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ProdutoModel)
            .where(filter_expr, ProdutoModel.status == StatusProduto.ATIVO)
            .order_by(ProdutoModel.nome)
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total


class ProdutoLojaRepository(IProdutoLojaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_entity(self, model: ProdutoLojaModel) -> ProdutoLoja:
        return ProdutoLoja(
            id=model.id,
            produto_id=model.produto_id,
            loja_id=model.loja_id,
            preco_venda=model.preco_venda,
            margem=model.margem,
            visivel=model.visivel,
            destaque=model.destaque,
        )

    async def get_by_id(self, produto_loja_id: UUID) -> ProdutoLoja | None:
        stmt = select(ProdutoLojaModel).where(ProdutoLojaModel.id == produto_loja_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_by_loja(
        self, loja_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[ProdutoLoja], int]:
        count_result = await self.session.execute(
            select(func.count())
            .select_from(ProdutoLojaModel)
            .where(ProdutoLojaModel.loja_id == loja_id)
        )
        total = count_result.scalar_one()

        stmt = (
            select(ProdutoLojaModel)
            .where(ProdutoLojaModel.loja_id == loja_id)
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def find_by_produto_id(self, produto_id: UUID) -> list[ProdutoLoja]:
        stmt = select(ProdutoLojaModel).where(ProdutoLojaModel.produto_id == produto_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def create(self, produto_loja: ProdutoLoja) -> ProdutoLoja:
        model = ProdutoLojaModel(
            id=produto_loja.id,
            produto_id=produto_loja.produto_id,
            loja_id=produto_loja.loja_id,
            preco_venda=float(produto_loja.preco_venda),
            margem=float(produto_loja.margem),
            visivel=produto_loja.visivel,
            destaque=produto_loja.destaque,
        )
        self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, produto_loja: ProdutoLoja) -> ProdutoLoja:
        stmt = select(ProdutoLojaModel).where(ProdutoLojaModel.id == produto_loja.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one()
        model.preco_venda = float(produto_loja.preco_venda)
        model.margem = float(produto_loja.margem)
        model.visivel = produto_loja.visivel
        model.destaque = produto_loja.destaque
        await self.session.flush()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def delete(self, produto_loja_id: UUID) -> None:
        stmt = select(ProdutoLojaModel).where(ProdutoLojaModel.id == produto_loja_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.flush()
