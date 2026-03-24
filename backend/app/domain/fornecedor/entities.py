"""
Marketplace CB - Entidades de Domínio: Fornecedor
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID, uuid4


class TipoFornecedor(str, Enum):
    INDUSTRIA = "INDUSTRIA"
    DISTRIBUIDOR = "DISTRIBUIDOR"


class StatusFornecedor(str, Enum):
    PENDENTE = "PENDENTE"
    APROVADO = "APROVADO"
    REJEITADO = "REJEITADO"
    SUSPENSO = "SUSPENSO"


@dataclass
class CondicoesComerciais:
    id: UUID = field(default_factory=uuid4)
    fornecedor_id: UUID = field(default_factory=uuid4)
    margem_minima: Decimal = Decimal("0.15")
    prazo_entrega_dias: int = 7
    politica_devolucao: str | None = None


@dataclass
class Fornecedor:
    id: UUID = field(default_factory=uuid4)
    razao_social: str = ""
    nome_fantasia: str | None = None
    cnpj: str = ""
    email: str = ""
    telefone: str | None = None
    tipo: TipoFornecedor = TipoFornecedor.DISTRIBUIDOR
    status: StatusFornecedor = StatusFornecedor.PENDENTE
    condicoes_comerciais: CondicoesComerciais | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def esta_aprovado(self) -> bool:
        return self.status == StatusFornecedor.APROVADO

    def pode_cadastrar_produto(self) -> bool:
        return self.esta_aprovado()
