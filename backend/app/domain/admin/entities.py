"""
Marketplace CB - Entidades de Domínio: Administrador
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class RoleAdmin(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    MODERADOR = "MODERADOR"
    SUPORTE = "SUPORTE"


@dataclass
class Admin:
    id: UUID = field(default_factory=uuid4)
    nome: str = ""
    email: str = ""
    role: RoleAdmin = RoleAdmin.MODERADOR
    ativo: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def pode_aprovar_fornecedor(self) -> bool:
        return self.role in (RoleAdmin.SUPER_ADMIN, RoleAdmin.MODERADOR)

    def pode_moderar_produto(self) -> bool:
        return self.role in (RoleAdmin.SUPER_ADMIN, RoleAdmin.MODERADOR)

    def pode_configurar_comissoes(self) -> bool:
        return self.role == RoleAdmin.SUPER_ADMIN
