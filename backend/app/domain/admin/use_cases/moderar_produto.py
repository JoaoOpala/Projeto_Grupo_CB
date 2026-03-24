"""
Marketplace CB - Use Case: Moderar Produto (Admin)
"""

from uuid import UUID

from app.domain.shared.catalogo.entities import StatusProduto
from app.domain.shared.catalogo.interfaces import IProdutoRepository


class ModerarProdutoUseCase:
    def __init__(self, produto_repo: IProdutoRepository) -> None:
        self.produto_repo = produto_repo

    async def execute(self, produto_id: UUID, aprovar: bool) -> dict:
        produto = await self.produto_repo.get_by_id(produto_id)
        if not produto:
            raise ValueError("Produto não encontrado")

        if produto.status != StatusProduto.MODERACAO:
            raise ValueError(
                f"Produto não está em moderação (status atual: {produto.status.value})"
            )

        novo_status = StatusProduto.ATIVO if aprovar else StatusProduto.REJEITADO
        produto.status = novo_status
        await self.produto_repo.update(produto)

        return {
            "produto_id": str(produto_id),
            "status": novo_status.value,
        }
