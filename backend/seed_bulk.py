"""
Marketplace CB - Seed de Carga em Massa
Gera grandes volumes de dados para testes de performance.

Uso:
  python seed_bulk.py                      # padrão: 1000 produtos, 50 vendedores, 10 fornecedores
  python seed_bulk.py --produtos 50000 --vendedores 500 --fornecedores 100

Requisitos: faker (pip install faker)
"""

import argparse
import asyncio
import random
import uuid
from decimal import Decimal

try:
    from faker import Faker
except ImportError:
    print("Instale faker: pip install faker")
    raise SystemExit(1)

from sqlalchemy import text

from app.infrastructure.database.session import AsyncSessionLocal, engine
from app.infrastructure.database.base import Base
from app.infrastructure.security.password import hash_password

# Registrar models
import app.infrastructure.database.models.vendedor  # noqa: F401
import app.infrastructure.database.models.fornecedor  # noqa: F401
import app.infrastructure.database.models.produto  # noqa: F401
import app.infrastructure.database.models.pedido  # noqa: F401
import app.infrastructure.database.models.estoque  # noqa: F401
import app.infrastructure.database.models.admin  # noqa: F401

from app.infrastructure.database.models.vendedor import LojaModel, VendedorModel
from app.infrastructure.database.models.fornecedor import (
    CondicaoComercialModel,
    FornecedorModel,
)
from app.infrastructure.database.models.produto import (
    CategoriaModel,
    ProdutoLojaModel,
    ProdutoModel,
    StatusProduto,
)
from app.infrastructure.database.models.estoque import EstoqueModel

fake = Faker("pt_BR")

# Senha fixa pra todos os registros gerados (evitar bcrypt lento em massa)
_BULK_HASH = hash_password("bulk123")

BATCH_SIZE = 500  # flush a cada N registros


def parse_args():
    p = argparse.ArgumentParser(description="Seed de carga em massa")
    p.add_argument("--produtos", type=int, default=1000)
    p.add_argument("--vendedores", type=int, default=50)
    p.add_argument("--fornecedores", type=int, default=10)
    p.add_argument("--categorias", type=int, default=20)
    p.add_argument("--vinculos-por-loja", type=int, default=50,
                    help="Quantos produtos cada loja vende (máx = total de produtos)")
    return p.parse_args()


async def seed_bulk(args):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ── Categorias ──
        print(f"Criando {args.categorias} categorias...")
        cat_ids = []
        for i in range(args.categorias):
            cid = uuid.uuid4()
            cat_ids.append(cid)
            session.add(CategoriaModel(
                id=cid,
                nome=fake.word().capitalize() + f" Cat-{i}",
                slug=fake.slug() + f"-{i}",
                descricao=fake.sentence(),
                ativa=True,
            ))
        await session.flush()

        # ── Fornecedores ──
        print(f"Criando {args.fornecedores} fornecedores...")
        forn_ids = []
        for i in range(args.fornecedores):
            fid = uuid.uuid4()
            forn_ids.append(fid)
            session.add(FornecedorModel(
                id=fid,
                razao_social=fake.company(),
                nome_fantasia=fake.company_suffix() + f" {i}",
                cnpj=fake.cnpj(),
                email=f"forn{i}@bulk.test",
                tipo="INDUSTRIA" if i % 2 == 0 else "DISTRIBUIDOR",
                status="APROVADO",
                senha_hash=_BULK_HASH,
            ))
            session.add(CondicaoComercialModel(
                id=uuid.uuid4(),
                fornecedor_id=fid,
                margem_minima=round(random.uniform(0.10, 0.30), 4),
                prazo_entrega_dias=random.randint(2, 15),
                politica_devolucao="Política padrão de devolução.",
            ))
            if i % BATCH_SIZE == 0:
                await session.flush()
        await session.flush()

        # ── Vendedores + Lojas ──
        print(f"Criando {args.vendedores} vendedores com lojas...")
        loja_ids = []
        for i in range(args.vendedores):
            vid = uuid.uuid4()
            session.add(VendedorModel(
                id=vid,
                nome=fake.name(),
                email=f"vend{i}@bulk.test",
                cpf_cnpj=fake.cpf(),
                tipo_pessoa="FISICA" if i % 3 != 0 else "JURIDICA",
                status="ATIVO",
                comissao_padrao=round(random.uniform(0.05, 0.15), 4),
                senha_hash=_BULK_HASH,
            ))
            lid = uuid.uuid4()
            loja_ids.append(lid)
            session.add(LojaModel(
                id=lid,
                vendedor_id=vid,
                nome_loja=fake.company() + f" Store",
                slug=fake.slug() + f"-{i}",
                descricao=fake.sentence(),
                ativa=True,
            ))
            if i % BATCH_SIZE == 0:
                await session.flush()
        await session.flush()

        # ── Produtos + Estoque ──
        print(f"Criando {args.produtos} produtos com estoque...")
        prod_ids = []
        for i in range(args.produtos):
            pid = uuid.uuid4()
            prod_ids.append(pid)
            preco_base = round(random.uniform(5, 500), 2)
            preco_venda = round(preco_base * random.uniform(1.3, 2.5), 2)
            estoque = random.randint(10, 1000)

            session.add(ProdutoModel(
                id=pid,
                fornecedor_id=random.choice(forn_ids),
                categoria_id=random.choice(cat_ids),
                sku=f"BLK-{i:06d}",
                nome=f"{fake.word().capitalize()} {fake.word().capitalize()} {i}",
                descricao=fake.text(max_nb_chars=200),
                preco_base=preco_base,
                preco_venda_sugerido=preco_venda,
                estoque_disponivel=estoque,
                status=StatusProduto.ATIVO,
                peso_kg=round(random.uniform(0.05, 10.0), 3),
                imagens=[],
                atributos={},
            ))
            session.add(EstoqueModel(
                id=uuid.uuid4(),
                produto_id=pid,
                quantidade_disponivel=estoque,
                quantidade_reservada=0,
                versao=1,
            ))

            if i % BATCH_SIZE == 0:
                await session.flush()
                print(f"  ... {i}/{args.produtos} produtos")
        await session.flush()
        print(f"  ... {args.produtos}/{args.produtos} produtos")

        # ── ProdutoLoja (vínculos) ──
        vinculos_por_loja = min(args.vinculos_por_loja, len(prod_ids))
        total_vinculos = 0
        print(f"Criando vínculos loja-produto ({vinculos_por_loja} por loja)...")
        for lid in loja_ids:
            sample = random.sample(prod_ids, vinculos_por_loja)
            for pid in sample:
                preco = round(random.uniform(20, 800), 2)
                session.add(ProdutoLojaModel(
                    id=uuid.uuid4(),
                    produto_id=pid,
                    loja_id=lid,
                    preco_venda=preco,
                    margem=round(random.uniform(0.15, 0.65), 4),
                    visivel=True,
                    destaque=random.random() < 0.1,
                ))
                total_vinculos += 1

            if total_vinculos % (BATCH_SIZE * 5) == 0:
                await session.flush()
        await session.flush()

        await session.commit()

        print()
        print("=" * 50)
        print("  SEED BULK CONCLUÍDO!")
        print("=" * 50)
        print(f"  Categorias:    {args.categorias}")
        print(f"  Fornecedores:  {args.fornecedores}")
        print(f"  Vendedores:    {args.vendedores}")
        print(f"  Lojas:         {len(loja_ids)}")
        print(f"  Produtos:      {args.produtos}")
        print(f"  Vínculos:      {total_vinculos}")
        print(f"  Senha de todos: bulk123")
        print("=" * 50)


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(seed_bulk(args))
