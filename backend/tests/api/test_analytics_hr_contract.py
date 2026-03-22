def test_hr_methodology_and_confidence_contract(client):
    response = client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    body = response.json()

    hr = body["summary"]["heart_rate"]
    assert set(hr.keys()) == {
        "methodology",
        "confidence",
        "coverage",
        "per_run",
    }

    methodology = hr["methodology"]
    assert methodology["model"] == "max_hr_percentage_5_zone"
    assert methodology["zone_time_basis"] in {
        "hr_samples",
        "estimated_from_average_hr",
        "unavailable",
    }
    assert isinstance(methodology["max_hr_value"], int)
    assert methodology["max_hr_source"] in {
        "user_configured",
        "default_fallback",
    }
    assert isinstance(methodology["estimated"], bool)
    assert set(methodology["zone_boundaries_pct"].keys()) == {
        "z1",
        "z2",
        "z3",
        "z4",
        "z5",
    }

    confidence = hr["confidence"]
    assert confidence["level"] in {"high", "medium", "low", "none"}
    assert isinstance(confidence["reason"], str)
    assert confidence["reason"]

    coverage = hr["coverage"]
    assert isinstance(coverage["activities_with_hr"], int)
    assert isinstance(coverage["total_activities"], int)
    assert isinstance(coverage["coverage_ratio"], float)
    assert 0.0 <= coverage["coverage_ratio"] <= 1.0
    assert isinstance(coverage["has_enough_data"], bool)


def test_per_run_hr_contract_shape_and_zone_order(client):
    response = client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    body = response.json()

    heart_rate = body["summary"]["heart_rate"]
    assert "per_run" in heart_rate
    assert isinstance(heart_rate["per_run"], list)
    assert len(heart_rate["per_run"]) > 0

    first = heart_rate["per_run"][0]
    assert set(first.keys()) == {
        "run_id",
        "total_duration_seconds",
        "analyzed_duration_seconds",
        "coverage_ratio",
        "confidence_level",
        "confidence_reason",
        "has_hr_data",
        "zones",
    }
    assert isinstance(first["run_id"], int)
    assert isinstance(first["total_duration_seconds"], int)
    assert isinstance(first["analyzed_duration_seconds"], int)
    assert isinstance(first["coverage_ratio"], float)
    assert 0.0 <= first["coverage_ratio"] <= 1.0
    assert first["confidence_level"] in {"high", "medium", "low", "none"}
    assert isinstance(first["confidence_reason"], str)
    assert isinstance(first["has_hr_data"], bool)

    zones = first["zones"]
    assert [zone["zone"] for zone in zones] == ["Z1", "Z2", "Z3", "Z4", "Z5"]
    for zone in zones:
        assert isinstance(zone["duration_seconds"], int)
        assert isinstance(zone["percentage"], float)
        assert 0.0 <= zone["percentage"] <= 1.0


def test_hr_trend_contract_weekly_monthly_shape(client):
    response = client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    body = response.json()
    trend = body["summary"]["heart_rate"]["trend"]

    assert set(trend.keys()) == {"periods", "default_period", "low_sample_threshold"}
    assert set(trend["periods"].keys()) == {"weekly", "monthly"}
    assert trend["default_period"] in {"weekly", "monthly"}
    assert isinstance(trend["low_sample_threshold"], int)
    assert trend["low_sample_threshold"] >= 1

    for period in ("weekly", "monthly"):
        rows = trend["periods"][period]
        assert isinstance(rows, list)
        for row in rows:
            assert set(row.keys()) == {
                "period_key",
                "period_label",
                "average_heartrate",
                "sample_count",
                "is_low_confidence",
                "has_data",
                "confidence_reason",
                "run_ids",
            }
            assert isinstance(row["period_key"], str)
            assert isinstance(row["period_label"], str)
            assert isinstance(row["sample_count"], int)
            assert isinstance(row["is_low_confidence"], bool)
            assert isinstance(row["has_data"], bool)
            assert isinstance(row["confidence_reason"], str)
            assert isinstance(row["run_ids"], list)
            for run_id in row["run_ids"]:
                assert isinstance(run_id, int)

            if row["has_data"]:
                assert row["average_heartrate"] is not None
                assert row["sample_count"] > 0
            else:
                assert row["average_heartrate"] is None
                assert row["sample_count"] == 0


def test_hr_trend_no_hr_data_returns_explicit_empty_periods(monkeypatch, client):
    from api.schemas.activity import Activity
    from api.schemas.common import FreshnessMetadata
    from api.services import analytics_service

    def fake_get_activities_data():
        freshness = FreshnessMetadata(
            last_sync_at="2026-01-01T00:00:00Z",
            completeness="complete",
        )
        activities = [
            Activity(
                run_id=501,
                name="Walk without HR",
                distance=3000,
                moving_time="00:30:00",
                type="walking",
                subtype="",
                start_date="2026-01-01T00:00:00Z",
                start_date_local="2026-01-01T00:00:00Z",
                location_country="CN",
                summary_polyline=None,
                average_heartrate=None,
                elevation_gain=10,
                average_speed=1.6,
                streak=1,
            )
        ]
        return freshness, activities

    monkeypatch.setattr(analytics_service, "get_activities_data", fake_get_activities_data)
    response = client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    trend = response.json()["summary"]["heart_rate"]["trend"]

    weekly_rows = trend["periods"]["weekly"]
    monthly_rows = trend["periods"]["monthly"]
    assert len(weekly_rows) == 1
    assert len(monthly_rows) == 1

    for row in [weekly_rows[0], monthly_rows[0]]:
        assert row["has_data"] is False
        assert row["average_heartrate"] is None
        assert row["sample_count"] == 0
        assert row["is_low_confidence"] is True
        assert row["confidence_reason"]
