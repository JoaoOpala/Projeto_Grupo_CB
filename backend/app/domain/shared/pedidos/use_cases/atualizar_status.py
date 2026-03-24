"""
Marketplace CB - Use Case: Atualizar Status do Pedido
Aplica máquina de estados com transições permitidas.
"""

from uuid import UUID

from app.domain.shared.pedidos.entities import StatusPedido
from app.domain.shared.pedidos.interfaces import IPedidoRepository


class AtualizarStatusPedidoUseCase:
    def __init__(self, pedido_repo: IPedidoRepository) -> None:
        self.pedido_repo = pedido_repo

    async def execute(
        self,
        pedido_id: UUID,
        novo_status: StatusPedido,
        codigo_rastreio: str | None = None,
        observacoes: str | None = None,
    ) -> dict:
        pedido = await self.pedido_repo.get_by_id(pedido_id)
        if not pedido:
            raise ValueError("Pedido não encontrado")

        if not pedido.pode_transicionar_para(novo_status):
            raise ValueError(
                f"Transição inválida: {pedido.status.value} → {novo_status.value}"
            )

        pedido.status = novo_status
        if codigo_rastreio:
            pedido.codigo_rastreio = codigo_rastreio
        if observacoes:
            pedido.observacoes = observacoes

        updated = await self.pedido_repo.update(pedido)
        return {
            "pedido_id": str(updated.id),
            "numero_pedido": updated.numero_pedido,
            "status": updated.status.value,
        }
