"""
Marketplace CB - Router: Módulo Fornecedor
Endpoints autenticados para perfil, produtos, estoque e pedidos.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id, require_role
from app.api.schemas.fornecedor import (
    CondicaoComercialCreate,
    CondicaoComercialResponse,
    FornecedorResponse,
    FornecedorUpdate,
)
from app.api.schemas.pedido import PedidoResponse, PedidoUpdateStatus
from app.api.schemas.produto import ProdutoCreate, ProdutoResponse, ProdutoUpdate
from app.domain.fornecedor.use_cases.atualizar_estoque import AtualizarEstoqueUseCase
from app.domain.fornecedor.use_cases.cadastrar_produto import CadastrarProdutoUseCase
from app.domain.shared.pedidos.use_cases.atualizar_status import AtualizarStatusPedidoUseCase
from app.infrastructure.database.repositories.estoque_repo import (
    EstoqueRepository,
    MovimentacaoEstoqueRepository,
)
from app.infrastructure.database.repositories.fornecedor_repo import FornecedorRepository
from app.infrastructure.database.repositories.pedido_repo import PedidoRepository
from app.infrastructure.database.repositories.produto_repo import ProdutoRepository
from app.infrastructure.database.session import get_db

router = APIRouter(dependencies=[Depends(require_role(["fornecedor"]))])


# ── Perfil ───────────────────────────────────────────────


@router.get("/me", response_model=FornecedorResponse)
async def get_perfil_fornecedor(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    fornecedor = await repo.get_by_id(user_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    return FornecedorResponse.model_validate(fornecedor)


@router.put("/me", response_model=FornecedorResponse)
async def update_perfil_fornecedor(
    body: FornecedorUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    fornecedor = await repo.get_by_id(user_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    if body.razao_social is not None:
        fornecedor.razao_social = body.razao_social
    if body.nome_fantasia is not None:
        fornecedor.nome_fantasia = body.nome_fantasia
    if body.telefone is not None:
        fornecedor.telefone = body.telefone
    updated = await repo.update(fornecedor)
    return FornecedorResponse.model_validate(updated)


# ── Condições Comerciais ─────────────────────────────────


@router.get("/condicoes-comerciais", response_model=CondicaoComercialResponse | None)
async def get_condicoes_comerciais(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    fornecedor = await repo.get_by_id(user_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    if not fornecedor.condicoes_comerciais:
        return None
    return CondicaoComercialResponse.model_validate(fornecedor.condicoes_comerciais)


@router.put("/condicoes-comerciais", response_model=CondicaoComercialResponse)
async def update_condicoes_comerciais(
    body: CondicaoComercialCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = FornecedorRepository(db)
    model = await repo.save_condicao_comercial(
        fornecedor_id=user_id,
        margem_minima=float(body.margem_minima),
        prazo_entrega_dias=body.prazo_entrega_dias,
        politica_devolucao=body.politica_devolucao,
    )
    return CondicaoComercialResponse.model_validate(model)


# ── Produtos ─────────────────────────────────────────────


@router.get("/produtos")
async def listar_produtos_fornecedor(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoRepository(db)
    items, total = await repo.list_by_fornecedor(
        user_id, offset=(page - 1) * page_size, limit=page_size
    )
    return {
        "items": [ProdutoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/produtos", response_model=ProdutoResponse, status_code=201)
async def cadastrar_produto(
    body: ProdutoCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    fornecedor_repo = FornecedorRepository(db)
    produto_repo = ProdutoRepository(db)
    estoque_repo = EstoqueRepository(db)
    use_case = CadastrarProdutoUseCase(fornecedor_repo, produto_repo, estoque_repo)
    try:
        produto = await use_case.execute(
            fornecedor_id=user_id,
            sku=body.sku,
            nome=body.nome,
            preco_base=body.preco_base,
            estoque_inicial=body.estoque_disponivel,
            ean=body.ean,
            marca=body.marca,
            modelo=body.modelo,
            categoria_id=body.categoria_id,
            descricao=body.descricao,
            imagens=body.imagens,
            videos=body.videos,
            atributos=body.atributos,
            comprimento_cm=body.comprimento_cm,
            largura_cm=body.largura_cm,
            altura_cm=body.altura_cm,
            peso_kg=body.peso_kg,
            local_origem=body.local_origem,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return ProdutoResponse.model_validate(produto)


@router.get("/produtos/{produto_id}", response_model=ProdutoResponse)
async def get_produto(
    produto_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoRepository(db)
    produto = await repo.get_by_id(produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return ProdutoResponse.model_validate(produto)


@router.put("/produtos/{produto_id}", response_model=ProdutoResponse)
async def update_produto(
    produto_id: UUID,
    body: ProdutoUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = ProdutoRepository(db)
    produto = await repo.get_by_id(produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if produto.fornecedor_id != user_id:
        raise HTTPException(status_code=403, detail="Produto não pertence a este fornecedor")

    if body.nome is not None:
        produto.nome = body.nome
    if body.marca is not None:
        produto.marca = body.marca
    if body.modelo is not None:
        produto.modelo = body.modelo
    if body.descricao is not None:
        produto.descricao = body.descricao
    if body.preco_base is not None:
        produto.preco_base = body.preco_base
    if body.imagens is not None:
        if len(body.imagens) > 15:
            raise HTTPException(status_code=400, detail="Máximo de 15 fotos permitidas")
        produto.imagens = body.imagens
    if body.videos is not None:
        produto.videos = body.videos
    if body.atributos is not None:
        produto.atributos = body.atributos
    if body.categoria_id is not None:
        produto.categoria_id = body.categoria_id
    if body.comprimento_cm is not None:
        produto.comprimento_cm = body.comprimento_cm
    if body.largura_cm is not None:
        produto.largura_cm = body.largura_cm
    if body.altura_cm is not None:
        produto.altura_cm = body.altura_cm
    if body.peso_kg is not None:
        produto.peso_kg = body.peso_kg
    if body.local_origem is not None:
        produto.local_origem = body.local_origem

    updated = await repo.update(produto)
    return ProdutoResponse.model_validate(updated)


# ── Estoque ──────────────────────────────────────────────


@router.get("/estoque")
async def listar_estoque(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    produto_repo = ProdutoRepository(db)
    produtos, _ = await produto_repo.list_by_fornecedor(user_id, offset=0, limit=1000)
    estoque_repo = EstoqueRepository(db)
    resultado = []
    for p in produtos:
        est = await estoque_repo.get_by_produto_id(p.id)
        resultado.append({
            "produto_id": str(p.id),
            "sku": p.sku,
            "nome": p.nome,
            "quantidade_disponivel": est.quantidade_disponivel if est else 0,
            "quantidade_reservada": est.quantidade_reservada if est else 0,
        })
    return resultado


@router.put("/estoque/{produto_id}")
async def atualizar_estoque(
    produto_id: UUID,
    quantidade: int = Query(..., ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    produto_repo = ProdutoRepository(db)
    estoque_repo = EstoqueRepository(db)
    mov_repo = MovimentacaoEstoqueRepository(db)
    use_case = AtualizarEstoqueUseCase(produto_repo, estoque_repo, mov_repo)
    try:
        estoque = await use_case.execute(
            fornecedor_id=user_id,
            produto_id=produto_id,
            quantidade_nova=quantidade,
        )
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {
        "produto_id": str(produto_id),
        "quantidade_disponivel": estoque.quantidade_disponivel,
        "quantidade_reservada": estoque.quantidade_reservada,
        "versao": estoque.versao,
    }


# ── Pedidos ──────────────────────────────────────────────


@router.get("/pedidos")
async def listar_pedidos_fornecedor(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    repo = PedidoRepository(db)
    items, total = await repo.list_by_fornecedor(
        user_id, offset=(page - 1) * page_size, limit=page_size
    )
    return {
        "items": [PedidoResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/pedidos/{pedido_id}", response_model=PedidoResponse)
async def get_pedido_fornecedor(
    pedido_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = PedidoRepository(db)
    pedido = await repo.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return PedidoResponse.model_validate(pedido)


@router.put("/pedidos/{pedido_id}/status")
async def atualizar_status_pedido(
    pedido_id: UUID,
    body: PedidoUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    repo = PedidoRepository(db)
    use_case = AtualizarStatusPedidoUseCase(repo)
    try:
        result = await use_case.execute(
            pedido_id=pedido_id,
            novo_status=body.status,
            codigo_rastreio=body.codigo_rastreio,
            observacoes=body.observacoes,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return result
