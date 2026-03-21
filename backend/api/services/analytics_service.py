from api.schemas.activity import Activity
from api.schemas.analytics import AnalyticsSummary
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

    return AnalyticsSummary(
        total_activities=len(activities),
        total_distance=total_distance,
        total_moving_time_seconds=total_moving_time_seconds,
        average_heartrate=average_heartrate,
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
