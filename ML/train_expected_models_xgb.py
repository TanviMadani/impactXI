import os
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

try:
    from xgboost import XGBRegressor
except ImportError as e:
    raise SystemExit(
        "xgboost not installed.\n"
        "Run: pip install xgboost\n"
        f"Original error: {e}"
    )

BASE_DIR = "./outputs_impact_metric"
MODEL_DIR = os.path.join(BASE_DIR, "models")

BAT_CTX_PATH = os.path.join(BASE_DIR, "batting_context.csv")
BOWL_CTX_PATH = os.path.join(BASE_DIR, "bowling_context.csv")

BAT_OUT_PATH = os.path.join(BASE_DIR, "batting_expected.csv")
BOWL_OUT_PATH = os.path.join(BASE_DIR, "bowling_expected.csv")

BAT_MODEL_PATH = os.path.join(MODEL_DIR, "xgb_batting_expected_runs.json")
BOWL_RUNS_MODEL_PATH = os.path.join(MODEL_DIR, "xgb_bowling_expected_runs_conceded.json")
BOWL_WKTS_MODEL_PATH = os.path.join(MODEL_DIR, "xgb_bowling_expected_wickets.json")

RANDOM_SEED = 42
TRAIN_WICKETS_MODEL = True


def ensure_dir(p: str):
    os.makedirs(p, exist_ok=True)


def safe_numeric(df: pd.DataFrame, cols):
    """Convert columns to numeric, coerce errors to NaN, fill with 0."""
    out = df.copy()
    for c in cols:
        if c not in out.columns:
            out[c] = 0
        out[c] = pd.to_numeric(out[c], errors="coerce").fillna(0)
    return out


def match_id_split(df: pd.DataFrame, test_size=0.2, seed=RANDOM_SEED):
    """Split by match_id to avoid leakage."""
    if "match_id" not in df.columns:
        raise ValueError("match_id column missing; cannot do match-level split.")

    match_ids = df["match_id"].astype(str).unique()
    if len(match_ids) == 0:
        raise ValueError("No match_id values found (dataset empty after filtering).")

    train_ids, test_ids = train_test_split(match_ids, test_size=test_size, random_state=seed)

    train_df = df[df["match_id"].astype(str).isin(train_ids)].copy()
    test_df = df[df["match_id"].astype(str).isin(test_ids)].copy()
    return train_df, test_df


