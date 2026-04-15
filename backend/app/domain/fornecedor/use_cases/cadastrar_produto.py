"""
Marketplace CB - Use Case: Cadastrar Produto (Fornecedor)
"""

from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from app.domain.shared.catalogo.entities import Produto, StatusProduto
from app.domain.shared.catalogo.interfaces import IProdutoRepository
from app.domain.shared.estoque.entities import Estoque
from app.domain.shared.estoque.interfaces import IEstoqueRepository
from app.domain.fornecedor.interfaces import IFornecedorRepository


class CadastrarProdutoUseCase:
    def __init__(
        self,
        fornecedor_repo: IFornecedorRepository,
        produto_repo: IProdutoRepository,
        estoque_repo: IEstoqueRepository,
    ) -> None:
        self.fornecedor_repo = fornecedor_repo
        self.produto_repo = produto_repo
        self.estoque_repo = estoque_repo

    async def execute(
        self,
        fornecedor_id: UUID,
        sku: str,
        nome: str,
        preco_base: Decimal,
        estoque_inicial: int = 0,
        ean: str | None = None,
        marca: str | None = None,
        modelo: str | None = None,
        categoria_id: UUID | None = None,
        descricao: str | None = None,
        imagens: list[str] | None = None,
        videos: list[str] | None = None,
        atributos: dict[str, Any] | None = None,
        comprimento_cm: Decimal | None = None,
        largura_cm: Decimal | None = None,
        altura_cm: Decimal | None = None,
        peso_kg: Decimal | None = None,
        local_origem: str | None = None,
    ) -> Produto:
        fornecedor = await self.fornecedor_repo.get_by_id(fornecedor_id)
        if not fornecedor:
            raise ValueError("Fornecedor não encontrado")
        if not fornecedor.pode_cadastrar_produto():
            raise ValueError("Fornecedor não está aprovado para cadastrar produtos")

        existing_sku = await self.produto_repo.get_by_sku(sku)
        if existing_sku:
            raise ValueError(f"SKU '{sku}' já existe")

        if imagens and len(imagens) > 15:
            raise ValueError("Máximo de 15 fotos permitidas")

        produto = Produto(
            id=uuid4(),
            fornecedor_id=fornecedor_id,
            categoria_id=categoria_id,
            sku=sku,
            ean=ean,
            nome=nome,
            marca=marca,
            modelo=modelo,
            descricao=descricao,
            preco_base=preco_base,
            estoque_disponivel=estoque_inicial,
            imagens=imagens or [],
            videos=videos or [],
            atributos=atributos or {},
            status=StatusProduto.MODERACAO,
            comprimento_cm=comprimento_cm,
            largura_cm=largura_cm,
            altura_cm=altura_cm,
            peso_kg=peso_kg,
            local_origem=local_origem,
        )

        created = await self.produto_repo.create(produto)

        # Criar registro de estoque
        estoque = Estoque(
            id=uuid4(),
            produto_id=created.id,
            quantidade_disponivel=estoque_inicial,
        )
        await self.estoque_repo.create(estoque)

        return created
