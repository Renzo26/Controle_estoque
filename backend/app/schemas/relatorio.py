from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DashboardOut(BaseModel):
    total_produtos: int
    total_unidades_estoque: int
    valor_total_estoque: Decimal
    produtos_estoque_baixo: int
    vendas_mes_quantidade: int
    vendas_mes_valor: Decimal


class VendaPeriodoItem(BaseModel):
    data: datetime
    quantidade_total: int
    valor_total: Decimal


class VendasPeriodoOut(BaseModel):
    de: Optional[datetime] = None
    ate: Optional[datetime] = None
    quantidade_total: int
    valor_total: Decimal
    itens: list[VendaPeriodoItem]
