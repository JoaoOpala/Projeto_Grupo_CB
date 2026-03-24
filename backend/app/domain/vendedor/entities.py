"""
Marketplace CB - Entidades de Domínio: Vendedor e Loja
Entidades puras de domínio, sem dependência de infraestrutura.
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID, uuid4


class TipoPessoa(str, Enum):
    FISICA = "FISICA"
    JURIDICA = "JURIDICA"


class StatusVendedor(str, Enum):
    PENDENTE = "PENDENTE"
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"


@dataclass
class Loja:
    id: UUID = field(default_factory=uuid4)
    vendedor_id: UUID = field(default_factory=uuid4)
    nome_loja: str = ""
    slug: str = ""
    descricao: str | None = None
    logo_url: str | None = None
    ativa: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Vendedor:
    id: UUID = field(default_factory=uuid4)
    nome: str = ""
    email: str = ""
    cpf_cnpj: str = ""
    telefone: str | None = None
    tipo_pessoa: TipoPessoa = TipoPessoa.FISICA
    status: StatusVendedor = StatusVendedor.PENDENTE
    comissao_padrao: Decimal = Decimal("0.10")
    loja: Loja | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def esta_ativo(self) -> bool:
        return self.status == StatusVendedor.ATIVO

    def pode_vender(self) -> bool:
        return self.esta_ativo() and self.loja is not None and self.loja.ativa
