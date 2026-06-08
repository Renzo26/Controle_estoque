import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    categoria: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sku: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    quantidade_atual: Mapped[int] = mapped_column(nullable=False, default=0)
    estoque_minimo: Mapped[int] = mapped_column(nullable=False, default=0)

    custo_medio: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    ultimo_valor_pago: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )

    foto_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    movimentacoes: Mapped[list["Movimentacao"]] = relationship(  # noqa: F821
        "Movimentacao",
        back_populates="produto",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_produtos_quantidade_atual", "quantidade_atual"),
    )
