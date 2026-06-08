import uuid
from pathlib import PurePosixPath

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.core.storage import upload_foto
from app.schemas.produto import ProdutoOut
from app.services.produto_service import produto_service

router = APIRouter(prefix="/produtos", tags=["upload"])

ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/{produto_id}/foto", response_model=ProdutoOut)
async def upload_foto_produto(
    produto_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato não suportado. Use JPG, PNG ou WEBP.",
        )

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Arquivo maior que 5MB.",
        )

    produto = await produto_service.get_or_404(db, produto_id)

    ext = PurePosixPath(file.filename or "").suffix.lower() or ".jpg"
    path = f"{produto.id}/{uuid.uuid4().hex}{ext}"

    url = upload_foto(content, path, file.content_type)
    produto.foto_url = url
    await db.commit()
    await db.refresh(produto)
    return produto
