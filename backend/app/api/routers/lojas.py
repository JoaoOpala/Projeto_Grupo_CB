"""
Marketplace CB - Router: Lojas Públicas
Cada vendedor possui um link único para sua loja.
Clientes só acessam produtos de um vendedor pelo link específico dele,
eliminando concorrência entre vendedores no mesmo marketplace.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.produto import ProdutoLojaModel, ProdutoModel, StatusProduto
from app.infrastructure.database.models.vendedor import LojaModel
from app.infrastructure.database.session import get_db

router = APIRouter()


@router.get("/")
async def listar_influences_verificados(
    db: AsyncSession = Depends(get_db),
):
    """Lista todas as lojas verificadas (influences) para exibição na home."""
    stmt = (
        select(LojaModel)
        .where(LojaModel.ativa == True, LojaModel.verificado == True)
        .order_by(LojaModel.nome_loja)
    )
    result = await db.execute(stmt)
    lojas = result.scalars().all()
    return [
        {
            "id": str(l.id),
            "nome_loja": l.nome_loja,
            "slug": l.slug,
            "descricao": l.descricao,
            "logo_url": l.logo_url,
        }
        for l in lojas
    ]


@router.get("/{slug}")
async def get_loja(slug: str, db: AsyncSession = Depends(get_db)):
    """Retorna dados públicos de uma loja pelo slug."""
    stmt = select(LojaModel).where(LojaModel.slug == slug, LojaModel.ativa == True)
    result = await db.execute(stmt)
    loja = result.scalar_one_or_none()
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")
    return {
        "id": str(loja.id),
        "nome_loja": loja.nome_loja,
        "slug": loja.slug,
        "descricao": loja.descricao,
        "logo_url": loja.logo_url,
        "ativa": loja.ativa,
    }


@router.get("/{slug}/produtos")
async def get_produtos_loja(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    busca: str | None = Query(None, min_length=2),
    apenas_destaque: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna os produtos visíveis de uma loja específica.
    Preços exibidos são os definidos pelo vendedor (não o preço base do fornecedor).
    """
    # Verificar se a loja existe e está ativa
    loja_stmt = select(LojaModel).where(LojaModel.slug == slug, LojaModel.ativa == True)
    loja_result = await db.execute(loja_stmt)
    loja = loja_result.scalar_one_or_none()
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")

    # Montar query dos produtos da loja
    base_stmt = (
        select(ProdutoLojaModel, ProdutoModel)
        .join(ProdutoModel, ProdutoLojaModel.produto_id == ProdutoModel.id)
        .where(
            ProdutoLojaModel.loja_id == loja.id,
            ProdutoLojaModel.visivel == True,
            ProdutoModel.status == StatusProduto.ATIVO,
        )
    )

    if busca:
        base_stmt = base_stmt.where(
            ProdutoModel.nome.ilike(f"%{busca}%")
        )

    if apenas_destaque:
        base_stmt = base_stmt.where(ProdutoLojaModel.destaque == True)

    # Total
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(
        select(ProdutoLojaModel)
        .join(ProdutoModel, ProdutoLojaModel.produto_id == ProdutoModel.id)
        .where(
            ProdutoLojaModel.loja_id == loja.id,
            ProdutoLojaModel.visivel == True,
            ProdutoModel.status == StatusProduto.ATIVO,
            *([ProdutoModel.nome.ilike(f"%{busca}%")] if busca else []),
            *([ProdutoLojaModel.destaque == True] if apenas_destaque else []),
        )
        .subquery()
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Paginação — destaques primeiro
    paginated_stmt = (
        base_stmt
        .order_by(ProdutoLojaModel.destaque.desc(), ProdutoModel.nome)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(paginated_stmt)
    rows = result.all()

    items = [
        {
            "produto_loja_id": str(pl.id),
            "produto_id": str(p.id),
            "sku": p.sku,
            "nome": p.nome,
            "descricao": p.descricao,
            "imagens": p.imagens or [],
            "atributos": p.atributos or {},
            "peso_kg": float(p.peso_kg) if p.peso_kg else None,
            "preco_venda": float(pl.preco_venda),
            "destaque": pl.destaque,
        }
        for pl, p in rows
    ]

    return {
        "loja": {
            "id": str(loja.id),
            "nome_loja": loja.nome_loja,
            "slug": loja.slug,
            "descricao": loja.descricao,
            "logo_url": loja.logo_url,
        },
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }
