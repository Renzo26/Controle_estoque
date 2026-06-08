from functools import lru_cache
from supabase import create_client, Client

from app.core.config import get_settings


@lru_cache
def get_storage_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError(
            "SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configurados para usar Storage."
        )
    return create_client(settings.supabase_url, settings.supabase_service_key)


def upload_foto(file_bytes: bytes, file_path: str, content_type: str) -> str:
    """Faz upload do arquivo no bucket configurado e retorna a URL pública."""
    settings = get_settings()
    client = get_storage_client()
    bucket = client.storage.from_(settings.supabase_bucket)

    # upsert=true permite reenvio com o mesmo nome
    bucket.upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return bucket.get_public_url(file_path)


def remove_foto(file_path: str) -> None:
    settings = get_settings()
    client = get_storage_client()
    client.storage.from_(settings.supabase_bucket).remove([file_path])
