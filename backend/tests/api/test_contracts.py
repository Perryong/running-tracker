def test_activities_contract():
    from tests.conftest import get_client

    response = get_client().get("/api/v1/activities")

    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"freshness", "items"}
    assert set(body["freshness"].keys()) == {"last_sync_at", "completeness"}
    assert isinstance(body["items"], list)


def test_analytics_summary_contract():
    from tests.conftest import get_client

    response = get_client().get("/api/v1/analytics/summary")

    assert response.status_code == 200
    body = response.json()
    assert "freshness" in body
    assert "last_sync_at" in body["freshness"]
    assert "completeness" in body["freshness"]
