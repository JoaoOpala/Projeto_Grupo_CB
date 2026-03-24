"""
Marketplace CB - Use Case: Adicionar Produto à Loja do Vendedor
"""

from decimal import Decimal
from uuid import UUID, uuid4

from app.domain.shared.catalogo.entities import ProdutoLoja
from app.domain.shared.catalogo.interfaces import IProdutoLojaRepository, IProdutoRepository
from app.domain.vendedor.interfaces import ILojaRepository


class AdicionarProdutoLojaUseCase:
    def __init__(
        self,
        loja_repo: ILojaRepository,
        produto_repo: IProdutoRepository,
        produto_loja_repo: IProdutoLojaRepository,
    ) -> None:
        self.loja_repo = loja_repo
        self.produto_repo = produto_repo
        self.produto_loja_repo = produto_loja_repo

    async def execute(
        self,
        vendedor_id: UUID,
        produto_id: UUID,
        preco_venda: Decimal,
    ) -> ProdutoLoja:
        loja = await self.loja_repo.get_by_vendedor_id(vendedor_id)
        if not loja:
            raise ValueError("Vendedor não possui loja")

        produto = await self.produto_repo.get_by_id(produto_id)
        if not produto:
            raise ValueError("Produto não encontrado")
        if not produto.esta_disponivel():
            raise ValueError("Produto não está ativo/disponível")

        if preco_venda < produto.preco_base:
            raise ValueError("Preço de venda não pode ser menor que o preço base")

        margem = produto.calcular_margem(preco_venda)

        produto_loja = ProdutoLoja(
            id=uuid4(),
            produto_id=produto_id,
            loja_id=loja.id,
            preco_venda=preco_venda,
            margem=margem,
        )

        return await self.produto_loja_repo.create(produto_loja)
