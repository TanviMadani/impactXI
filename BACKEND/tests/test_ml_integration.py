import os
import sys

from fastapi.testclient import TestClient

# Ensure BACKEND directory is on sys.path so `import app` works
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.core import ml_models


def create_test_client() -> TestClient:
    # Avoid real startup side effects (datastore loading) in tests
    app.router.on_startup.clear()
    return TestClient(app)


def test_batting_expected_endpoint(monkeypatch):
    # Monkeypatch the core prediction function so tests do not depend
    # on real model files or xgboost being installed.
    def fake_predict(features):
        assert "balls" in features
        return 42.5

    monkeypatch.setattr(ml_models, "predict_batting_expected", fake_predict)

    client = create_test_client()

    payload = {
        "balls": 30,
        "entry_score": 50.0,
        "entry_wkts": 2,
        "entry_balls_remaining": 120,
        "entry_required_rr": 8.5,
        "balls_pp": 12,
        "balls_middle": 12,
        "balls_death": 6,
        "pressure_proxy": 0.3,
        "fours": 4,
        "sixes": 2,
        "innings": 1,
    }

    resp = client.post("/ml/batting-expected", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["expectedRuns"] == 42.5

