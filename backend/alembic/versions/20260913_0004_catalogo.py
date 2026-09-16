"""catálogo: preco_venda e exibir_catalogo em produtos

Revision ID: 20260913_0004
Revises: 20260912_0003
Create Date: 2026-09-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260913_0004"
down_revision: Union[str, None] = "20260912_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("produtos", sa.Column("preco_venda", sa.Numeric(12, 2), nullable=True))
    op.add_column(
        "produtos",
        sa.Column("exibir_catalogo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("produtos", "exibir_catalogo")
    op.drop_column("produtos", "preco_venda")
