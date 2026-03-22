from api.schemas.activity import Activity
from api.schemas.analytics import (
    AnalyticsSummary,
    HrAnalyticsEnvelope,
    HrConfidence,
    HrCoverage,
    HrMethodology,
    HrPerRunAnalytics,
    HrTrendAnalytics,
    HrTrendPeriods,
    HrTrendPoint,
    HrZoneBreakdownEntry,
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
    per_run = _build_per_run_hr(activities)
    trend = _build_hr_trend(activities)

    return AnalyticsSummary(
        total_activities=len(activities),
        total_distance=total_distance,
        total_moving_time_seconds=total_moving_time_seconds,
        average_heartrate=average_heartrate,
        heart_rate=HrAnalyticsEnvelope(
            methodology=hr_methodology,
            confidence=hr_confidence,
            coverage=hr_coverage,
            per_run=per_run,
            trend=trend,
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


def _zone_for_heart_rate(heart_rate: float, max_hr_value: int) -> str:
    if max_hr_value <= 0:
        return "Z1"
    ratio = (heart_rate / max_hr_value) * 100
    if ratio < 60:
        return "Z1"
    if ratio < 70:
        return "Z2"
    if ratio < 80:
        return "Z3"
    if ratio < 90:
        return "Z4"
    return "Z5"


def _build_per_run_hr(activities: list[Activity]) -> list[HrPerRunAnalytics]:
    max_hr_value = 190
    ordered_zones = ["Z1", "Z2", "Z3", "Z4", "Z5"]
    rows: list[HrPerRunAnalytics] = []

    for activity in activities:
        total_duration = _moving_time_to_seconds(activity.moving_time)
        has_hr_data = activity.average_heartrate is not None

        if not has_hr_data:
            analyzed_duration = 0
            coverage_ratio = 0.0
            confidence_level = "none"
            confidence_reason = (
                "No heart-rate samples are available for this run."
            )
            zone_durations = {zone: 0 for zone in ordered_zones}
        else:
            zone = _zone_for_heart_rate(activity.average_heartrate, max_hr_value)
            analyzed_duration = total_duration
            coverage_ratio = 1.0 if total_duration > 0 else 0.0
            confidence_level = "medium"
            confidence_reason = (
                "Zone time is estimated from average heart rate and does not use per-sample heart-rate series."
            )
            zone_durations = {name: 0 for name in ordered_zones}
            zone_durations[zone] = analyzed_duration

        zones = [
            HrZoneBreakdownEntry(
                zone=zone_name,
                duration_seconds=zone_durations[zone_name],
                percentage=(
                    zone_durations[zone_name] / analyzed_duration
                    if analyzed_duration > 0
                    else 0.0
                ),
            )
            for zone_name in ordered_zones
        ]

        rows.append(
            HrPerRunAnalytics(
                run_id=activity.run_id,
                total_duration_seconds=total_duration,
                analyzed_duration_seconds=analyzed_duration,
                coverage_ratio=coverage_ratio,
                confidence_level=confidence_level,
                confidence_reason=confidence_reason,
                has_hr_data=has_hr_data,
                zones=zones,
            )
        )

    return rows


LOW_SAMPLE_THRESHOLD = 2


def _start_of_week(date_str: str) -> str:
    from datetime import datetime, timedelta

    parsed = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    week_start = parsed - timedelta(days=parsed.weekday())
    return week_start.date().isoformat()


def _month_key(date_str: str) -> str:
    from datetime import datetime

    parsed = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    return f"{parsed.year:04d}-{parsed.month:02d}"


def _build_trend_points(
    activities: list[Activity], period: str
) -> list[HrTrendPoint]:
    grouped: dict[str, dict[str, object]] = {}

    for activity in activities:
        key = (
            _start_of_week(activity.start_date_local)
            if period == "weekly"
            else _month_key(activity.start_date_local)
        )
        bucket = grouped.setdefault(
            key,
            {
                "run_ids": [],
                "hr_values": [],
            },
        )
        run_ids_bucket = bucket["run_ids"]
        hr_values_bucket = bucket["hr_values"]
        run_ids_bucket.append(activity.run_id)
        if activity.average_heartrate is not None:
            hr_values_bucket.append(activity.average_heartrate)

    points: list[HrTrendPoint] = []
    for key in sorted(grouped.keys()):
        bucket = grouped[key]
        hr_values = bucket["hr_values"]
        run_ids = bucket["run_ids"]
        sample_count = len(hr_values)
        has_data = sample_count > 0
        is_low_confidence = sample_count < LOW_SAMPLE_THRESHOLD
        if has_data:
            avg = sum(hr_values) / sample_count
            reason = (
                "Sparse sample count for this period."
                if is_low_confidence
                else "Sufficient sample count for this period."
            )
        else:
            avg = None
            reason = "No heart-rate samples are available for this period."

        points.append(
            HrTrendPoint(
                period_key=key,
                period_label=key,
                average_heartrate=avg,
                sample_count=sample_count,
                is_low_confidence=is_low_confidence,
                has_data=has_data,
                confidence_reason=reason,
                run_ids=run_ids,
            )
        )

    return points


def _build_hr_trend(activities: list[Activity]) -> HrTrendAnalytics:
    weekly = _build_trend_points(activities, "weekly")
    monthly = _build_trend_points(activities, "monthly")
    return HrTrendAnalytics(
        periods=HrTrendPeriods(weekly=weekly, monthly=monthly),
        default_period="weekly",
        low_sample_threshold=LOW_SAMPLE_THRESHOLD,
    )
