import os
import sys

import pytest
from fastapi.testclient import TestClient

# Ensure BACKEND directory is on sys.path so `import app` works
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.core import loader


def create_test_client() -> TestClient:
    # Avoid hitting the real filesystem-based loader in tests
    app.router.on_startup.clear()

    # Minimal in-memory data for exercising endpoints
    loader.player_index = {
        1: {
            "player_id": 1,
            "player_name": "Test Player",
            "team": "Test Team",
            "im_rolling_0_100": 75.0,
            "band": "High",
            "as_of_date": "2024-01-01",
        }
    }

    loader.innings_index = {
        1: [
            {
                "match_id": 10,
                "date": "2024-01-02",
                "im_innings_0_100": 60.0,
            },
            {
                "match_id": 11,
                "date": "2024-01-03",
                "im_innings_0_100": 80.0,
            },
        ]
    }

    loader.match_index = {
        99: {
            "match_id": 99,
            "teamA": "Team A",
            "teamB": "Team B",
            "winner": "Team A",
            "venue": "Test Stadium",
            "date": "2024-01-05",
        }
    }

    return TestClient(app)


def test_health():
    client = create_test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_player_search():
    client = create_test_client()
    resp = client.get("/players", params={"q": "Test"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["items"][0]["playerId"] == 1


def test_player_summary():
    client = create_test_client()
    resp = client.get("/players/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["playerId"] == 1
    assert data["name"] == "Test Player"


def test_player_impact():
    client = create_test_client()
    resp = client.get("/players/1/impact", params={"window": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["playerId"] == 1
    assert data["window"] == 2
    assert len(data["trend"]) == 2


def test_player_innings():
    client = create_test_client()
    resp = client.get("/players/1/innings", params={"limit": 1})
    assert resp.status_code == 200
    data = resp.json()
    assert data["playerId"] == 1
    assert len(data["items"]) == 1


def test_match_details():
    client = create_test_client()
    resp = client.get("/matches/99")
    assert resp.status_code == 200
    data = resp.json()
    assert data["match_id"] == 99
    assert data["teamA"] == "Team A"


def test_impact_leaderboard():
    client = create_test_client()
    resp = client.get("/leaderboards/impact", params={"limit": 10})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["playerId"] == 1

