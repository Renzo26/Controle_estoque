import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate


class CategoriaService:
    async def listar(self, db: AsyncSession) -> list[Categoria]:
        result = await db.scalars(select(Categoria).order_by(Categoria.nome.asc()))
        return list(result.all())

    async def criar(self, db: AsyncSession, body: CategoriaCreate) -> Categoria:
        nome = body.nome.strip()
        existente = await db.scalar(
            select(Categoria).where(func.lower(Categoria.nome) == nome.lower())
        )
        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Categoria já cadastrada",
            )
        categoria = Categoria(nome=nome)
        db.add(categoria)
        try:
            await db.commit()
        except IntegrityError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Categoria já cadastrada",
            ) from e
        await db.refresh(categoria)
        return categoria

    async def remover(self, db: AsyncSession, categoria_id: uuid.UUID) -> None:
        categoria = await db.scalar(
            select(Categoria).where(Categoria.id == categoria_id)
        )
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada",
            )
        await db.delete(categoria)
        await db.commit()


categoria_service = CategoriaService()
