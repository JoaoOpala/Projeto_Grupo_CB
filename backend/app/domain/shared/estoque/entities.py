"""
Marketplace CB - Entidades de Domínio Compartilhado: Estoque
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class TipoMovimentacao(str, Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    AJUSTE = "AJUSTE"
    RESERVA = "RESERVA"
    LIBERACAO = "LIBERACAO"


@dataclass
class Estoque:
    id: UUID = field(default_factory=uuid4)
    produto_id: UUID = field(default_factory=uuid4)
    quantidade_disponivel: int = 0
    quantidade_reservada: int = 0
    versao: int = 1
    atualizado_em: datetime = field(default_factory=datetime.now)

    @property
    def quantidade_total(self) -> int:
        return self.quantidade_disponivel + self.quantidade_reservada

    def tem_disponivel(self, quantidade: int) -> bool:
        return self.quantidade_disponivel >= quantidade

    def reservar(self, quantidade: int) -> None:
        if not self.tem_disponivel(quantidade):
            raise ValueError(
                f"Estoque insuficiente: disponível={self.quantidade_disponivel}, "
                f"solicitado={quantidade}"
            )
        self.quantidade_disponivel -= quantidade
        self.quantidade_reservada += quantidade
        self.versao += 1

    def liberar_reserva(self, quantidade: int) -> None:
        self.quantidade_reservada -= quantidade
        self.quantidade_disponivel += quantidade
        self.versao += 1

    def confirmar_reserva(self, quantidade: int) -> None:
        self.quantidade_reservada -= quantidade
        self.versao += 1


@dataclass
class MovimentacaoEstoque:
    id: UUID = field(default_factory=uuid4)
    produto_id: UUID = field(default_factory=uuid4)
    pedido_id: UUID | None = None
    tipo: TipoMovimentacao = TipoMovimentacao.ENTRADA
    quantidade_anterior: int = 0
    quantidade_movimentada: int = 0
    quantidade_posterior: int = 0
    referencia: str | None = None
    criado_em: datetime = field(default_factory=datetime.now)
