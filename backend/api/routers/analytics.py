from fastapi import APIRouter

from api.schemas.analytics import AnalyticsSummaryResponse
from api.services.analytics_service import get_analytics_summary_data

router = APIRouter(prefix="/api/v1", tags=["analytics"])


@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary() -> AnalyticsSummaryResponse:
    freshness, summary = get_analytics_summary_data()
    return AnalyticsSummaryResponse(freshness=freshness, summary=summary)
