import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.produto import ProdutoCreate, ProdutoOut, ProdutoUpdate
from app.services.produto_service import produto_service

router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.get("", response_model=list[ProdutoOut])
async def listar(
    q: Optional[str] = Query(default=None, description="Busca por nome/categoria/sku"),
    categoria: Optional[str] = None,
    estoque_baixo: bool = False,
    db: AsyncSession = Depends(get_session),
):
    return await produto_service.listar(db, q=q, categoria=categoria, estoque_baixo=estoque_baixo)


@router.post("", response_model=ProdutoOut, status_code=status.HTTP_201_CREATED)
async def criar(body: ProdutoCreate, db: AsyncSession = Depends(get_session)):
    return await produto_service.criar(db, body)


@router.get("/{produto_id}", response_model=ProdutoOut)
async def detalhe(produto_id: uuid.UUID, db: AsyncSession = Depends(get_session)):
    return await produto_service.get_or_404(db, produto_id)


@router.put("/{produto_id}", response_model=ProdutoOut)
async def atualizar(
    produto_id: uuid.UUID,
    body: ProdutoUpdate,
    db: AsyncSession = Depends(get_session),
):
    return await produto_service.atualizar(db, produto_id, body)


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(produto_id: uuid.UUID, db: AsyncSession = Depends(get_session)):
    await produto_service.remover(db, produto_id)
