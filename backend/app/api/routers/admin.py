"""
Marketplace CB - Router: Módulo Administrador
Endpoints para gestão da plataforma, moderação e relatórios.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from app.api.deps import require_role
from app.api.schemas.fornecedor import FornecedorCreate, FornecedorResponse
from app.api.schemas.pedido import PedidoResponse
from app.api.schemas.produto import ProdutoResponse
from app.api.schemas.vendedor import VendedorCreate, VendedorResponse
from app.domain.admin.use_cases.aprovar_fornecedor import AprovarFornecedorUseCase
from app.domain.admin.use_cases.moderar_produto import ModerarProdutoUseCase
from app.domain.fornecedor.use_cases.criar_fornecedor import CriarFornecedorUseCase
from app.domain.vendedor.use_cases.criar_vendedor import CriarVendedorUseCase
from app.infrastructure.database.models.fornecedor import FornecedorModel
from app.infrastructure.database.models.produto import StatusProduto
from app.infrastructure.database.models.vendedor import VendedorModel, StatusVendedor
from app.infrastructure.database.repositories.fornecedor_repo import FornecedorRepository
from app.infrastructure.database.repositories.pedido_repo import PedidoRepository
from app.infrastructure.database.repositories.produto_repo import ProdutoRepository
from app.infrastructure.database.repositories.vendedor_repo import VendedorRepository
from app.infrastructure.database.session import get_db

router = APIRouter(dependencies=[Depends(require_role(["admin"]))])


# ── Dashboard ────────────────────────────────────────────


@router.get("/dashboard")
async def dashboard_admin(db: AsyncSession = Depends(get_db)):
    vendedor_repo = VendedorRepository(db)
    fornecedor_repo = FornecedorRepository(db)
    produto_repo = ProdutoRepository(db)
    pedido_repo = PedidoRepository(db)

    _, total_vendedores = await vendedor_repo.list_all(limit=0)
    _, total_fornecedores = await fornecedor_repo.list_all(limit=0)
    _, total_produtos = await produto_repo.list_ativos(limit=0)
    _, total_pedidos = await pedido_repo.list_all(limit=0)
    _, pendentes = await fornecedor_repo.list_by_status("PENDENTE", limit=0)
    _, moderacao = await produto_repo.list_by_status(StatusProduto.MODERACAO, limit=0)

    return {
        "total_vendedores": total_vendedores,
        "total_fornecedores": total_fornecedores,
        "total_produtos_ativos": total_produtos,
        "total_pedidos": total_pedidos,
        "fornecedores_pendentes": pendentes,
        "produtos_em_moderacao": moderacao,
    }


# ── Vendedores ───────────────────────────────────────────


@router.get("/vendedores")
async def listar_vendedores(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = VendedorRepository(db)
    items, total = await repo.list_all(offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [VendedorResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/vendedores/{vendedor_id}", response_model=VendedorResponse)
async def get_vendedor(vendedor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = VendedorRepository(db)
    vendedor = await repo.get_by_id(vendedor_id)
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    return VendedorResponse.model_validate(vendedor)


@router.post("/vendedores", response_model=VendedorResponse, status_code=201)
async def criar_vendedor_admin(
    body: VendedorCreate, db: AsyncSession = Depends(get_db)
):
    """Admin cria um novo vendedor diretamente."""
    repo = VendedorRepository(db)
    use_case = CriarVendedorUseCase(repo)
    try:
        vendedor = await use_case.execute(
            nome=body.nome,
            email=body.email,
            cpf_cnpj=body.cpf_cnpj,
            tipo_pessoa=body.tipo_pessoa.value,
            senha=body.senha,
            telefone=body.telefone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return VendedorResponse.model_validate(vendedor)


@router.put("/vendedores/{vendedor_id}/status")
async def atualizar_status_vendedor(
    vendedor_id: UUID,
    novo_status: StatusVendedor = Query(...),
    db: AsyncSession = Depends(get_db),
):
    repo = VendedorRepository(db)
    vendedor = await repo.get_by_id(vendedor_id)
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    vendedor.status = novo_status
    updated = await repo.update(vendedor)
    return {"vendedor_id": str(vendedor_id), "status": updated.status}


@router.delete("/vendedores/{vendedor_id}", status_code=204)
async def excluir_vendedor(vendedor_id: UUID, db: AsyncSession = Depends(get_db)):
    """Exclui um vendedor e sua loja (cascade)."""
    stmt = select(VendedorModel).where(VendedorModel.id == vendedor_id)
    result = await db.execute(stmt)
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    await db.delete(model)
    await db.commit()


# ── Fornecedores ─────────────────────────────────────────


@router.get("/fornecedores")
async def listar_fornecedores(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    items, total = await repo.list_all(offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [FornecedorResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/fornecedores", response_model=FornecedorResponse, status_code=201)
async def criar_fornecedor_admin(
    body: FornecedorCreate, db: AsyncSession = Depends(get_db)
):
    """Admin cria um novo fornecedor diretamente."""
    repo = FornecedorRepository(db)
    use_case = CriarFornecedorUseCase(repo)
    try:
        fornecedor = await use_case.execute(
            razao_social=body.razao_social,
            cnpj=body.cnpj,
            email=body.email,
            tipo=body.tipo.value,
            senha=body.senha,
            nome_fantasia=body.nome_fantasia,
            telefone=body.telefone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return FornecedorResponse.model_validate(fornecedor)


@router.delete("/fornecedores/{fornecedor_id}", status_code=204)
async def excluir_fornecedor(fornecedor_id: UUID, db: AsyncSession = Depends(get_db)):
    """Exclui um fornecedor."""
    stmt = select(FornecedorModel).where(FornecedorModel.id == fornecedor_id)
    result = await db.execute(stmt)
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    await db.delete(model)
    await db.commit()


@router.get("/fornecedores/pendentes")
async def listar_fornecedores_pendentes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    items, total = await repo.list_by_status(
        "PENDENTE", offset=(page - 1) * page_size, limit=page_size
    )
    return {
        "items": [FornecedorResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.put("/fornecedores/{fornecedor_id}/aprovar")
async def aprovar_fornecedor(fornecedor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = FornecedorRepository(db)
    use_case = AprovarFornecedorUseCase(repo)
    try:
        return await use_case.execute(fornecedor_id, aprovar=True)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/fornecedores/{fornecedor_id}/rejeitar")
async def rejeitar_fornecedor(fornecedor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = FornecedorRepository(db)
    use_case = AprovarFornecedorUseCase(repo)
    try:
        return await use_case.execute(fornecedor_id, aprovar=False)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── Produtos (Moderação) ────────────────────────────────


@router.get("/produtos")
async def listar_produtos_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoRepository(db)
    items, total = await repo.list_ativos(offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [ProdutoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/produtos/moderacao")
async def listar_produtos_moderacao(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoRepository(db)
    items, total = await repo.list_by_status(
        StatusProduto.MODERACAO, offset=(page - 1) * page_size, limit=page_size
    )
    return {
        "items": [ProdutoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.put("/produtos/{produto_id}/aprovar")
async def aprovar_produto(produto_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ProdutoRepository(db)
    use_case = ModerarProdutoUseCase(repo)
    try:
        return await use_case.execute(produto_id, aprovar=True)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/produtos/{produto_id}/rejeitar")
async def rejeitar_produto(produto_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ProdutoRepository(db)
    use_case = ModerarProdutoUseCase(repo)
    try:
        return await use_case.execute(produto_id, aprovar=False)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── Pedidos ──────────────────────────────────────────────


@router.get("/pedidos")
async def listar_pedidos_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = PedidoRepository(db)
    items, total = await repo.list_all(offset=(page - 1) * page_size, limit=page_size)
    return {
        "items": [PedidoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
