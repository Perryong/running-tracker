from fastapi.testclient import TestClient
import pytest

from api.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
