import uuid
from datetime import date
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.custo_viagem import CustoViagem
from app.schemas.custo_viagem import CustoViagemCreate


class CustoViagemService:
    async def listar(
        self,
        db: AsyncSession,
        de: Optional[date] = None,
        ate: Optional[date] = None,
    ) -> list[CustoViagem]:
        stmt = select(CustoViagem).order_by(CustoViagem.data.desc(), CustoViagem.criado_em.desc())
        if de:
            stmt = stmt.where(CustoViagem.data >= de)
        if ate:
            stmt = stmt.where(CustoViagem.data <= ate)
        result = await db.scalars(stmt)
        return list(result.all())

    async def criar(self, db: AsyncSession, body: CustoViagemCreate) -> CustoViagem:
        custo = CustoViagem(
            data=body.data,
            descricao=(body.descricao or "").strip() or None,
            combustivel_passagem=body.combustivel_passagem,
            hospedagem=body.hospedagem,
            alimentacao=body.alimentacao,
            pedagio=body.pedagio,
        )
        db.add(custo)
        await db.commit()
        await db.refresh(custo)
        return custo

    async def remover(self, db: AsyncSession, custo_id: uuid.UUID) -> None:
        custo = await db.scalar(select(CustoViagem).where(CustoViagem.id == custo_id))
        if not custo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Custo de viagem não encontrado",
            )
        await db.delete(custo)
        await db.commit()


custo_viagem_service = CustoViagemService()
