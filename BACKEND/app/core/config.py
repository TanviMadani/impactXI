from pathlib import Path


# Existing datastore configuration
DATA_DIR = Path("data_store")

PLAYER_ROLLING_FILE = DATA_DIR / "player_rolling.parquet"
PLAYER_INNINGS_FILE = DATA_DIR / "player_innings.parquet"
MATCH_INDEX_FILE = DATA_DIR / "match_index.parquet"

ADMIN_KEY = "hackathon-secret"

DATA_VERSION = "v1"


# Project-root-relative ML model configuration
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_OUTPUT_DIR = PROJECT_ROOT / "ML" / "outputs_impact_metric"
ML_MODEL_DIR = ML_OUTPUT_DIR / "models"

BAT_MODEL_PATH = ML_MODEL_DIR / "xgb_batting_expected_runs.json"