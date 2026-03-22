from api.schemas.activity import Activity
from api.schemas.analytics import (
    AnalyticsSummary,
    HrAnalyticsEnvelope,
    HrConfidence,
    HrCoverage,
    HrMethodology,
    HrZoneBoundariesPct,
)
from api.schemas.common import FreshnessMetadata
from api.services.activity_service import get_activities_data


def get_analytics_summary_data() -> tuple[FreshnessMetadata, AnalyticsSummary]:
    freshness, activities = get_activities_data()
    summary = build_summary(activities)
    return freshness, summary


def build_summary(activities: list[Activity]) -> AnalyticsSummary:
    total_distance = sum(activity.distance for activity in activities)
    total_moving_time_seconds = sum(
        _moving_time_to_seconds(activity.moving_time) for activity in activities
    )
    heartrates = [
        activity.average_heartrate
        for activity in activities
        if activity.average_heartrate is not None
    ]
    average_heartrate = (
        sum(heartrates) / len(heartrates) if heartrates else None
    )
    hr_coverage = _build_hr_coverage(activities, heartrates)
    hr_methodology = _build_hr_methodology(hr_coverage)
    hr_confidence = _build_hr_confidence(hr_coverage, hr_methodology)

    return AnalyticsSummary(
        total_activities=len(activities),
        total_distance=total_distance,
        total_moving_time_seconds=total_moving_time_seconds,
        average_heartrate=average_heartrate,
        heart_rate=HrAnalyticsEnvelope(
            methodology=hr_methodology,
            confidence=hr_confidence,
            coverage=hr_coverage,
        ),
    )


def _moving_time_to_seconds(moving_time: str) -> int:
    if not moving_time:
        return 0
    parts = moving_time.split(":")
    if len(parts) != 3:
        return 0
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = int(float(parts[2]))
    return hours * 3600 + minutes * 60 + seconds


def _build_hr_coverage(
    activities: list[Activity], heartrates: list[float]
) -> HrCoverage:
    total_activities = len(activities)
    activities_with_hr = len(heartrates)
    coverage_ratio = (
        activities_with_hr / total_activities if total_activities else 0.0
    )
    return HrCoverage(
        activities_with_hr=activities_with_hr,
        total_activities=total_activities,
        coverage_ratio=coverage_ratio,
        has_enough_data=activities_with_hr >= 3,
    )


def _build_hr_methodology(coverage: HrCoverage) -> HrMethodology:
    estimated = coverage.activities_with_hr > 0
    zone_time_basis = (
        "estimated_from_average_hr"
        if estimated
        else "unavailable"
    )
    return HrMethodology(
        model="max_hr_percentage_5_zone",
        zone_time_basis=zone_time_basis,
        max_hr_value=190,
        max_hr_source="default_fallback",
        estimated=estimated,
        zone_boundaries_pct=HrZoneBoundariesPct(
            z1=(50, 60),
            z2=(60, 70),
            z3=(70, 80),
            z4=(80, 90),
            z5=(90, 100),
        ),
    )


def _build_hr_confidence(
    coverage: HrCoverage, methodology: HrMethodology
) -> HrConfidence:
    if coverage.activities_with_hr == 0:
        return HrConfidence(
            level="none",
            reason="No heart-rate samples are available for the selected activities.",
        )
    if methodology.zone_time_basis == "estimated_from_average_hr":
        if coverage.coverage_ratio < 0.5:
            return HrConfidence(
                level="low",
                reason="Zone time is estimated from average heart rate with limited coverage.",
            )
        return HrConfidence(
            level="medium",
            reason="Zone time is estimated from average heart rate and does not use per-sample heart-rate series.",
        )
    return HrConfidence(
        level="high",
        reason="Zone time is computed from heart-rate samples.",
    )
