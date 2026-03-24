"""
Marketplace CB - Use Case: Criar Loja
"""

import re
from uuid import UUID, uuid4

from app.domain.vendedor.entities import Loja
from app.domain.vendedor.interfaces import ILojaRepository, IVendedorRepository


def _gerar_slug(nome: str) -> str:
    slug = nome.lower().strip()
    slug = re.sub(r"[àáâãä]", "a", slug)
    slug = re.sub(r"[èéêë]", "e", slug)
    slug = re.sub(r"[ìíîï]", "i", slug)
    slug = re.sub(r"[òóôõö]", "o", slug)
    slug = re.sub(r"[ùúûü]", "u", slug)
    slug = re.sub(r"[ç]", "c", slug)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


class CriarLojaUseCase:
    def __init__(
        self,
        vendedor_repo: IVendedorRepository,
        loja_repo: ILojaRepository,
    ) -> None:
        self.vendedor_repo = vendedor_repo
        self.loja_repo = loja_repo

    async def execute(
        self,
        vendedor_id: UUID,
        nome_loja: str,
        descricao: str | None = None,
        logo_url: str | None = None,
    ) -> Loja:
        vendedor = await self.vendedor_repo.get_by_id(vendedor_id)
        if not vendedor:
            raise ValueError("Vendedor não encontrado")

        existing_loja = await self.loja_repo.get_by_vendedor_id(vendedor_id)
        if existing_loja:
            raise ValueError("Vendedor já possui uma loja")

        slug = _gerar_slug(nome_loja)
        existing_slug = await self.loja_repo.get_by_slug(slug)
        if existing_slug:
            slug = f"{slug}-{uuid4().hex[:6]}"

        loja = Loja(
            id=uuid4(),
            vendedor_id=vendedor_id,
            nome_loja=nome_loja,
            slug=slug,
            descricao=descricao,
            logo_url=logo_url,
        )

        return await self.loja_repo.create(loja)
