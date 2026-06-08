import uuid
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate


class ProdutoService:
    async def get_or_404(self, db: AsyncSession, produto_id: uuid.UUID) -> Produto:
        produto = await db.scalar(select(Produto).where(Produto.id == produto_id))
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado",
            )
        return produto

    async def listar(
        self,
        db: AsyncSession,
        q: Optional[str] = None,
        categoria: Optional[str] = None,
        estoque_baixo: bool = False,
    ) -> list[Produto]:
        stmt = select(Produto).order_by(Produto.criado_em.desc())
        if q:
            like = f"%{q.lower()}%"
            from sqlalchemy import func, or_
            stmt = stmt.where(
                or_(
                    func.lower(Produto.nome).like(like),
                    func.lower(Produto.categoria).like(like),
                    func.lower(Produto.sku).like(like),
                )
            )
        if categoria:
            stmt = stmt.where(Produto.categoria == categoria)
        if estoque_baixo:
            stmt = stmt.where(Produto.quantidade_atual <= Produto.estoque_minimo)
        result = await db.scalars(stmt)
        return list(result.all())

    async def criar(self, db: AsyncSession, body: ProdutoCreate) -> Produto:
        qtd = body.quantidade_inicial
        valor = body.valor_unitario_inicial or Decimal("0")

        produto = Produto(
            nome=body.nome,
            categoria=body.categoria,
            sku=body.sku,
            descricao=body.descricao,
            estoque_minimo=body.estoque_minimo,
            quantidade_atual=qtd,
            custo_medio=valor if qtd > 0 else Decimal("0"),
            ultimo_valor_pago=valor if qtd > 0 else Decimal("0"),
        )
        db.add(produto)

        try:
            await db.flush()
        except IntegrityError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="SKU já cadastrado",
            ) from e

        if qtd > 0:
            mov = Movimentacao(
                produto_id=produto.id,
                tipo=TipoMovimentacao.entrada,
                quantidade=qtd,
                valor_unitario=valor,
                valor_total=valor * qtd,
                cotacao_dolar=body.cotacao_dolar_inicial,
                fornecedor=body.fornecedor_inicial,
                observacoes="Cadastro inicial",
            )
            db.add(mov)

        await db.commit()
        await db.refresh(produto)
        return produto

    async def atualizar(
        self, db: AsyncSession, produto_id: uuid.UUID, body: ProdutoUpdate
    ) -> Produto:
        produto = await self.get_or_404(db, produto_id)
        data = body.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(produto, field, value)
        try:
            await db.commit()
        except IntegrityError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="SKU já cadastrado",
            ) from e
        await db.refresh(produto)
        return produto

    async def remover(self, db: AsyncSession, produto_id: uuid.UUID) -> None:
        produto = await self.get_or_404(db, produto_id)
        await db.delete(produto)
        await db.commit()


produto_service = ProdutoService()
