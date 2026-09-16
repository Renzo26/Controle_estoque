from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.models.produto import Produto
from app.schemas.produto import CatalogoItemOut

router = APIRouter(prefix="/catalogo", tags=["catalogo"])


@router.get("", response_model=list[CatalogoItemOut])
async def listar(db: AsyncSession = Depends(get_session)):
    result = await db.scalars(
        select(Produto)
        .where(Produto.exibir_catalogo.is_(True))
        .order_by(Produto.categoria.asc(), Produto.nome.asc())
    )
    return [
        CatalogoItemOut(
            id=p.id,
            nome=p.nome,
            categoria=p.categoria,
            descricao=p.descricao,
            foto_url=p.foto_url,
            preco_venda=p.preco_venda,
            disponivel=p.quantidade_atual > 0,
        )
        for p in result.all()
    ]
