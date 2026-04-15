"""
Marketplace CB - Entidades de Domínio Compartilhado: Pedidos
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import UUID, uuid4


class StatusPedido(str, Enum):
    AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO"
    PAGO = "PAGO"
    NOTA_FISCAL_EMITIDA = "NOTA_FISCAL_EMITIDA"
    ETIQUETA_GERADA = "ETIQUETA_GERADA"
    DESPACHADO = "DESPACHADO"
    EM_ENTREGA = "EM_ENTREGA"
    ENTREGUE = "ENTREGUE"
    EM_DEVOLUCAO = "EM_DEVOLUCAO"
    CANCELADO = "CANCELADO"


TRANSICOES_PERMITIDAS: dict[StatusPedido, list[StatusPedido]] = {
    StatusPedido.AGUARDANDO_PAGAMENTO: [StatusPedido.PAGO, StatusPedido.CANCELADO],
    StatusPedido.PAGO: [StatusPedido.NOTA_FISCAL_EMITIDA, StatusPedido.CANCELADO],
    StatusPedido.NOTA_FISCAL_EMITIDA: [StatusPedido.ETIQUETA_GERADA, StatusPedido.CANCELADO],
    StatusPedido.ETIQUETA_GERADA: [StatusPedido.DESPACHADO, StatusPedido.CANCELADO],
    StatusPedido.DESPACHADO: [StatusPedido.EM_ENTREGA],
    StatusPedido.EM_ENTREGA: [StatusPedido.ENTREGUE, StatusPedido.EM_DEVOLUCAO],
    StatusPedido.ENTREGUE: [StatusPedido.EM_DEVOLUCAO],
    StatusPedido.EM_DEVOLUCAO: [],
    StatusPedido.CANCELADO: [],
}


@dataclass
class ItemPedido:
    id: UUID = field(default_factory=uuid4)
    produto_id: UUID = field(default_factory=uuid4)
    quantidade: int = 1
    preco_unitario: Decimal = Decimal("0.00")
    preco_total: Decimal = Decimal("0.00")
    produto_nome: str = ""
    produto_sku: str = ""


@dataclass
class Pedido:
    id: UUID = field(default_factory=uuid4)
    numero_pedido: str = ""
    loja_id: UUID = field(default_factory=uuid4)
    fornecedor_id: UUID = field(default_factory=uuid4)
    cliente_nome: str = ""
    cliente_email: str = ""
    cliente_telefone: str | None = None
    endereco_entrega: dict = field(default_factory=dict)
    itens: list[ItemPedido] = field(default_factory=list)
    valor_produtos: Decimal = Decimal("0.00")
    valor_frete: Decimal = Decimal("0.00")
    valor_desconto: Decimal = Decimal("0.00")
    valor_total: Decimal = Decimal("0.00")
    valor_comissao_plataforma: Decimal = Decimal("0.00")
    valor_comissao_vendedor: Decimal = Decimal("0.00")
    valor_base_fornecedor: Decimal | None = None
    valor_pago_fornecedor: Decimal = Decimal("0.00")
    status: StatusPedido = StatusPedido.AGUARDANDO_PAGAMENTO
    codigo_rastreio: str | None = None
    observacoes: str | None = None
    historico_status: list[dict[str, Any]] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def pode_transicionar_para(self, novo_status: StatusPedido) -> bool:
        return novo_status in TRANSICOES_PERMITIDAS.get(self.status, [])

    def calcular_valor_total(self) -> Decimal:
        self.valor_produtos = sum(
            (item.preco_total for item in self.itens), Decimal("0.00")
        )
        self.valor_total = self.valor_produtos + self.valor_frete - self.valor_desconto
        return self.valor_total

    def registrar_mudanca_status(self, novo_status: StatusPedido, observacoes: str | None = None) -> None:
        entrada: dict[str, Any] = {
            "status": novo_status.value,
            "data_hora": datetime.now().isoformat(),
        }
        if observacoes:
            entrada["observacoes"] = observacoes
        if self.historico_status is None:
            self.historico_status = []
        self.historico_status.append(entrada)
        self.status = novo_status
