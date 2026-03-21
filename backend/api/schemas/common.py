from typing import Literal

from pydantic import BaseModel


class FreshnessMetadata(BaseModel):
    last_sync_at: str
    completeness: Literal["complete","partial","unavailable"]
