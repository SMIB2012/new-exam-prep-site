"""
Health check tests for the API.
"""
import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    """Create a test client with in-memory SQLite database."""
    # Use in-memory SQLite for tests to avoid database connection issues
    original_db_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"

    try:
        # Import here to ensure environment variable is set before app initialization
        from main import app
        yield TestClient(app)
    finally:
        # Restore original DATABASE_URL if it existed
        if original_db_url:
            os.environ["DATABASE_URL"] = original_db_url
        elif "DATABASE_URL" in os.environ:
            del os.environ["DATABASE_URL"]


def test_root_endpoint(client):
    """Test that the root endpoint returns 200 and correct message."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["message"] == "Medical Exam Platform API"
    assert data["version"] == "1.0.0"

