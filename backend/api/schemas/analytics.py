from pydantic import BaseModel

from api.schemas.common import FreshnessMetadata


class AnalyticsSummary(BaseModel):
    total_activities: int
    total_distance: float
    total_moving_time_seconds: int
    average_heartrate: float | None = None


class AnalyticsSummaryResponse(BaseModel):
    freshness: FreshnessMetadata
    summary: AnalyticsSummary