def train_xgb_regressor(X_train, y_train, X_val, y_val, seed=RANDOM_SEED):
    model = XGBRegressor(
        n_estimators=800,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_lambda=1.0,
        reg_alpha=0.0,
        min_child_weight=3,
        objective="reg:squarederror",
        random_state=seed,
        n_jobs=-1,
        tree_method="hist"
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    return model


def normalize_batting_ctx(bat: pd.DataFrame) -> pd.DataFrame:
    """
    Make batting table compatible with expected column names.

    Accepts either:
      - runs/balls/balls_pp/balls_middle/balls_death
      - runs_scored/balls_faced/pp_balls/mid_balls/death_balls
    """
    bat = bat.copy()

    rename_map = {}

    # target + main
    if "runs" not in bat.columns and "runs_scored" in bat.columns:
        rename_map["runs_scored"] = "runs"
    if "balls" not in bat.columns and "balls_faced" in bat.columns:
        rename_map["balls_faced"] = "balls"

    # phase balls
    if "balls_pp" not in bat.columns and "pp_balls" in bat.columns:
        rename_map["pp_balls"] = "balls_pp"
    if "balls_middle" not in bat.columns and "mid_balls" in bat.columns:
        rename_map["mid_balls"] = "balls_middle"
    if "balls_death" not in bat.columns and "death_balls" in bat.columns:
        rename_map["death_balls"] = "balls_death"

    bat = bat.rename(columns=rename_map)

    # fill optional entry/context columns if not present
    for c in ["entry_score", "entry_wkts", "entry_balls_remaining", "entry_required_rr", "pressure_proxy", "innings"]:
        if c not in bat.columns:
            bat[c] = 0

    return bat


def normalize_bowling_ctx(bowl: pd.DataFrame) -> pd.DataFrame:
    """
    Make bowling table compatible with expected column names.

    Accepts either:
      - runs_conceded/balls/balls_pp/balls_middle/balls_death
      - runs_conceded/balls/pp_balls/mid_balls/death_balls
    """
    bowl = bowl.copy()

    rename_map = {}
    if "balls_pp" not in bowl.columns and "pp_balls" in bowl.columns:
        rename_map["pp_balls"] = "balls_pp"
    if "balls_middle" not in bowl.columns and "mid_balls" in bowl.columns:
        rename_map["mid_balls"] = "balls_middle"
    if "balls_death" not in bowl.columns and "death_balls" in bowl.columns:
        rename_map["death_balls"] = "balls_death"

    bowl = bowl.rename(columns=rename_map)

    # defaults if missing
    for c in ["innings", "wides", "noballs", "dot_balls", "wickets"]:
        if c not in bowl.columns:
            bowl[c] = 0

    # if runs_conceded missing but you used a different name (rare), try fallback:
    if "runs_conceded" not in bowl.columns and "runs" in bowl.columns:
        bowl = bowl.rename(columns={"runs": "runs_conceded"})

    return bowl


def main():
    ensure_dir(MODEL_DIR)

    if not os.path.exists(BAT_CTX_PATH):
        raise FileNotFoundError(f"Missing: {BAT_CTX_PATH} (Run Step 3 first)")
    if not os.path.exists(BOWL_CTX_PATH):
        raise FileNotFoundError(f"Missing: {BOWL_CTX_PATH} (Run Step 3 first)")

    bat = pd.read_csv(BAT_CTX_PATH)
    bowl = pd.read_csv(BOWL_CTX_PATH)

    # ✅ normalize schemas
    bat = normalize_batting_ctx(bat)
    bowl = normalize_bowling_ctx(bowl)

    # -------------------------
    # BAT: Expected Runs model
    # -------------------------
    bat_features = [
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
    ]

    bat = safe_numeric(bat, bat_features + ["runs", "innings"])
    bat = bat[bat["balls"] > 0].copy()

    if bat.empty:
        raise ValueError(
            "Batting dataset became empty.\n"
            "This usually means your batting context CSV doesn't have balls/runs columns.\n"
            "Expected either (balls,runs) or (balls_faced,runs_scored)."
        )

    bat_features_with_innings = bat_features + ["innings"]

    bat_train, bat_test = match_id_split(bat, test_size=0.2)

    X_train = bat_train[bat_features_with_innings]
    y_train = bat_train["runs"]
    X_test = bat_test[bat_features_with_innings]
    y_test = bat_test["runs"]

    bat_model = train_xgb_regressor(X_train, y_train, X_test, y_test)

    bat_pred_test = bat_model.predict(X_test)
    bat_mae = mean_absolute_error(y_test, bat_pred_test)
    print(f"[BAT] Expected Runs model MAE (match-split): {bat_mae:.3f}")

    bat["expected_runs"] = bat_model.predict(bat[bat_features_with_innings]).clip(min=0)
    bat["bat_residual"] = bat["runs"] - bat["expected_runs"]

    bat_model.save_model(BAT_MODEL_PATH)
    bat.to_csv(BAT_OUT_PATH, index=False)
    print(f"[BAT] Saved model: {BAT_MODEL_PATH}")
    print(f"[BAT] Saved output: {BAT_OUT_PATH} shape={bat.shape}")

    # -------------------------
    # BOWL: Expected Runs Conceded model
    # -------------------------
    bowl_features_runs = [
        "balls",
        "innings",
        "balls_pp",
        "balls_middle",
        "balls_death",
        "wides",
        "noballs",
        "dot_balls",
    ]

    bowl = safe_numeric(bowl, bowl_features_runs + ["runs_conceded", "wickets"])
    bowl = bowl[bowl["balls"] > 0].copy()

    if bowl.empty:
        raise ValueError(
            "Bowling dataset became empty.\n"
            "Expected column 'balls' and 'runs_conceded'."
        )

    bowl_train, bowl_test = match_id_split(bowl, test_size=0.2)

    X_train = bowl_train[bowl_features_runs]
    y_train = bowl_train["runs_conceded"]
    X_test = bowl_test[bowl_features_runs]
    y_test = bowl_test["runs_conceded"]

    bowl_runs_model = train_xgb_regressor(X_train, y_train, X_test, y_test)

    bowl_pred_test = bowl_runs_model.predict(X_test)
    bowl_mae = mean_absolute_error(y_test, bowl_pred_test)
    print(f"[BOWL] Expected Runs Conceded model MAE (match-split): {bowl_mae:.3f}")

    bowl["expected_runs_conceded"] = bowl_runs_model.predict(bowl[bowl_features_runs]).clip(min=0)
    bowl["bowl_runs_residual"] = bowl["runs_conceded"] - bowl["expected_runs_conceded"]

    bowl_runs_model.save_model(BOWL_RUNS_MODEL_PATH)

    # -------------------------
    # Optional: Wickets model
    # -------------------------
    if TRAIN_WICKETS_MODEL:
        bowl_features_wkts = [
            "balls",
            "innings",
            "balls_pp",
            "balls_middle",
            "balls_death",
            "wides",
            "noballs",
            "dot_balls",
        ]

        X_train = bowl_train[bowl_features_wkts]
        y_train = bowl_train["wickets"]
        X_test = bowl_test[bowl_features_wkts]
        y_test = bowl_test["wickets"]

        wkts_model = train_xgb_regressor(X_train, y_train, X_test, y_test)
        wkts_pred = wkts_model.predict(X_test)
        wkts_mae = mean_absolute_error(y_test, wkts_pred)
        print(f"[BOWL] Expected Wickets model MAE (match-split): {wkts_mae:.3f}")

        bowl["expected_wickets"] = wkts_model.predict(bowl[bowl_features_wkts]).clip(min=0)
        bowl["bowl_wkts_residual"] = bowl["wickets"] - bowl["expected_wickets"]

        wkts_model.save_model(BOWL_WKTS_MODEL_PATH)
        print(f"[BOWL] Saved wickets model: {BOWL_WKTS_MODEL_PATH}")

    bowl.to_csv(BOWL_OUT_PATH, index=False)
    print(f"[BOWL] Saved runs model: {BOWL_RUNS_MODEL_PATH}")
    print(f"[BOWL] Saved output: {BOWL_OUT_PATH} shape={bowl.shape}")

    print("\n✅ Step 4 training complete.")


if __name__ == "__main__":
    main()