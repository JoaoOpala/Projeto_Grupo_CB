"""
Marketplace CB - Seed para Desenvolvimento
Lê dados de seed_data.json e popula o banco.

Uso: python seed.py
"""

import asyncio
import json
import uuid
from pathlib import Path

from sqlalchemy import select

from app.infrastructure.database.session import AsyncSessionLocal, engine
from app.infrastructure.database.base import Base
from app.infrastructure.security.password import hash_password

# Registrar todos os models no metadata
import app.infrastructure.database.models.vendedor  # noqa: F401
import app.infrastructure.database.models.fornecedor  # noqa: F401
import app.infrastructure.database.models.produto  # noqa: F401
import app.infrastructure.database.models.pedido  # noqa: F401
import app.infrastructure.database.models.estoque  # noqa: F401
import app.infrastructure.database.models.admin  # noqa: F401

from app.infrastructure.database.models.admin import AdminModel, RoleAdminEnum
from app.infrastructure.database.models.vendedor import (
    VendedorModel, LojaModel, TipoPessoa, StatusVendedor,
)
from app.infrastructure.database.models.fornecedor import (
    FornecedorModel, CondicaoComercialModel, TipoFornecedor, StatusFornecedor,
)
from app.infrastructure.database.models.produto import (
    CategoriaModel, ProdutoModel, ProdutoLojaModel, StatusProduto,
)
from app.infrastructure.database.models.estoque import EstoqueModel

DATA_FILE = Path(__file__).parent / "seed_data.json"

# ── Enum maps (JSON string → Python enum) ──────────────────
ROLE_MAP = {e.value: e for e in RoleAdminEnum}
TIPO_PESSOA_MAP = {e.value: e for e in TipoPessoa}
TIPO_FORN_MAP = {e.value: e for e in TipoFornecedor}


def _load_data() -> dict:
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(AdminModel).limit(1))
        if existing.scalar_one_or_none():
            print("Banco já possui dados. Seed ignorado.")
            return

        data = _load_data()

        # Caches de senha (evita re-hash da mesma senha)
        _pw_cache: dict[str, str] = {}

        def _hash(pw: str) -> str:
            if pw not in _pw_cache:
                _pw_cache[pw] = hash_password(pw)
            return _pw_cache[pw]

        # ── Admins ──
        for a in data["admins"]:
            session.add(AdminModel(
                id=uuid.uuid4(),
                nome=a["nome"],
                email=a["email"],
                senha_hash=_hash(a["senha"]),
                role=ROLE_MAP[a["role"]],
                ativo=True,
            ))

        # ── Vendedores + Lojas ──
        loja_ids: list[uuid.UUID] = []
        for v in data["vendedores"]:
            vid = uuid.uuid4()
            session.add(VendedorModel(
                id=vid,
                nome=v["nome"],
                email=v["email"],
                cpf_cnpj=v["cpf_cnpj"],
                telefone=v.get("telefone"),
                tipo_pessoa=TIPO_PESSOA_MAP[v["tipo_pessoa"]],
                status=StatusVendedor.ATIVO,
                comissao_padrao=v["comissao_padrao"],
                senha_hash=_hash(v["senha"]),
            ))
            lid = uuid.uuid4()
            loja_ids.append(lid)
            lj = v["loja"]
            session.add(LojaModel(
                id=lid,
                vendedor_id=vid,
                nome_loja=lj["nome_loja"],
                slug=lj["slug"],
                descricao=lj.get("descricao"),
                ativa=True,
            ))

        # ── Fornecedores + Condições Comerciais ──
        forn_map: dict[str, uuid.UUID] = {}
        for f in data["fornecedores"]:
            fid = uuid.uuid4()
            forn_map[f["key"]] = fid
            session.add(FornecedorModel(
                id=fid,
                razao_social=f["razao_social"],
                nome_fantasia=f.get("nome_fantasia"),
                cnpj=f["cnpj"],
                email=f["email"],
                telefone=f.get("telefone"),
                tipo=TIPO_FORN_MAP[f["tipo"]],
                status=StatusFornecedor.APROVADO,
                senha_hash=_hash(f["senha"]),
            ))
            cc = f["condicao_comercial"]
            session.add(CondicaoComercialModel(
                id=uuid.uuid4(),
                fornecedor_id=fid,
                margem_minima=cc["margem_minima"],
                prazo_entrega_dias=cc["prazo_entrega_dias"],
                politica_devolucao=cc.get("politica_devolucao"),
            ))

        # ── Categorias ──
        cat_map: dict[str, uuid.UUID] = {}
        for c in data["categorias"]:
            cid = uuid.uuid4()
            cat_map[c["key"]] = cid
            session.add(CategoriaModel(
                id=cid,
                nome=c["nome"],
                slug=c["slug"],
                descricao=c.get("descricao"),
                ativa=True,
            ))

        # ── Produtos + Estoque ──
        prod_map: dict[str, uuid.UUID] = {}
        for p in data["produtos"]:
            pid = uuid.uuid4()
            prod_map[p["key"]] = pid
            session.add(ProdutoModel(
                id=pid,
                fornecedor_id=forn_map[p["fornecedor"]],
                categoria_id=cat_map[p["categoria"]],
                sku=p["sku"],
                nome=p["nome"],
                descricao=p.get("descricao"),
                preco_base=p["preco_base"],
                preco_venda_sugerido=p["preco_venda_sugerido"],
                estoque_disponivel=p["estoque_disponivel"],
                status=StatusProduto.ATIVO,
                peso_kg=p.get("peso_kg"),
                imagens=[],
                atributos=p.get("atributos", {}),
            ))
            session.add(EstoqueModel(
                id=uuid.uuid4(),
                produto_id=pid,
                quantidade_disponivel=p["estoque_disponivel"],
                quantidade_reservada=0,
                versao=1,
            ))

        # ── ProdutoLoja (vínculos loja↔produto) ──
        for pl in data["produtos_loja"]:
            pid = prod_map[pl["produto"]]
            lid = loja_ids[pl["loja_index"]]
            preco = pl["preco_venda"]
            # Buscar preco_base do produto para calcular margem
            prod_data = next(p for p in data["produtos"] if p["key"] == pl["produto"])
            margem = round((preco - prod_data["preco_base"]) / preco, 4)
            session.add(ProdutoLojaModel(
                id=uuid.uuid4(),
                produto_id=pid,
                loja_id=lid,
                preco_venda=preco,
                margem=margem,
                visivel=True,
                destaque=pl.get("destaque", False),
            ))

        await session.commit()

        # ── Resumo ──
        print("=" * 50)
        print("  SEED CONCLUÍDO COM SUCESSO!")
        print("=" * 50)
        print()
        print("  Credenciais de acesso:")
        for a in data["admins"]:
            print(f"    Admin: {a['email']} / {a['senha']}")
        for v in data["vendedores"]:
            print(f"    Vendedor ({v['loja']['nome_loja']}): {v['email']} / {v['senha']}")
        for f in data["fornecedores"]:
            print(f"    Fornecedor ({f.get('nome_fantasia', f['razao_social'])}): {f['email']} / {f['senha']}")
        print()
        print(f"  {len(data['categorias'])} categorias")
        print(f"  {len(data['produtos'])} produtos ativos")
        print(f"  {len(data['produtos_loja'])} vínculos loja-produto")
        print("=" * 50)


if __name__ == "__main__":
    asyncio.run(seed())
