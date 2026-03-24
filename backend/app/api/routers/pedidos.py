"""
Marketplace CB - Router: Pedidos
Endpoints de criação e consulta de pedidos.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.pedido import PedidoCreate, PedidoResponse
from app.domain.shared.pedidos.use_cases.criar_pedido import CriarPedidoUseCase, ItemPedidoInput
from app.infrastructure.database.repositories.estoque_repo import (
    EstoqueRepository,
    MovimentacaoEstoqueRepository,
)
from app.infrastructure.database.repositories.pedido_repo import PedidoRepository
from app.infrastructure.database.repositories.produto_repo import ProdutoRepository
from app.infrastructure.database.repositories.vendedor_repo import LojaRepository
from app.infrastructure.database.session import get_db

router = APIRouter()


@router.post("/", response_model=PedidoResponse, status_code=201)
async def criar_pedido(
    body: PedidoCreate,
    db: AsyncSession = Depends(get_db),
):
    """Criar novo pedido (checkout com reserva de estoque)."""
    pedido_repo = PedidoRepository(db)
    produto_repo = ProdutoRepository(db)
    estoque_repo = EstoqueRepository(db)
    mov_repo = MovimentacaoEstoqueRepository(db)
    loja_repo = LojaRepository(db)

    use_case = CriarPedidoUseCase(
        pedido_repo=pedido_repo,
        produto_repo=produto_repo,
        estoque_repo=estoque_repo,
        movimentacao_repo=mov_repo,
        loja_repo=loja_repo,
    )
    try:
        pedido = await use_case.execute(
            loja_id=body.loja_id,
            cliente_nome=body.cliente_nome,
            cliente_email=body.cliente_email,
            endereco_entrega=body.endereco_entrega.model_dump(),
            itens_input=[
                ItemPedidoInput(produto_id=i.produto_id, quantidade=i.quantidade)
                for i in body.itens
            ],
            cliente_telefone=body.cliente_telefone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return PedidoResponse.model_validate(pedido)


@router.get("/{pedido_id}", response_model=PedidoResponse)
async def get_pedido(
    pedido_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Obter detalhes de um pedido por ID."""
    repo = PedidoRepository(db)
    pedido = await repo.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return PedidoResponse.model_validate(pedido)


@router.get("/rastreio/{numero_pedido}", response_model=PedidoResponse)
async def rastrear_pedido(
    numero_pedido: str,
    db: AsyncSession = Depends(get_db),
):
    """Rastrear pedido pelo número."""
    repo = PedidoRepository(db)
    pedido = await repo.get_by_numero(numero_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return PedidoResponse.model_validate(pedido)
