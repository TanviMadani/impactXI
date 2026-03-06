from __future__ import annotations

from typing import Dict, Any

import pandas as pd

from app.core.config import BAT_MODEL_PATH

_bat_model = None


def _load_batting_model():
    global _bat_model
    if _bat_model is not None:
        return _bat_model

    try:
        from xgboost import XGBRegressor  # type: ignore
    except ImportError as exc:  # pragma: no cover - exercised only when xgboost missing
        raise RuntimeError(
            "xgboost is required for batting expected-runs predictions. "
            "Install it with `pip install xgboost` and ensure trained models exist."
        ) from exc

    if not BAT_MODEL_PATH.exists():  # pragma: no cover - runtime guard
        raise FileNotFoundError(
            f"Batting model file not found at {BAT_MODEL_PATH}. "
            "Run the ML training pipeline to generate it."
        )

    model = XGBRegressor()
    model.load_model(str(BAT_MODEL_PATH))
    _bat_model = model
    return _bat_model


def predict_batting_expected(features: Dict[str, Any]) -> float:
    """
    Predict expected runs for a batting context using the trained XGBoost model.

    The feature keys must align with the training script:
      balls, entry_score, entry_wkts, entry_balls_remaining, entry_required_rr,
      balls_pp, balls_middle, balls_death, pressure_proxy, fours, sixes, innings
    """
    feature_order = [
        "balls",
        "entry_score",
        "entry_wkts",
        "entry_balls_remaining",
        "entry_required_rr",
        "balls_pp",
        "balls_middle",
        "balls_death",
        "pressure_proxy",
        "fours",
        "sixes",
        "innings",
    ]

    row = {name: float(features.get(name, 0.0)) for name in feature_order}
    df = pd.DataFrame([row], columns=feature_order)

    model = _load_batting_model()
    prediction = float(model.predict(df)[0])
    return max(0.0, prediction)

