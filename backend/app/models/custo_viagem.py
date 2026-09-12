import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CustoViagem(Base):
    __tablename__ = "custos_viagem"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    descricao: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    combustivel_passagem: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    hospedagem: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    alimentacao: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    pedagio: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @property
    def total(self) -> Decimal:
        return self.combustivel_passagem + self.hospedagem + self.alimentacao + self.pedagio
