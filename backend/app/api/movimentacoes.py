import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.models.movimentacao import TipoMovimentacao
from app.schemas.movimentacao import MovimentacaoCreate, MovimentacaoOut
from app.services.movimentacao_service import movimentacao_service

router = APIRouter(prefix="/movimentacoes", tags=["movimentacoes"])


def _to_out(mov) -> MovimentacaoOut:
    out = MovimentacaoOut.model_validate(mov)
    if mov.produto is not None:
        out.produto_nome = mov.produto.nome
    return out


@router.get("", response_model=list[MovimentacaoOut])
async def listar(
    produto_id: Optional[uuid.UUID] = None,
    tipo: Optional[TipoMovimentacao] = None,
    de: Optional[datetime] = None,
    ate: Optional[datetime] = None,
    limit: int = Query(default=200, le=1000),
    db: AsyncSession = Depends(get_session),
):
    movs = await movimentacao_service.listar(
        db, produto_id=produto_id, tipo=tipo, de=de, ate=ate, limit=limit
    )
    return [MovimentacaoOut.model_validate(m) for m in movs]


@router.post("", response_model=MovimentacaoOut, status_code=status.HTTP_201_CREATED)
async def registrar(body: MovimentacaoCreate, db: AsyncSession = Depends(get_session)):
    mov = await movimentacao_service.registrar(db, body)
    return MovimentacaoOut.model_validate(mov)
