from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api import produtos, movimentacoes, relatorios, upload

settings = get_settings()

app = FastAPI(
    title="Estoque Paraguay API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://.*\.easypanel\.host",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(produtos.router, prefix="/api")
app.include_router(movimentacoes.router, prefix="/api")
app.include_router(relatorios.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
