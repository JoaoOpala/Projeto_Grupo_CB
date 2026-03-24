"""
Marketplace CB - Domain Events: Fornecedor
"""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class FornecedorCriadoEvent:
    fornecedor_id: UUID
    cnpj: str
    timestamp: datetime


@dataclass(frozen=True)
class FornecedorAprovadoEvent:
    fornecedor_id: UUID
    aprovado_por: UUID
    timestamp: datetime
