"""initial schema — produtos e movimentacoes

Revision ID: 20260607_0001
Revises:
Create Date: 2026-06-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260607_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "produtos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nome", sa.String(200), nullable=False),
        sa.Column("categoria", sa.String(100), nullable=False),
        sa.Column("sku", sa.String(50), nullable=True, unique=True),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("quantidade_atual", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estoque_minimo", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_medio", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("ultimo_valor_pago", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("foto_url", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_produtos_categoria", "produtos", ["categoria"])
    op.create_index("ix_produtos_quantidade_atual", "produtos", ["quantidade_atual"])

    tipo_enum = postgresql.ENUM(
        "entrada", "venda", "perda", "uso_pessoal", "ajuste",
        name="tipo_movimentacao",
        create_type=True,
    )
    tipo_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "movimentacoes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "produto_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("produtos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tipo",
            postgresql.ENUM(name="tipo_movimentacao", create_type=False),
            nullable=False,
        ),
        sa.Column("quantidade", sa.Integer(), nullable=False),
        sa.Column("valor_unitario", sa.Numeric(12, 2), nullable=False),
        sa.Column("valor_total", sa.Numeric(14, 2), nullable=False),
        sa.Column("cotacao_dolar", sa.Numeric(10, 4), nullable=True),
        sa.Column("data_movimentacao", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("fornecedor", sa.String(200), nullable=True),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_movimentacoes_produto_id", "movimentacoes", ["produto_id"])
    op.create_index("ix_movimentacoes_tipo", "movimentacoes", ["tipo"])
    op.create_index("ix_mov_produto_data", "movimentacoes", ["produto_id", "data_movimentacao"])


def downgrade() -> None:
    op.drop_index("ix_mov_produto_data", table_name="movimentacoes")
    op.drop_index("ix_movimentacoes_tipo", table_name="movimentacoes")
    op.drop_index("ix_movimentacoes_produto_id", table_name="movimentacoes")
    op.drop_table("movimentacoes")

    postgresql.ENUM(name="tipo_movimentacao").drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_produtos_quantidade_atual", table_name="produtos")
    op.drop_index("ix_produtos_categoria", table_name="produtos")
    op.drop_table("produtos")
