"""
Marketplace CB - Domain Events: Vendedor
"""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class VendedorCriadoEvent:
    vendedor_id: UUID
    email: str
    timestamp: datetime


@dataclass(frozen=True)
class LojaCriadaEvent:
    loja_id: UUID
    vendedor_id: UUID
    nome_loja: str
    timestamp: datetime
