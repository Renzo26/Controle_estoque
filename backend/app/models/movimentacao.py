import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TipoMovimentacao(str, enum.Enum):
    entrada = "entrada"
    venda = "venda"
    perda = "perda"
    uso_pessoal = "uso_pessoal"
    ajuste = "ajuste"


class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    produto_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("produtos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    tipo: Mapped[TipoMovimentacao] = mapped_column(
        Enum(TipoMovimentacao, name="tipo_movimentacao"),
        nullable=False,
        index=True,
    )
    quantidade: Mapped[int] = mapped_column(nullable=False)
    valor_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    valor_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    cotacao_dolar: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 4), nullable=True)

    data_movimentacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fornecedor: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    produto: Mapped["Produto"] = relationship(  # noqa: F821
        "Produto", back_populates="movimentacoes"
    )

    __table_args__ = (
        Index("ix_mov_produto_data", "produto_id", "data_movimentacao"),
    )
