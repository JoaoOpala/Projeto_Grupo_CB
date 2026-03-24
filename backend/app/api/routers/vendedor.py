"""
Marketplace CB - Router: Módulo Vendedor
Endpoints autenticados para perfil, loja, produtos e pedidos.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id, require_role
from app.api.schemas.produto import ProdutoLojaCreate, ProdutoLojaResponse, ProdutoLojaUpdate
from app.api.schemas.vendedor import (
    LojaCreate,
    LojaResponse,
    LojaUpdate,
    VendedorResponse,
    VendedorUpdate,
)
from app.domain.vendedor.use_cases.adicionar_produto_loja import AdicionarProdutoLojaUseCase
from app.domain.vendedor.use_cases.criar_loja import CriarLojaUseCase
from app.infrastructure.database.repositories.pedido_repo import PedidoRepository
from app.infrastructure.database.repositories.produto_repo import (
    ProdutoLojaRepository,
    ProdutoRepository,
)
from app.infrastructure.database.repositories.vendedor_repo import (
    LojaRepository,
    VendedorRepository,
)
from app.infrastructure.database.session import get_db

router = APIRouter(dependencies=[Depends(require_role(["vendedor"]))])


# ── Perfil ───────────────────────────────────────────────


@router.get("/me", response_model=VendedorResponse)
async def get_perfil_vendedor(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = VendedorRepository(db)
    vendedor = await repo.get_by_id(user_id)
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    return VendedorResponse.model_validate(vendedor)


@router.put("/me", response_model=VendedorResponse)
async def update_perfil_vendedor(
    body: VendedorUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = VendedorRepository(db)
    vendedor = await repo.get_by_id(user_id)
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    if body.nome is not None:
        vendedor.nome = body.nome
    if body.telefone is not None:
        vendedor.telefone = body.telefone
    updated = await repo.update(vendedor)
    return VendedorResponse.model_validate(updated)


# ── Loja ─────────────────────────────────────────────────


@router.post("/loja", response_model=LojaResponse, status_code=201)
async def criar_loja(
    body: LojaCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    vendedor_repo = VendedorRepository(db)
    loja_repo = LojaRepository(db)
    use_case = CriarLojaUseCase(vendedor_repo, loja_repo)
    try:
        loja = await use_case.execute(
            vendedor_id=user_id,
            nome_loja=body.nome_loja,
            descricao=body.descricao,
            logo_url=body.logo_url,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return LojaResponse.model_validate(loja)


@router.get("/loja", response_model=LojaResponse)
async def get_loja(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = LojaRepository(db)
    loja = await repo.get_by_vendedor_id(user_id)
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")
    return LojaResponse.model_validate(loja)


@router.put("/loja", response_model=LojaResponse)
async def update_loja(
    body: LojaUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = LojaRepository(db)
    loja = await repo.get_by_vendedor_id(user_id)
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")
    if body.nome_loja is not None:
        loja.nome_loja = body.nome_loja
    if body.descricao is not None:
        loja.descricao = body.descricao
    if body.logo_url is not None:
        loja.logo_url = body.logo_url
    if body.ativa is not None:
        loja.ativa = body.ativa
    updated = await repo.update(loja)
    return LojaResponse.model_validate(updated)


# ── Produtos da Loja ─────────────────────────────────────


@router.get("/loja/produtos")
async def listar_produtos_loja(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    loja_repo = LojaRepository(db)
    loja = await loja_repo.get_by_vendedor_id(user_id)
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")

    repo = ProdutoLojaRepository(db)
    items, total = await repo.list_by_loja(loja.id, offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [ProdutoLojaResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/loja/produtos", response_model=ProdutoLojaResponse, status_code=201)
async def adicionar_produto_loja(
    body: ProdutoLojaCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    loja_repo = LojaRepository(db)
    produto_repo = ProdutoRepository(db)
    produto_loja_repo = ProdutoLojaRepository(db)
    use_case = AdicionarProdutoLojaUseCase(loja_repo, produto_repo, produto_loja_repo)
    try:
        result = await use_case.execute(
            vendedor_id=user_id,
            produto_id=body.produto_id,
            preco_venda=body.preco_venda,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return ProdutoLojaResponse.model_validate(result)


@router.put("/loja/produtos/{produto_loja_id}", response_model=ProdutoLojaResponse)
async def update_produto_loja(
    produto_loja_id: UUID,
    body: ProdutoLojaUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoLojaRepository(db)
    pl = await repo.get_by_id(produto_loja_id)
    if not pl:
        raise HTTPException(status_code=404, detail="Produto da loja não encontrado")
    if body.preco_venda is not None:
        pl.preco_venda = body.preco_venda
    if body.visivel is not None:
        pl.visivel = body.visivel
    if body.destaque is not None:
        pl.destaque = body.destaque
    updated = await repo.update(pl)
    return ProdutoLojaResponse.model_validate(updated)


@router.delete("/loja/produtos/{produto_loja_id}", status_code=204)
async def remover_produto_loja(
    produto_loja_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoLojaRepository(db)
    await repo.delete(produto_loja_id)


# ── Pedidos ──────────────────────────────────────────────


@router.get("/pedidos")
async def listar_pedidos_vendedor(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    loja_repo = LojaRepository(db)
    loja = await loja_repo.get_by_vendedor_id(user_id)
    if not loja:
        raise HTTPException(status_code=404, detail="Loja não encontrada")

    repo = PedidoRepository(db)
    from app.api.schemas.pedido import PedidoResponse

    items, total = await repo.list_by_loja(loja.id, offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [PedidoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/pedidos/{pedido_id}")
async def get_pedido_vendedor(
    pedido_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    from app.api.schemas.pedido import PedidoResponse

    repo = PedidoRepository(db)
    pedido = await repo.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return PedidoResponse.model_validate(pedido)
