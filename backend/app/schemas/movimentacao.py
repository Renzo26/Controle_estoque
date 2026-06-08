import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.movimentacao import TipoMovimentacao


class MovimentacaoCreate(BaseModel):
    produto_id: uuid.UUID
    tipo: TipoMovimentacao
    quantidade: int = Field(gt=0)
    valor_unitario: Optional[Decimal] = Field(default=None, ge=0)
    cotacao_dolar: Optional[Decimal] = Field(default=None, ge=0)
    data_movimentacao: Optional[datetime] = None
    fornecedor: Optional[str] = Field(default=None, max_length=200)
    observacoes: Optional[str] = None


class MovimentacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    produto_id: uuid.UUID
    produto_nome: Optional[str] = None
    tipo: TipoMovimentacao
    quantidade: int
    valor_unitario: Decimal
    valor_total: Decimal
    cotacao_dolar: Optional[Decimal] = None
    data_movimentacao: datetime
    fornecedor: Optional[str] = None
    observacoes: Optional[str] = None
    criado_em: datetime
