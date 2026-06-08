import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.models.produto import Produto
from app.schemas.movimentacao import MovimentacaoCreate


SAIDAS = {TipoMovimentacao.venda, TipoMovimentacao.perda, TipoMovimentacao.uso_pessoal}


class MovimentacaoService:
    async def listar(
        self,
        db: AsyncSession,
        produto_id: Optional[uuid.UUID] = None,
        tipo: Optional[TipoMovimentacao] = None,
        de: Optional[datetime] = None,
        ate: Optional[datetime] = None,
        limit: int = 200,
    ) -> list[Movimentacao]:
        stmt = select(Movimentacao).order_by(Movimentacao.data_movimentacao.desc())
        if produto_id:
            stmt = stmt.where(Movimentacao.produto_id == produto_id)
        if tipo:
            stmt = stmt.where(Movimentacao.tipo == tipo)
        if de:
            stmt = stmt.where(Movimentacao.data_movimentacao >= de)
        if ate:
            stmt = stmt.where(Movimentacao.data_movimentacao <= ate)
        stmt = stmt.limit(limit)
        result = await db.scalars(stmt)
        return list(result.all())

    async def registrar(self, db: AsyncSession, body: MovimentacaoCreate) -> Movimentacao:
        produto = await db.scalar(
            select(Produto).where(Produto.id == body.produto_id).with_for_update()
        )
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado",
            )

        qtd = body.quantidade
        tipo = body.tipo

        if tipo == TipoMovimentacao.entrada:
            valor_unit = body.valor_unitario or Decimal("0")
            if valor_unit <= 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="valor_unitario é obrigatório para entrada",
                )

            qtd_atual = produto.quantidade_atual
            custo_atual = produto.custo_medio
            nova_qtd = qtd_atual + qtd
            if nova_qtd > 0:
                produto.custo_medio = (
                    (custo_atual * qtd_atual) + (valor_unit * qtd)
                ) / nova_qtd
            else:
                produto.custo_medio = valor_unit
            produto.ultimo_valor_pago = valor_unit
            produto.quantidade_atual = nova_qtd

        elif tipo in SAIDAS:
            if qtd > produto.quantidade_atual:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Estoque insuficiente. Disponível: {produto.quantidade_atual}",
                )
            # Para venda usa valor informado; para perda/uso_pessoal, custo médio
            if tipo == TipoMovimentacao.venda:
                valor_unit = body.valor_unitario or produto.custo_medio
            else:
                valor_unit = produto.custo_medio
            produto.quantidade_atual -= qtd

        else:  # ajuste — define quantidade absoluta
            valor_unit = body.valor_unitario or produto.custo_medio
            produto.quantidade_atual = qtd

        mov = Movimentacao(
            produto_id=produto.id,
            tipo=tipo,
            quantidade=qtd,
            valor_unitario=valor_unit,
            valor_total=valor_unit * qtd,
            cotacao_dolar=body.cotacao_dolar,
            data_movimentacao=body.data_movimentacao or datetime.now(timezone.utc),
            fornecedor=body.fornecedor,
            observacoes=body.observacoes,
        )
        db.add(mov)
        await db.commit()
        await db.refresh(mov)
        return mov


movimentacao_service = MovimentacaoService()
