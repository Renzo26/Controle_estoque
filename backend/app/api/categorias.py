import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.categoria import CategoriaCreate, CategoriaOut
from app.services.categoria_service import categoria_service

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaOut])
async def listar(db: AsyncSession = Depends(get_session)):
    return await categoria_service.listar(db)


@router.post("", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
async def criar(body: CategoriaCreate, db: AsyncSession = Depends(get_session)):
    return await categoria_service.criar(db, body)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(categoria_id: uuid.UUID, db: AsyncSession = Depends(get_session)):
    await categoria_service.remover(db, categoria_id)
