from fastapi import APIRouter

from api.schemas.activity import ActivitiesResponse
from api.services.activity_service import get_activities_data

router = APIRouter(prefix="/api/v1", tags=["activities"])


@router.get("/activities", response_model=ActivitiesResponse)
def list_activities() -> ActivitiesResponse:
    freshness, items = get_activities_data()
    return ActivitiesResponse(freshness=freshness, items=items)
