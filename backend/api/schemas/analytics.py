from typing import Literal

from pydantic import BaseModel

from api.schemas.common import FreshnessMetadata


class HrZoneBoundariesPct(BaseModel):
    z1: tuple[int, int]
    z2: tuple[int, int]
    z3: tuple[int, int]
    z4: tuple[int, int]
    z5: tuple[int, int]


class HrMethodology(BaseModel):
    model: Literal["max_hr_percentage_5_zone"]
    zone_time_basis: Literal[
        "hr_samples", "estimated_from_average_hr", "unavailable"
    ]
    max_hr_value: int
    max_hr_source: Literal["user_configured", "default_fallback"]
    estimated: bool
    zone_boundaries_pct: HrZoneBoundariesPct


class HrConfidence(BaseModel):
    level: Literal["high", "medium", "low", "none"]
    reason: str


class HrCoverage(BaseModel):
    activities_with_hr: int
    total_activities: int
    coverage_ratio: float
    has_enough_data: bool


class HrZoneBreakdownEntry(BaseModel):
    zone: Literal["Z1", "Z2", "Z3", "Z4", "Z5"]
    duration_seconds: int
    percentage: float


class HrPerRunAnalytics(BaseModel):
    run_id: int
    total_duration_seconds: int
    analyzed_duration_seconds: int
    coverage_ratio: float
    confidence_level: Literal["high", "medium", "low", "none"]
    confidence_reason: str
    has_hr_data: bool
    zones: list[HrZoneBreakdownEntry]


class HrAnalyticsEnvelope(BaseModel):
    methodology: HrMethodology
    confidence: HrConfidence
    coverage: HrCoverage
    per_run: list[HrPerRunAnalytics]


class AnalyticsSummary(BaseModel):
    total_activities: int
    total_distance: float
    total_moving_time_seconds: int
    average_heartrate: float | None = None
    heart_rate: HrAnalyticsEnvelope


class AnalyticsSummaryResponse(BaseModel):
    freshness: FreshnessMetadata
    summary: AnalyticsSummary
