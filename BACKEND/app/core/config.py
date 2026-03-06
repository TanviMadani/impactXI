from pathlib import Path


# Existing datastore configuration
DATA_DIR = Path("data_store")

PLAYER_ROLLING_FILE = DATA_DIR / "player_rolling.parquet"
PLAYER_INNINGS_FILE = DATA_DIR / "player_innings.parquet"
MATCH_INDEX_FILE = DATA_DIR / "match_index.parquet"

ADMIN_KEY = "hackathon-secret"

DATA_VERSION = "v1"


# Model configuration (now bundled in data_store for deployment)
ML_MODEL_DIR = DATA_DIR / "models"

BAT_MODEL_PATH = ML_MODEL_DIR / "xgb_batting_expected_runs.json"