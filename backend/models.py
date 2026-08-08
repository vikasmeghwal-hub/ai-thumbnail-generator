from datetime import datetime,timezone
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
from sqlmodel import SQLModel, Field ,Relationship

def _uuid() -> str:
    return str(uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)

class Thumbnail(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="job.id")
    style_name: str = Field(defualt="")
    status: str = Field(default="pending")
    error_message: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=_now)

    job: Optional[job] = Relationship(back_populates="thumbnails")

class job(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=_uuid, primary_key=True)
    prompt: str = Field(default="")
    image_url: str = Field(default="")
    created_at: datetime = Field(default_factory=_now)
    num_thumbnails: int = Field(default=1, ge=1, le=3)
    headshot_url: str = Field(default="")
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=_now)

    thumbnails: List[Thumbnail] = Relationship(back_populates="job")