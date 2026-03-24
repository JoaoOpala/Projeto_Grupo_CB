"""
Marketplace CB - Use Case: Aprovar/Rejeitar Fornecedor (Admin)
"""

from uuid import UUID

from app.domain.fornecedor.entities import StatusFornecedor
from app.domain.fornecedor.interfaces import IFornecedorRepository


class AprovarFornecedorUseCase:
    def __init__(self, fornecedor_repo: IFornecedorRepository) -> None:
        self.fornecedor_repo = fornecedor_repo

    async def execute(self, fornecedor_id: UUID, aprovar: bool) -> dict:
        fornecedor = await self.fornecedor_repo.get_by_id(fornecedor_id)
        if not fornecedor:
            raise ValueError("Fornecedor não encontrado")

        if fornecedor.status != StatusFornecedor.PENDENTE:
            raise ValueError(
                f"Fornecedor não está pendente (status atual: {fornecedor.status.value})"
            )

        novo_status = StatusFornecedor.APROVADO if aprovar else StatusFornecedor.REJEITADO
        fornecedor.status = novo_status
        await self.fornecedor_repo.update(fornecedor)

        return {
            "fornecedor_id": str(fornecedor_id),
            "status": novo_status.value,
        }
