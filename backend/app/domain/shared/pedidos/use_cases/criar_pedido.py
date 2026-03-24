"""
Marketplace CB - Use Case: Criar Pedido
Cria pedido com reserva automática de estoque (lock pessimista).
"""

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID, uuid4

from app.domain.shared.catalogo.interfaces import IProdutoRepository
from app.domain.shared.estoque.entities import MovimentacaoEstoque, TipoMovimentacao
from app.domain.shared.estoque.interfaces import IEstoqueRepository, IMovimentacaoEstoqueRepository
from app.domain.shared.pedidos.entities import ItemPedido, Pedido, StatusPedido
from app.domain.shared.pedidos.interfaces import IPedidoRepository
from app.domain.vendedor.interfaces import ILojaRepository


@dataclass
class ItemPedidoInput:
    produto_id: UUID
    quantidade: int


class CriarPedidoUseCase:
    def __init__(
        self,
        pedido_repo: IPedidoRepository,
        produto_repo: IProdutoRepository,
        estoque_repo: IEstoqueRepository,
        movimentacao_repo: IMovimentacaoEstoqueRepository,
        loja_repo: ILojaRepository,
    ) -> None:
        self.pedido_repo = pedido_repo
        self.produto_repo = produto_repo
        self.estoque_repo = estoque_repo
        self.movimentacao_repo = movimentacao_repo
        self.loja_repo = loja_repo

    async def execute(
        self,
        loja_id: UUID,
        cliente_nome: str,
        cliente_email: str,
        endereco_entrega: dict,
        itens_input: list[ItemPedidoInput],
        cliente_telefone: str | None = None,
    ) -> Pedido:
        loja = await self.loja_repo.get_by_id(loja_id)
        if not loja:
            raise ValueError("Loja não encontrada")

        itens: list[ItemPedido] = []
        fornecedor_id: UUID | None = None

        # Validar e reservar estoque para cada item
        for item_input in itens_input:
            produto = await self.produto_repo.get_by_id(item_input.produto_id)
            if not produto:
                raise ValueError(f"Produto {item_input.produto_id} não encontrado")

            if fornecedor_id is None:
                fornecedor_id = produto.fornecedor_id

            # Lock pessimista no estoque
            estoque = await self.estoque_repo.get_by_produto_id_with_lock(
                item_input.produto_id
            )
            if not estoque or not estoque.tem_disponivel(item_input.quantidade):
                disponivel = estoque.quantidade_disponivel if estoque else 0
                raise ValueError(
                    f"Estoque insuficiente para {produto.nome}: "
                    f"disponível={disponivel}, solicitado={item_input.quantidade}"
                )

            # Reservar estoque
            qtd_anterior = estoque.quantidade_disponivel
            estoque.reservar(item_input.quantidade)
            await self.estoque_repo.update(estoque)

            # Registrar movimentação
            mov = MovimentacaoEstoque(
                id=uuid4(),
                produto_id=item_input.produto_id,
                tipo=TipoMovimentacao.RESERVA,
                quantidade_anterior=qtd_anterior,
                quantidade_movimentada=item_input.quantidade,
                quantidade_posterior=estoque.quantidade_disponivel,
            )
            await self.movimentacao_repo.create(mov)

            preco_total = produto.preco_venda_sugerido * item_input.quantidade
            itens.append(
                ItemPedido(
                    id=uuid4(),
                    produto_id=item_input.produto_id,
                    quantidade=item_input.quantidade,
                    preco_unitario=produto.preco_venda_sugerido,
                    preco_total=preco_total,
                    produto_nome=produto.nome,
                    produto_sku=produto.sku,
                )
            )

        valor_produtos = sum((i.preco_total for i in itens), Decimal("0.00"))
        valor_total = valor_produtos  # frete será adicionado depois

        pedido = Pedido(
            id=uuid4(),
            loja_id=loja_id,
            fornecedor_id=fornecedor_id,
            cliente_nome=cliente_nome,
            cliente_email=cliente_email,
            cliente_telefone=cliente_telefone,
            endereco_entrega=endereco_entrega,
            itens=itens,
            valor_produtos=valor_produtos,
            valor_total=valor_total,
            status=StatusPedido.AGUARDANDO_PAGAMENTO,
        )

        return await self.pedido_repo.create(pedido)
