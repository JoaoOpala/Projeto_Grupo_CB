"""
Marketplace CB - Router: Catálogo de Produtos (Público)
Endpoints públicos de busca e navegação no catálogo.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.produto import ProdutoResponse
from app.infrastructure.database.models.produto import ProdutoLojaModel
from app.infrastructure.database.models.vendedor import LojaModel
from app.infrastructure.database.repositories.produto_repo import ProdutoRepository
from app.infrastructure.database.session import get_db

router = APIRouter()


@router.get("/")
async def listar_catalogo(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Listar produtos ativos do catálogo (público)."""
    repo = ProdutoRepository(db)
    items, total = await repo.list_ativos(offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [ProdutoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/busca")
async def buscar_produtos(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Buscar produtos por nome."""
    repo = ProdutoRepository(db)
    items, total = await repo.search(q, offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [ProdutoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{produto_id}", response_model=ProdutoResponse)
async def get_produto_catalogo(
    produto_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Obter detalhes de um produto do catálogo."""
    repo = ProdutoRepository(db)
    produto = await repo.get_by_id(produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return ProdutoResponse.model_validate(produto)


@router.get("/{produto_id}/lojas")
async def get_lojas_produto(
    produto_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retorna as lojas que vendem um dado produto, com preço e nome da loja."""
    stmt = (
        select(ProdutoLojaModel, LojaModel)
        .join(LojaModel, ProdutoLojaModel.loja_id == LojaModel.id)
        .where(
            ProdutoLojaModel.produto_id == produto_id,
            ProdutoLojaModel.visivel == True,
            LojaModel.ativa == True,
        )
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "loja_id": str(pl.loja_id),
            "loja_nome": loja.nome_loja,
            "loja_slug": loja.slug,
            "preco_venda": float(pl.preco_venda),
            "destaque": pl.destaque,
        }
        for pl, loja in rows
    ]
