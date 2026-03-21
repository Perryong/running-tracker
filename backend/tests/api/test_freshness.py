def test_freshness_fields_required(client):
    activity_response = client.get("/api/v1/activities")
    assert activity_response.status_code == 200
    activity_body = activity_response.json()
    assert activity_body["freshness"]["last_sync_at"]
    assert activity_body["freshness"]["completeness"] in {
        "complete",
        "partial",
        "unavailable",
    }

    analytics_response = client.get("/api/v1/analytics/summary")
    assert analytics_response.status_code == 200
    analytics_body = analytics_response.json()
    assert analytics_body["freshness"]["last_sync_at"]
    assert analytics_body["freshness"]["completeness"] in {
        "complete",
        "partial",
        "unavailable",
    }
