from typing import Optional

from pydantic import BaseModel

from api.schemas.common import FreshnessMetadata


class Activity(BaseModel):
    run_id: int
    name: str
    distance: float
    moving_time: str
    type: str
    subtype: str
    start_date: str
    start_date_local: str
    location_country: Optional[str] = None
    summary_polyline: Optional[str] = None
    average_heartrate: Optional[float] = None
    elevation_gain: Optional[float] = None
    average_speed: float
    streak: int


class ActivitiesResponse(BaseModel):
    freshness: FreshnessMetadata
    items: list[Activity]
