from fastapi import FastAPI

from api.routers.activities import router as activities_router
from api.routers.analytics import router as analytics_router

app = FastAPI(title="Running Tracker API", version="1.0.0")
app.include_router(activities_router)
app.include_router(analytics_router)
