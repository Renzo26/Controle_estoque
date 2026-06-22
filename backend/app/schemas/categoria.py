import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoriaCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=100)


class CategoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    criado_em: datetime
