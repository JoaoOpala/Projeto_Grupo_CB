"""
Marketplace CB - Use Case: Criar Cliente
"""

from uuid import uuid4

from app.domain.cliente.entities import Cliente, StatusCliente
from app.domain.cliente.interfaces import IClienteRepository
from app.infrastructure.database.models.cliente import ClienteModel
from app.infrastructure.security.password import hash_password


class CriarClienteUseCase:
    def __init__(self, cliente_repo: IClienteRepository) -> None:
        self.cliente_repo = cliente_repo

    async def execute(
        self,
        nome: str,
        email: str,
        senha: str,
        cpf: str | None = None,
        telefone: str | None = None,
        endereco: str | None = None,
    ) -> Cliente:
        existing = await self.cliente_repo.get_by_email(email)
        if existing:
            raise ValueError("Email já cadastrado")

        if cpf:
            existing_cpf = await self.cliente_repo.get_by_cpf(cpf)
            if existing_cpf:
                raise ValueError("CPF já cadastrado")

        model = ClienteModel(
            id=uuid4(),
            nome=nome,
            email=email,
            cpf=cpf,
            telefone=telefone,
            endereco=endereco,
            status=StatusCliente.ATIVO,
            senha_hash=hash_password(senha),
            email_verificado=False,
        )
        created = await self.cliente_repo.create_from_model(model)

        return Cliente(
            id=created.id,
            nome=created.nome,
            email=created.email,
            cpf=created.cpf,
            telefone=created.telefone,
            endereco=created.endereco,
            status=created.status,
            email_verificado=created.email_verificado,
            created_at=created.created_at,
            updated_at=created.updated_at,
        )
