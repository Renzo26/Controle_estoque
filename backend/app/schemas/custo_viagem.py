import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CustoViagemCreate(BaseModel):
    data: date = Field(default_factory=date.today)
    descricao: Optional[str] = Field(default=None, max_length=200)
    combustivel_passagem: Decimal = Field(default=Decimal("0"), ge=0)
    hospedagem: Decimal = Field(default=Decimal("0"), ge=0)
    alimentacao: Decimal = Field(default=Decimal("0"), ge=0)
    pedagio: Decimal = Field(default=Decimal("0"), ge=0)

    @model_validator(mode="after")
    def algum_valor(self):
        if self.combustivel_passagem + self.hospedagem + self.alimentacao + self.pedagio <= 0:
            raise ValueError("Informe ao menos um valor de custo")
        return self


class CustoViagemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    data: date
    descricao: Optional[str] = None
    combustivel_passagem: Decimal
    hospedagem: Decimal
    alimentacao: Decimal
    pedagio: Decimal
    total: Decimal
    criado_em: datetime
