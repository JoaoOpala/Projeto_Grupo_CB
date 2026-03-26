"""
Marketplace CB - Router: Autenticação
Login unificado, registro de vendedor e fornecedor, refresh de token.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from app.api.schemas.cliente import ClienteCreate, ClienteResponse
from app.api.schemas.fornecedor import FornecedorCreate, FornecedorResponse
from app.api.schemas.vendedor import VendedorCreate, VendedorResponse
from app.domain.cliente.use_cases.criar_cliente import CriarClienteUseCase
from app.domain.fornecedor.use_cases.criar_fornecedor import CriarFornecedorUseCase
from app.domain.vendedor.use_cases.criar_vendedor import CriarVendedorUseCase
from app.infrastructure.database.repositories.admin_repo import AdminRepository
from app.infrastructure.database.repositories.cliente_repo import ClienteRepository
from app.infrastructure.database.repositories.fornecedor_repo import FornecedorRepository
from app.infrastructure.database.repositories.vendedor_repo import VendedorRepository
from app.infrastructure.database.session import get_db
from app.infrastructure.security.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.infrastructure.security.password import verify_password

router = APIRouter()


async def _authenticate(email: str, senha: str, db: AsyncSession) -> TokenResponse:
    """Lógica de autenticação compartilhada entre login JSON e OAuth2 form."""
    # Tentar como vendedor
    vendedor_repo = VendedorRepository(db)
    vendedor_model = await vendedor_repo.get_model_by_email(email)
    if vendedor_model and verify_password(senha, vendedor_model.senha_hash):
        token_data = {"sub": str(vendedor_model.id), "role": "vendedor", "email": email}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    # Tentar como fornecedor
    fornecedor_repo = FornecedorRepository(db)
    fornecedor_model = await fornecedor_repo.get_model_by_email(email)
    if fornecedor_model and verify_password(senha, fornecedor_model.senha_hash):
        token_data = {"sub": str(fornecedor_model.id), "role": "fornecedor", "email": email}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    # Tentar como admin
    admin_repo = AdminRepository(db)
    admin_model = await admin_repo.get_model_by_email(email)
    if admin_model and admin_model.ativo and verify_password(senha, admin_model.senha_hash):
        token_data = {"sub": str(admin_model.id), "role": "admin", "email": email}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    # Tentar como cliente
    cliente_repo = ClienteRepository(db)
    cliente_model = await cliente_repo.get_model_by_email(email)
    if cliente_model and verify_password(senha, cliente_model.senha_hash):
        token_data = {"sub": str(cliente_model.id), "role": "cliente", "email": email}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou senha inválidos",
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Login via OAuth2 form (usado pelo Swagger Authorize).

    No campo **username** coloque seu **email**.
    No campo **password** coloque sua **senha**.
    Os campos client_id e client_secret podem ficar vazios.
    """
    return await _authenticate(form_data.username, form_data.password, db)


@router.post("/login/json", response_model=TokenResponse)
async def login_json(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Login via JSON body (usado pelo frontend).

    Envie `{"email": "...", "senha": "..."}` no body.
    """
    return await _authenticate(body.email, body.senha, db)


@router.post("/registro/vendedor", response_model=VendedorResponse, status_code=201)
async def registro_vendedor(
    body: VendedorCreate, db: AsyncSession = Depends(get_db)
) -> VendedorResponse:
    """Registrar novo vendedor na plataforma."""
    repo = VendedorRepository(db)
    use_case = CriarVendedorUseCase(repo)
    try:
        vendedor = await use_case.execute(
            nome=body.nome,
            email=body.email,
            cpf_cnpj=body.cpf_cnpj,
            tipo_pessoa=body.tipo_pessoa.value,
            senha=body.senha,
            telefone=body.telefone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return VendedorResponse.model_validate(vendedor)


@router.post("/registro/fornecedor", response_model=FornecedorResponse, status_code=201)
async def registro_fornecedor(
    body: FornecedorCreate, db: AsyncSession = Depends(get_db)
) -> FornecedorResponse:
    """Registrar novo fornecedor na plataforma."""
    repo = FornecedorRepository(db)
    use_case = CriarFornecedorUseCase(repo)
    try:
        fornecedor = await use_case.execute(
            razao_social=body.razao_social,
            cnpj=body.cnpj,
            email=body.email,
            tipo=body.tipo.value,
            senha=body.senha,
            nome_fantasia=body.nome_fantasia,
            telefone=body.telefone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return FornecedorResponse.model_validate(fornecedor)


@router.post("/registro/cliente", response_model=ClienteResponse, status_code=201)
async def registro_cliente(
    body: ClienteCreate, db: AsyncSession = Depends(get_db)
) -> ClienteResponse:
    """Registrar novo cliente na plataforma."""
    repo = ClienteRepository(db)
    use_case = CriarClienteUseCase(repo)
    try:
        cliente = await use_case.execute(
            nome=body.nome,
            email=body.email,
            senha=body.senha,
            cpf=body.cpf,
            telefone=body.telefone,
            endereco=body.endereco,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return ClienteResponse.model_validate(cliente)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest) -> TokenResponse:
    """Renovar access token usando refresh token."""
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )

    token_data = {"sub": payload["sub"], "role": payload["role"], "email": payload["email"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )
