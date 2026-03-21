import json
import os
from datetime import datetime, timezone

from run_page.config import JSON_FILE

from api.schemas.activity import Activity
from api.schemas.common import FreshnessMetadata


def get_activities_data() -> tuple[FreshnessMetadata, list[Activity]]:
    if not os.path.exists(JSON_FILE):
        return (
            FreshnessMetadata(
                last_sync_at=datetime.now(timezone.utc).isoformat(),
                completeness="unavailable",
            ),
            [],
        )

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    activities = [Activity.model_validate(item) for item in raw_items]
    completeness = "complete" if activities else "partial"

    return (
        FreshnessMetadata(
            last_sync_at=datetime.fromtimestamp(
                os.path.getmtime(JSON_FILE), tz=timezone.utc
            ).isoformat(),
            completeness=completeness,
        ),
        activities,
    )
