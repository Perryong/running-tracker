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
