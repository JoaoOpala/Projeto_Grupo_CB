"""
Marketplace CB - Use Case: Atualizar Estoque (Fornecedor)
Atualiza o estoque e registra a movimentação.
"""

from uuid import UUID, uuid4

from app.domain.shared.estoque.entities import Estoque, MovimentacaoEstoque, TipoMovimentacao
from app.domain.shared.estoque.interfaces import IEstoqueRepository, IMovimentacaoEstoqueRepository
from app.domain.shared.catalogo.interfaces import IProdutoRepository


class AtualizarEstoqueUseCase:
    def __init__(
        self,
        produto_repo: IProdutoRepository,
        estoque_repo: IEstoqueRepository,
        movimentacao_repo: IMovimentacaoEstoqueRepository,
    ) -> None:
        self.produto_repo = produto_repo
        self.estoque_repo = estoque_repo
        self.movimentacao_repo = movimentacao_repo

    async def execute(
        self,
        fornecedor_id: UUID,
        produto_id: UUID,
        quantidade_nova: int,
        tipo: TipoMovimentacao = TipoMovimentacao.AJUSTE,
    ) -> Estoque:
        produto = await self.produto_repo.get_by_id(produto_id)
        if not produto:
            raise ValueError("Produto não encontrado")
        if produto.fornecedor_id != fornecedor_id:
            raise PermissionError("Produto não pertence a este fornecedor")

        estoque = await self.estoque_repo.get_by_produto_id(produto_id)
        if not estoque:
            # Criar estoque se não existir
            estoque = Estoque(
                id=uuid4(),
                produto_id=produto_id,
                quantidade_disponivel=0,
            )
            estoque = await self.estoque_repo.create(estoque)

        quantidade_anterior = estoque.quantidade_disponivel
        quantidade_movimentada = abs(quantidade_nova - quantidade_anterior)

        estoque.quantidade_disponivel = quantidade_nova
        estoque.versao += 1
        updated = await self.estoque_repo.update(estoque)

        # Registrar movimentação
        movimentacao = MovimentacaoEstoque(
            id=uuid4(),
            produto_id=produto_id,
            tipo=tipo,
            quantidade_anterior=quantidade_anterior,
            quantidade_movimentada=quantidade_movimentada,
            quantidade_posterior=quantidade_nova,
            referencia=f"Atualização manual pelo fornecedor {fornecedor_id}",
        )
        await self.movimentacao_repo.create(movimentacao)

        return updated
