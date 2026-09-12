"""custos_viagem — custos da viagem de compras (combustível/passagem, hospedagem, alimentação, pedágio)

Revision ID: 20260912_0003
Revises: 20260622_0002
Create Date: 2026-09-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260912_0003"
down_revision: Union[str, None] = "20260622_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "custos_viagem",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("descricao", sa.String(200), nullable=True),
        sa.Column("combustivel_passagem", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("hospedagem", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("alimentacao", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("pedagio", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_custos_viagem_data", "custos_viagem", ["data"])


def downgrade() -> None:
    op.drop_index("ix_custos_viagem_data", table_name="custos_viagem")
    op.drop_table("custos_viagem")
