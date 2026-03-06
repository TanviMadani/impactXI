# ------------------------------------------------------------
# STEP 5:
# Build "Match Impact" from Step 4 outputs (Actual vs Expected)
# ------------------------------------------------------------

import os
import numpy as np
import pandas as pd

BASE_DIR = "./outputs_impact_metric"

BAT_PATH = os.path.join(BASE_DIR, "batting_expected.csv")
BOWL_PATH = os.path.join(BASE_DIR, "bowling_expected.csv")

OUT_PATH = os.path.join(BASE_DIR, "match_player_impact.csv")

# Tunable weights
WICKET_WEIGHT_RUNS = 20.0
BOWL_RUNS_WEIGHT = 1.0
BAT_WEIGHT = 1.0

BAT_PRESSURE_CAP = 2.0
BOWL_PRESSURE_CAP = 1.6

EPS = 1e-9


def require_cols(df, cols, name):
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"{name} is missing columns: {missing}")


def robust_0_100(series):
    x = series.astype(float)
    med = x.median()
    mad = (x.sub(med).abs()).median()

    if mad < EPS:
        return pd.Series([50.0] * len(x), index=series.index)

    z = (x - med) / (1.4826 * mad + EPS)
    z = z.clip(-3, 3)

    score = 50 + (z / 3.0) * 50
    return score.clip(0, 100)


def main():

    if not os.path.exists(BAT_PATH):
        raise FileNotFoundError(f"Missing {BAT_PATH}")

    if not os.path.exists(BOWL_PATH):
        raise FileNotFoundError(f"Missing {BOWL_PATH}")

    # ------------------------------------------------
    # Load Step-4 outputs
    # ------------------------------------------------
    bat = pd.read_csv(BAT_PATH)
    bowl = pd.read_csv(BOWL_PATH)

    # ------------------------------------------------
    # Validate batting columns
    # ------------------------------------------------
    require_cols(
        bat,
        ["match_id", "innings", "batter", "runs", "expected_runs", "bat_residual", "pressure_proxy"],
        "batting_expected.csv"
    )

    # ------------------------------------------------
    # Validate bowling base columns
    # ------------------------------------------------
    require_cols(
        bowl,
        ["match_id", "innings", "bowler", "runs_conceded", "expected_runs_conceded", "balls", "balls_death"],
        "bowling_expected.csv"
    )

    # ------------------------------------------------
    # Compute residual if missing
    # ------------------------------------------------
    if "bowl_residual_runs" not in bowl.columns:

        bowl["runs_conceded"] = pd.to_numeric(
            bowl["runs_conceded"], errors="coerce"
        ).fillna(0)

        bowl["expected_runs_conceded"] = pd.to_numeric(
            bowl["expected_runs_conceded"], errors="coerce"
        ).fillna(0)

        bowl["bowl_residual_runs"] = (
            bowl["expected_runs_conceded"] - bowl["runs_conceded"]
        )

    # ------------------------------------------------
    # Batting Impact
    # ------------------------------------------------
    bat = bat.copy()
    bat["player"] = bat["batter"].astype(str)

    bat["bat_residual"] = pd.to_numeric(
        bat["bat_residual"], errors="coerce"
    ).fillna(0)

    pressure = 1 + pd.to_numeric(
        bat["pressure_proxy"], errors="coerce"
    ).fillna(0)

    bat["bat_pressure_mult"] = pressure.clip(0.7, BAT_PRESSURE_CAP)

    bat["bat_impact_raw"] = (
        BAT_WEIGHT *
        bat["bat_residual"] *
        bat["bat_pressure_mult"]
    )

    bat_small = bat[
        ["match_id", "player", "bat_impact_raw"]
    ].copy()

    bat_agg = bat_small.groupby(
        ["match_id", "player"],
        as_index=False
    ).agg(
        bat_impact_raw=("bat_impact_raw", "sum")
    )

    # ------------------------------------------------
    # Bowling Impact
    # ------------------------------------------------
    bowl = bowl.copy()
    bowl["player"] = bowl["bowler"].astype(str)

    bowl["bowl_residual_runs"] = pd.to_numeric(
        bowl["bowl_residual_runs"], errors="coerce"
    ).fillna(0)

    balls = pd.to_numeric(bowl["balls"], errors="coerce").fillna(0)
    death = pd.to_numeric(bowl["balls_death"], errors="coerce").fillna(0)

    death_frac = (death / (balls + EPS)).clip(0, 1)

    innings = pd.to_numeric(bowl["innings"], errors="coerce").fillna(0)
    innings_bonus = (innings == 2).astype(float) * 0.2

    pressure = 1 + 0.6 * death_frac + innings_bonus
    bowl["bowl_pressure_mult"] = pressure.clip(0.8, BOWL_PRESSURE_CAP)

    bowl["bowl_runs_impact_raw"] = (
        BOWL_RUNS_WEIGHT *
        bowl["bowl_residual_runs"] *
        bowl["bowl_pressure_mult"]
    )

    # Optional wickets model
    if "bowl_residual_wkts" in bowl.columns:

        bowl["bowl_residual_wkts"] = pd.to_numeric(
            bowl["bowl_residual_wkts"], errors="coerce"
        ).fillna(0)

        bowl["bowl_wkts_impact_raw"] = (
            bowl["bowl_residual_wkts"] *
            WICKET_WEIGHT_RUNS *
            bowl["bowl_pressure_mult"]
        )

    else:
        bowl["bowl_wkts_impact_raw"] = 0

    bowl_small = bowl[
        ["match_id", "player",
         "bowl_runs_impact_raw",
         "bowl_wkts_impact_raw"]
    ].copy()

    bowl_agg = bowl_small.groupby(
        ["match_id", "player"],
        as_index=False
    ).agg(
        bowl_runs_impact_raw=("bowl_runs_impact_raw", "sum"),
        bowl_wkts_impact_raw=("bowl_wkts_impact_raw", "sum")
    )

    # ------------------------------------------------
    # Combine Bat + Bowl
    # ------------------------------------------------
    impact = pd.merge(
        bat_agg,
        bowl_agg,
        on=["match_id", "player"],
        how="outer"
    ).fillna(0)

    impact["total_impact_raw"] = (
        impact["bat_impact_raw"] +
        impact["bowl_runs_impact_raw"] +
        impact["bowl_wkts_impact_raw"]
    )

    # ------------------------------------------------
    # Normalize score
    # ------------------------------------------------
    impact["impact_score_0_100"] = robust_0_100(
        impact["total_impact_raw"]
    )

    impact["impact_label"] = pd.cut(
        impact["impact_score_0_100"],
        bins=[-0.1, 35, 45, 55, 70, 100.1],
        labels=[
            "poor",
            "below_avg",
            "neutral",
            "good",
            "elite"
        ]
    )

    impact = impact.sort_values(
        ["match_id", "impact_score_0_100"],
        ascending=[True, False]
    ).reset_index(drop=True)

    impact.to_csv(OUT_PATH, index=False)

    print("Saved:", OUT_PATH)
    print("Rows:", impact.shape[0])

    print("\nTop Impact Performances\n")
    print(
        impact[
            [
                "match_id",
                "player",
                "impact_score_0_100",
                "impact_label"
            ]
        ].head(15)
    )


if __name__ == "__main__":
    main()