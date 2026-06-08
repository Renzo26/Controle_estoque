import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProdutoBase(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    categoria: str = Field(min_length=1, max_length=100)
    sku: Optional[str] = Field(default=None, max_length=50)
    descricao: Optional[str] = None
    estoque_minimo: int = Field(default=0, ge=0)


class ProdutoCreate(ProdutoBase):
    # Permite criar com entrada inicial opcional
    quantidade_inicial: int = Field(default=0, ge=0)
    valor_unitario_inicial: Decimal = Field(default=Decimal("0"), ge=0)
    cotacao_dolar_inicial: Optional[Decimal] = Field(default=None, ge=0)
    fornecedor_inicial: Optional[str] = None


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    categoria: Optional[str] = Field(default=None, min_length=1, max_length=100)
    sku: Optional[str] = Field(default=None, max_length=50)
    descricao: Optional[str] = None
    estoque_minimo: Optional[int] = Field(default=None, ge=0)


class ProdutoOut(ProdutoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quantidade_atual: int
    custo_medio: Decimal
    ultimo_valor_pago: Decimal
    foto_url: Optional[str] = None
    criado_em: datetime
    atualizado_em: datetime

    @property
    def valor_total_estoque(self) -> Decimal:
        return self.custo_medio * self.quantidade_atual
