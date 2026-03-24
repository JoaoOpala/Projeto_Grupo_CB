"""
Marketplace CB - Use Case: Criar Fornecedor
"""

from uuid import uuid4

from app.domain.fornecedor.entities import Fornecedor, StatusFornecedor
from app.domain.fornecedor.interfaces import IFornecedorRepository
from app.infrastructure.database.models.fornecedor import FornecedorModel
from app.infrastructure.security.password import hash_password


class CriarFornecedorUseCase:
    def __init__(self, fornecedor_repo: IFornecedorRepository) -> None:
        self.fornecedor_repo = fornecedor_repo

    async def execute(
        self,
        razao_social: str,
        cnpj: str,
        email: str,
        tipo: str,
        senha: str,
        nome_fantasia: str | None = None,
        telefone: str | None = None,
    ) -> Fornecedor:
        existing = await self.fornecedor_repo.get_by_email(email)
        if existing:
            raise ValueError("Email já cadastrado")

        existing_cnpj = await self.fornecedor_repo.get_by_cnpj(cnpj)
        if existing_cnpj:
            raise ValueError("CNPJ já cadastrado")

        model = FornecedorModel(
            id=uuid4(),
            razao_social=razao_social,
            nome_fantasia=nome_fantasia,
            cnpj=cnpj,
            email=email,
            telefone=telefone,
            tipo=tipo,
            status=StatusFornecedor.PENDENTE,
            senha_hash=hash_password(senha),
        )
        created = await self.fornecedor_repo.create_from_model(model)

        return Fornecedor(
            id=created.id,
            razao_social=created.razao_social,
            nome_fantasia=created.nome_fantasia,
            cnpj=created.cnpj,
            email=created.email,
            telefone=created.telefone,
            tipo=created.tipo,
            status=created.status,
            created_at=created.created_at,
            updated_at=created.updated_at,
        )
