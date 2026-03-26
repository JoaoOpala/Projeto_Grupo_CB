"""
Marketplace CB - Router: Módulo Cliente
Endpoints para o cliente final: perfil, pedidos.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id, require_role
from app.api.schemas.cliente import ClienteResponse, ClienteUpdate
from app.infrastructure.database.repositories.cliente_repo import ClienteRepository
from app.infrastructure.database.session import get_db

router = APIRouter(dependencies=[Depends(require_role(["cliente"]))])


@router.get("/me", response_model=ClienteResponse)
async def get_meu_perfil(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Retorna o perfil do cliente autenticado."""
    repo = ClienteRepository(db)
    cliente = await repo.get_by_id(user_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteResponse.model_validate(cliente)


@router.put("/me", response_model=ClienteResponse)
async def atualizar_perfil(
    body: ClienteUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza dados do perfil do cliente."""
    repo = ClienteRepository(db)
    cliente = await repo.get_by_id(user_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    if body.nome is not None:
        cliente.nome = body.nome
    if body.telefone is not None:
        cliente.telefone = body.telefone
    if body.endereco is not None:
        cliente.endereco = body.endereco

    updated = await repo.update(cliente)
    return ClienteResponse.model_validate(updated.__dict__)
