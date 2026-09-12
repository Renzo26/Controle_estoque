import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.custo_viagem import CustoViagemCreate, CustoViagemOut
from app.services.custo_viagem_service import custo_viagem_service

router = APIRouter(prefix="/custos-viagem", tags=["custos-viagem"])


@router.get("", response_model=list[CustoViagemOut])
async def listar(
    de: Optional[date] = None,
    ate: Optional[date] = None,
    db: AsyncSession = Depends(get_session),
):
    return await custo_viagem_service.listar(db, de=de, ate=ate)


@router.post("", response_model=CustoViagemOut, status_code=status.HTTP_201_CREATED)
async def criar(body: CustoViagemCreate, db: AsyncSession = Depends(get_session)):
    return await custo_viagem_service.criar(db, body)


@router.delete("/{custo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(custo_id: uuid.UUID, db: AsyncSession = Depends(get_session)):
    await custo_viagem_service.remover(db, custo_id)
