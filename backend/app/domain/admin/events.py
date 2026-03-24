"""
Marketplace CB - Domain Events: Admin
"""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class ProdutoModeradoEvent:
    produto_id: UUID
    admin_id: UUID
    aprovado: bool
    timestamp: datetime
