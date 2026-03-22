def test_hr_methodology_and_confidence_contract(client):
    response = client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    body = response.json()

    hr = body["summary"]["heart_rate"]
    assert set(hr.keys()) == {"methodology", "confidence", "coverage"}

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
