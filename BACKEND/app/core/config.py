from __future__ import annotations

import os
from pathlib import Path


def _split_csv_env(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


# `config.py` is located at BACKEND/app/core/config.py
# parents: core -> app -> BACKEND
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings:
    # Environment
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS
    ALLOWED_ORIGINS: list[str] = _split_csv_env(
        os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
    )

    # Admin
    ADMIN_KEY: str = os.getenv("ADMIN_KEY", "hackathon-secret")

    # Datastore
    DATA_STORE_DIR: Path = Path(os.getenv("DATA_STORE_DIR", str(BACKEND_DIR / "data_store")))
    PLAYER_ROLLING_FILE: Path = Path(
        os.getenv("PLAYER_ROLLING_FILE", str(DATA_STORE_DIR / "player_rolling.parquet"))
    )
    PLAYER_INNINGS_FILE: Path = Path(
        os.getenv("PLAYER_INNINGS_FILE", str(DATA_STORE_DIR / "player_innings.parquet"))
    )
    MATCH_INDEX_FILE: Path = Path(
        os.getenv("MATCH_INDEX_FILE", str(DATA_STORE_DIR / "match_index.parquet"))
    )
    # Optional: for squad counts (use this instead of player_impact_metric for team size)
    TEAM_PLAYER_MASTER_FILE: Path = Path(
        os.getenv("TEAM_PLAYER_MASTER_FILE", str(DATA_STORE_DIR / "team_player_master.parquet"))
    )
    # Optional: for match result view (scorecard)
    MATCH_BATTING_CARD_FILE: Path = Path(
        os.getenv("MATCH_BATTING_CARD_FILE", str(DATA_STORE_DIR / "match_batting_card.parquet"))
    )
    MATCH_BOWLING_CARD_FILE: Path = Path(
        os.getenv("MATCH_BOWLING_CARD_FILE", str(DATA_STORE_DIR / "match_bowling_card.parquet"))
    )

    # Models (inference)
    ML_MODEL_DIR: Path = Path(os.getenv("ML_MODEL_DIR", str(DATA_STORE_DIR / "models")))
    BAT_MODEL_PATH: Path = Path(
        os.getenv("MODEL_PATH", str(ML_MODEL_DIR / "xgb_batting_expected_runs.json"))
    )

    # Versioning (optional)
    DATA_VERSION: str = os.getenv("DATA_VERSION", "v1")


settings = Settings()