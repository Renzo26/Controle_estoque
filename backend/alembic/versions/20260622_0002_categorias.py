"""categorias — tabela de categorias + seed a partir dos produtos existentes

Revision ID: 20260622_0002
Revises: 20260607_0001
Create Date: 2026-06-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260622_0002"
down_revision: Union[str, None] = "20260607_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categorias",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_unique_constraint("uq_categorias_nome", "categorias", ["nome"])

    # Semeia as categorias a partir das categorias distintas já usadas nos produtos
    op.execute(
        """
        INSERT INTO categorias (id, nome, criado_em)
        SELECT gen_random_uuid(), c.categoria, now()
        FROM (SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL AND categoria <> '') AS c
        """
    )


def downgrade() -> None:
    op.drop_constraint("uq_categorias_nome", "categorias", type_="unique")
    op.drop_table("categorias")
