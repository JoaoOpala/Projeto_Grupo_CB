"""
Marketplace CB - Entidades de Domínio: Cliente
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class StatusCliente(str, Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"


@dataclass
class Cliente:
    id: UUID = field(default_factory=uuid4)
    nome: str = ""
    email: str = ""
    cpf: str | None = None
    telefone: str | None = None
    endereco: str | None = None
    status: StatusCliente = StatusCliente.ATIVO
    email_verificado: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def esta_ativo(self) -> bool:
        return self.status == StatusCliente.ATIVO
