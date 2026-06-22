import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.models.produto import Produto
from app.schemas.relatorio import (
    DashboardOut,
    LucroPeriodoItem,
    LucroPeriodoOut,
    VendaPeriodoItem,
    VendasPeriodoOut,
)


class RelatorioService:
    async def dashboard(self, db: AsyncSession) -> DashboardOut:
        total_produtos = (await db.scalar(select(func.count(Produto.id)))) or 0
        total_unidades = (await db.scalar(select(func.coalesce(func.sum(Produto.quantidade_atual), 0)))) or 0
        valor_total = (
            await db.scalar(
                select(func.coalesce(func.sum(Produto.quantidade_atual * Produto.custo_medio), 0))
            )
        ) or Decimal("0")
        estoque_baixo = (
            await db.scalar(
                select(func.count(Produto.id)).where(
                    Produto.quantidade_atual <= Produto.estoque_minimo
                )
            )
        ) or 0

        inicio_mes = datetime.now(timezone.utc).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        vendas_qtd = (
            await db.scalar(
                select(func.coalesce(func.sum(Movimentacao.quantidade), 0)).where(
                    Movimentacao.tipo == TipoMovimentacao.venda,
                    Movimentacao.data_movimentacao >= inicio_mes,
                )
            )
        ) or 0
        vendas_valor = (
            await db.scalar(
                select(func.coalesce(func.sum(Movimentacao.valor_total), 0)).where(
                    Movimentacao.tipo == TipoMovimentacao.venda,
                    Movimentacao.data_movimentacao >= inicio_mes,
                )
            )
        ) or Decimal("0")

        return DashboardOut(
            total_produtos=int(total_produtos),
            total_unidades_estoque=int(total_unidades),
            valor_total_estoque=Decimal(valor_total),
            produtos_estoque_baixo=int(estoque_baixo),
            vendas_mes_quantidade=int(vendas_qtd),
            vendas_mes_valor=Decimal(vendas_valor),
        )

    async def estoque_baixo(self, db: AsyncSession) -> list[Produto]:
        result = await db.scalars(
            select(Produto)
            .where(Produto.quantidade_atual <= Produto.estoque_minimo)
            .order_by(Produto.quantidade_atual.asc())
        )
        return list(result.all())

    async def vendas_periodo(
        self,
        db: AsyncSession,
        de: Optional[datetime] = None,
        ate: Optional[datetime] = None,
    ) -> VendasPeriodoOut:
        if not de:
            de = datetime.now(timezone.utc) - timedelta(days=30)
        if not ate:
            ate = datetime.now(timezone.utc)

        dia = func.date_trunc("day", Movimentacao.data_movimentacao)
        stmt = (
            select(
                dia.label("data"),
                func.sum(Movimentacao.quantidade).label("quantidade_total"),
                func.sum(Movimentacao.valor_total).label("valor_total"),
            )
            .where(
                Movimentacao.tipo == TipoMovimentacao.venda,
                Movimentacao.data_movimentacao >= de,
                Movimentacao.data_movimentacao <= ate,
            )
            .group_by(dia)
            .order_by(dia.asc())
        )
        rows = (await db.execute(stmt)).all()

        itens = [
            VendaPeriodoItem(
                data=r.data,
                quantidade_total=int(r.quantidade_total or 0),
                valor_total=Decimal(r.valor_total or 0),
            )
            for r in rows
        ]
        return VendasPeriodoOut(
            de=de,
            ate=ate,
            quantidade_total=sum(i.quantidade_total for i in itens),
            valor_total=sum((i.valor_total for i in itens), Decimal("0")),
            itens=itens,
        )

    async def lucro_periodo(
        self,
        db: AsyncSession,
        de: Optional[datetime] = None,
        ate: Optional[datetime] = None,
        produto_id: Optional[uuid.UUID] = None,
    ) -> LucroPeriodoOut:
        if not ate:
            ate = datetime.now(timezone.utc)
        if not de:
            # padrão: últimos 12 meses
            de = ate - timedelta(days=365)

        mes = func.date_trunc("month", Movimentacao.data_movimentacao)
        investido = func.coalesce(
            func.sum(
                case(
                    (Movimentacao.tipo == TipoMovimentacao.entrada, Movimentacao.valor_total),
                    else_=0,
                )
            ),
            0,
        )
        vendas = func.coalesce(
            func.sum(
                case(
                    (Movimentacao.tipo == TipoMovimentacao.venda, Movimentacao.valor_total),
                    else_=0,
                )
            ),
            0,
        )

        stmt = (
            select(
                mes.label("mes"),
                investido.label("investido"),
                vendas.label("vendas"),
            )
            .where(
                Movimentacao.tipo.in_(
                    [TipoMovimentacao.entrada, TipoMovimentacao.venda]
                ),
                Movimentacao.data_movimentacao >= de,
                Movimentacao.data_movimentacao <= ate,
            )
            .group_by(mes)
            .order_by(mes.asc())
        )
        if produto_id:
            stmt = stmt.where(Movimentacao.produto_id == produto_id)

        rows = (await db.execute(stmt)).all()

        itens: list[LucroPeriodoItem] = []
        for r in rows:
            inv = Decimal(r.investido or 0)
            ven = Decimal(r.vendas or 0)
            itens.append(
                LucroPeriodoItem(mes=r.mes, investido=inv, vendas=ven, lucro=ven - inv)
            )

        investido_total = sum((i.investido for i in itens), Decimal("0"))
        vendas_total = sum((i.vendas for i in itens), Decimal("0"))
        return LucroPeriodoOut(
            de=de,
            ate=ate,
            produto_id=produto_id,
            investido_total=investido_total,
            vendas_total=vendas_total,
            lucro_total=vendas_total - investido_total,
            itens=itens,
        )


relatorio_service = RelatorioService()
