import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.produto import ProdutoOut
from app.schemas.relatorio import DashboardOut, LucroPeriodoOut, VendasPeriodoOut
from app.services.relatorio_service import relatorio_service

router = APIRouter(prefix="/relatorios", tags=["relatorios"])


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(db: AsyncSession = Depends(get_session)):
    return await relatorio_service.dashboard(db)


@router.get("/estoque-baixo", response_model=list[ProdutoOut])
async def estoque_baixo(db: AsyncSession = Depends(get_session)):
    return await relatorio_service.estoque_baixo(db)


@router.get("/vendas", response_model=VendasPeriodoOut)
async def vendas(
    de: Optional[datetime] = None,
    ate: Optional[datetime] = None,
    db: AsyncSession = Depends(get_session),
):
    return await relatorio_service.vendas_periodo(db, de=de, ate=ate)


@router.get("/lucro", response_model=LucroPeriodoOut)
async def lucro(
    de: Optional[datetime] = None,
    ate: Optional[datetime] = None,
    produto_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_session),
):
    return await relatorio_service.lucro_periodo(db, de=de, ate=ate, produto_id=produto_id)
