"""
Marketplace CB - Use Case: Criar Vendedor
"""

from uuid import uuid4

from app.domain.vendedor.entities import StatusVendedor, Vendedor
from app.domain.vendedor.interfaces import IVendedorRepository
from app.infrastructure.database.models.vendedor import VendedorModel
from app.infrastructure.security.password import hash_password


class CriarVendedorUseCase:
    def __init__(self, vendedor_repo: IVendedorRepository) -> None:
        self.vendedor_repo = vendedor_repo

    async def execute(
        self,
        nome: str,
        email: str,
        cpf_cnpj: str,
        tipo_pessoa: str,
        senha: str,
        telefone: str | None = None,
    ) -> Vendedor:
        existing = await self.vendedor_repo.get_by_email(email)
        if existing:
            raise ValueError("Email já cadastrado")

        existing_doc = await self.vendedor_repo.get_by_cpf_cnpj(cpf_cnpj)
        if existing_doc:
            raise ValueError("CPF/CNPJ já cadastrado")

        model = VendedorModel(
            id=uuid4(),
            nome=nome,
            email=email,
            cpf_cnpj=cpf_cnpj,
            telefone=telefone,
            tipo_pessoa=tipo_pessoa,
            status=StatusVendedor.PENDENTE,
            senha_hash=hash_password(senha),
        )
        created = await self.vendedor_repo.create_from_model(model)

        return Vendedor(
            id=created.id,
            nome=created.nome,
            email=created.email,
            cpf_cnpj=created.cpf_cnpj,
            telefone=created.telefone,
            tipo_pessoa=created.tipo_pessoa,
            status=created.status,
            comissao_padrao=created.comissao_padrao,
            created_at=created.created_at,
            updated_at=created.updated_at,
        )
