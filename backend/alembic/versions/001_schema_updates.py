"""Schema updates: novos campos produto, pedido e tabela cliente

Revision ID: 001_schema_updates
Revises:
Create Date: 2026-04-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_schema_updates"
down_revision = None
branch_labels = None
depends_on = None


def _table_exists(conn, table_name: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_schema = 'public' AND table_name = :t)"
        ),
        {"t": table_name},
    )
    return result.scalar()


def _column_exists(conn, table_name: str, column_name: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = :t AND column_name = :c)"
        ),
        {"t": table_name, "c": column_name},
    )
    return result.scalar()


def _constraint_exists(conn, table_name: str, constraint_name: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints "
            "WHERE table_schema = 'public' AND table_name = :t AND constraint_name = :c)"
        ),
        {"t": table_name, "c": constraint_name},
    )
    return result.scalar()


def upgrade() -> None:
    conn = op.get_bind()

    # ── Tabela clientes (nova) ────────────────────────────────────────────
    if not _table_exists(conn, "clientes"):
        op.create_table(
            "clientes",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("nome", sa.String(255), nullable=False),
            sa.Column("email", sa.String(255), unique=True, nullable=False),
            sa.Column("cpf", sa.String(14), unique=True, nullable=True),
            sa.Column("telefone", sa.String(20), nullable=True),
            sa.Column("endereco", sa.Text, nullable=True),
            sa.Column(
                "status",
                sa.String(20),
                sa.CheckConstraint("status IN ('ATIVO','INATIVO','SUSPENSO')", name="status_cliente_enum"),
                nullable=False,
                server_default="ATIVO",
            ),
            sa.Column("senha_hash", sa.String(255), nullable=False),
            sa.Column("email_verificado", sa.Boolean, nullable=False, server_default="false"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        op.create_index("ix_clientes_email", "clientes", ["email"], unique=True)
        op.create_index("ix_clientes_cpf", "clientes", ["cpf"], unique=True)

    # ── Tabela produtos: novos campos ─────────────────────────────────────
    # Renomear preco_venda_sugerido → preco_venda
    if _column_exists(conn, "produtos", "preco_venda_sugerido") and not _column_exists(conn, "produtos", "preco_venda"):
        op.alter_column("produtos", "preco_venda_sugerido", new_column_name="preco_venda")
        # Tornar nullable (antes era NOT NULL)
        op.alter_column("produtos", "preco_venda", nullable=True)

    for col_name, col_def in [
        ("ean", sa.Column("ean", sa.String(20), nullable=True)),
        ("marca", sa.Column("marca", sa.String(255), nullable=True)),
        ("modelo", sa.Column("modelo", sa.String(255), nullable=True)),
        ("videos", sa.Column("videos", sa.JSON(), nullable=True)),
        ("comprimento_cm", sa.Column("comprimento_cm", sa.Numeric(8, 2), nullable=True)),
        ("largura_cm", sa.Column("largura_cm", sa.Numeric(8, 2), nullable=True)),
        ("altura_cm", sa.Column("altura_cm", sa.Numeric(8, 2), nullable=True)),
        ("local_origem", sa.Column("local_origem", sa.String(500), nullable=True)),
    ]:
        if not _column_exists(conn, "produtos", col_name):
            op.add_column("produtos", col_def)

    # Índice único para ean (se não existir)
    try:
        op.create_index("ix_produtos_ean", "produtos", ["ean"], unique=True)
    except Exception:
        pass  # índice já existe

    # ── Tabela pedidos: novos campos ──────────────────────────────────────
    for col_name, col_def in [
        ("valor_base_fornecedor", sa.Column("valor_base_fornecedor", sa.Numeric(12, 2), nullable=True)),
        ("valor_pago_fornecedor", sa.Column("valor_pago_fornecedor", sa.Numeric(12, 2), nullable=False, server_default="0")),
        ("historico_status", sa.Column("historico_status", sa.JSON(), nullable=True)),
    ]:
        if not _column_exists(conn, "pedidos", col_name):
            op.add_column("pedidos", col_def)

    # Atualizar check constraint do status do pedido
    novos_status = (
        "'AGUARDANDO_PAGAMENTO','PAGO','NOTA_FISCAL_EMITIDA',"
        "'ETIQUETA_GERADA','DESPACHADO','EM_ENTREGA','ENTREGUE',"
        "'EM_DEVOLUCAO','CANCELADO'"
    )
    if _constraint_exists(conn, "pedidos", "status_pedido_enum"):
        op.drop_constraint("status_pedido_enum", "pedidos", type_="check")
    op.create_check_constraint(
        "status_pedido_enum",
        "pedidos",
        f"status IN ({novos_status})",
    )


def downgrade() -> None:
    # Reverter status constraint
    op.drop_constraint("status_pedido_enum", "pedidos", type_="check")
    op.create_check_constraint(
        "status_pedido_enum",
        "pedidos",
        "status IN ('AGUARDANDO_PAGAMENTO','PAGO','PREPARANDO','ENVIADO','ENTREGUE','CANCELADO','DEVOLVIDO')",
    )

    # Remover colunas adicionadas em pedidos
    for col in ["historico_status", "valor_pago_fornecedor", "valor_base_fornecedor"]:
        op.drop_column("pedidos", col)

    # Remover colunas adicionadas em produtos
    for col in ["local_origem", "altura_cm", "largura_cm", "comprimento_cm", "videos", "modelo", "marca"]:
        op.drop_column("produtos", col)

    try:
        op.drop_index("ix_produtos_ean", "produtos")
    except Exception:
        pass
    op.drop_column("produtos", "ean")

    # Renomear de volta
    if _column_exists(op.get_bind(), "produtos", "preco_venda"):
        op.alter_column("produtos", "preco_venda", new_column_name="preco_venda_sugerido")
        op.alter_column("produtos", "preco_venda_sugerido", nullable=False)

    op.drop_table("clientes")
