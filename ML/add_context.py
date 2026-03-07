import os
import glob
import math
import pandas as pd
from typing import List

from team_utils import normalize_team_name

DATA_DIR = "./ipl"
BASE_DIR = "./outputs_impact_metric"
OUT_DIR = "./outputs_impact_metric"

T20_BALLS = 120  # IPL T20 standard


# -------------------------
# Helpers
# -------------------------
def ensure_dir(p: str):
    os.makedirs(p, exist_ok=True)


def coalesce_cols(df: pd.DataFrame, candidates: List[str], fill_value=0) -> pd.Series:
    for c in candidates:
        if c in df.columns:
            return df[c]
    return pd.Series([fill_value] * len(df), index=df.index)


def parse_ball_to_over_ball(ball_val):
    """
    Handles common Cricsheet style: 0.1, 0.2 ... 19.6
    Sometimes it's already int/str; we try to parse robustly.
    Returns (over_idx, ball_in_over) both 0-indexed-ish for sorting.
    """
    if pd.isna(ball_val):
        return (0, 0)

    s = str(ball_val).strip()

    # common: "12.3"
    if "." in s:
        a, b = s.split(".", 1)
        try:
            over = int(a)
        except:
            over = 0
        try:
            ball = int(b)
        except:
            ball = 0
        return (over, ball)

    # fallback: if it's like "123" treat as sequence and map to over/ball
    try:
        seq = int(float(s))
        over = seq // 6
        ball = (seq % 6) + 1
        return (over, ball)
    except:
        return (0, 0)


def phase_from_over(over_idx: int) -> str:
    # IPL T20 phases:
    # Powerplay: 0-5
    # Middle: 6-15
    # Death: 16-19
    if over_idx <= 5:
        return "PP"
    if 6 <= over_idx <= 15:
        return "MID"
    return "DEATH"


# -------------------------
# Step 1: Load match ball-by-ball
# -------------------------
def load_folder_to_dataframe(data_dir: str) -> pd.DataFrame:
    if not os.path.isdir(data_dir):
        raise FileNotFoundError(f"DATA_DIR not found: {data_dir}")

    all_csv = glob.glob(os.path.join(data_dir, "*.csv"))
    match_csvs = [p for p in all_csv if not p.lower().endswith("_info.csv")]

    if not match_csvs:
        raise FileNotFoundError(f"No match CSVs found in {data_dir}")

    balls_parts = []
    for i, path in enumerate(match_csvs, 1):
        match_id = os.path.splitext(os.path.basename(path))[0]
        # robust read (simple)
        df = pd.read_csv(path, engine="python", on_bad_lines="skip")
        df["match_id"] = str(match_id)
        balls_parts.append(df)

        if i % 200 == 0:
            print(f"Loaded {i}/{len(match_csvs)} match CSVs...")

    balls_df = pd.concat(balls_parts, ignore_index=True) if balls_parts else pd.DataFrame()
    for col in ["batting_team", "bowling_team"]:
        if col in balls_df.columns:
            balls_df[col] = balls_df[col].apply(normalize_team_name)
    print("balls_df:", balls_df.shape)
    return balls_df


# -------------------------
# Step 2: Build ball-level context
# -------------------------
def build_ball_context(balls_df: pd.DataFrame) -> pd.DataFrame:
    df = balls_df.copy()

    # Column normalization
    if "innings" not in df.columns:
        raise ValueError("Missing column: innings")
    if "ball" not in df.columns:
        raise ValueError("Missing column: ball")
    if "batting_team" not in df.columns:
        raise ValueError("Missing column: batting_team")
    if "bowling_team" not in df.columns:
        raise ValueError("Missing column: bowling_team")

    batter_col = "striker" if "striker" in df.columns else ("batter" if "batter" in df.columns else None)
    if batter_col is None:
        raise ValueError("Missing batter column: expected 'striker' or 'batter'")
    if "bowler" not in df.columns:
        raise ValueError("Missing column: bowler")

    # Runs
    runs_off_bat = coalesce_cols(df, ["runs_off_bat", "batter_runs", "runs_batter"], 0).fillna(0).astype(int)
    extras = coalesce_cols(df, ["extras", "total_extras"], 0).fillna(0).astype(int)
    total_runs = runs_off_bat + extras

    # Wide / no-ball
    wides = coalesce_cols(df, ["wides", "wide"], 0).fillna(0).astype(float)
    noballs = coalesce_cols(df, ["noballs", "noball"], 0).fillna(0).astype(float)
    is_wide = (wides > 0).astype(int)
    is_noball = (noballs > 0).astype(int)

    # Legal delivery for most phase counts (exclude wides and no-balls)
    is_legal = ((wides <= 0) & (noballs <= 0)).astype(int)

    # Wicket info
    wicket_type = df["wicket_type"].astype(str).str.lower() if "wicket_type" in df.columns else pd.Series([""] * len(df))
    wicket_any = ((wicket_type != "") & (wicket_type != "nan")).astype(int)

    # Bowler credited wicket (exclude run out etc.)
    bowler_wicket = ((wicket_any == 1) & (~wicket_type.isin(["run out", "retired hurt", "obstructing the field"]))).astype(int)

    # Over & phase
    over_ball = df["ball"].apply(parse_ball_to_over_ball)
    df["over_idx"] = over_ball.apply(lambda t: t[0])
    df["ball_in_over"] = over_ball.apply(lambda t: t[1])
    df["phase"] = df["over_idx"].apply(phase_from_over)

    # ✅ IMPORTANT: assign computed series as columns BEFORE sorting
    df["runs_off_bat"] = runs_off_bat
    df["extras"] = extras
    df["total_runs"] = total_runs
    df["is_legal"] = is_legal
    df["is_wide"] = is_wide
    df["is_noball"] = is_noball
    df["wicket_any"] = wicket_any
    df["bowler_wicket"] = bowler_wicket
    df["batter"] = df[batter_col].astype(str)

    # Sort properly within match+innings
    df = df.sort_values(["match_id", "innings", "over_idx", "ball_in_over"]).reset_index(drop=True)

    # Sequence number (ball order) within match_id + innings
    df["seq_in_innings"] = df.groupby(["match_id", "innings"]).cumcount() + 1

    # Team cumulative score/wickets within innings
    df["cum_runs"] = df.groupby(["match_id", "innings"])["total_runs"].cumsum()
    df["cum_wkts"] = df.groupby(["match_id", "innings"])["wicket_any"].cumsum()

    # BEFORE current ball
    df["runs_before"] = df.groupby(["match_id", "innings"])["cum_runs"].shift(1).fillna(0).astype(int)
    df["wkts_before"] = df.groupby(["match_id", "innings"])["cum_wkts"].shift(1).fillna(0).astype(int)
    df["balls_elapsed_before"] = df.groupby(["match_id", "innings"])["seq_in_innings"].shift(1).fillna(0).astype(int)

    # Required RR for chases (innings 2)
    innings1_totals = df[df["innings"] == 1].groupby("match_id")["total_runs"].sum().rename("inn1_total")
    df = df.merge(innings1_totals, on="match_id", how="left")
    df["target"] = df["inn1_total"].fillna(0).astype(int) + 1

    df["balls_remaining_scheduled"] = (T20_BALLS - df["balls_elapsed_before"]).clip(lower=0)
    df["runs_needed"] = (df["target"] - df["runs_before"]).clip(lower=0)

    # Required RR only meaningful in innings 2
    df["required_rr"] = 0.0
    mask2 = (df["innings"] == 2) & (df["balls_remaining_scheduled"] > 0)
    df.loc[mask2, "required_rr"] = (df.loc[mask2, "runs_needed"] * 6.0) / df.loc[mask2, "balls_remaining_scheduled"]

    # For innings 1 keep required_rr = 0

    return df[
        [
            "match_id", "innings", "ball", "over_idx", "ball_in_over", "phase", "seq_in_innings",
            "batting_team", "bowling_team", "batter", "bowler",
            "runs_off_bat", "extras", "total_runs",
            "is_legal", "is_wide", "is_noball",
            "wicket_any", "bowler_wicket",
            "runs_before", "wkts_before", "balls_elapsed_before",
            "target", "runs_needed", "balls_remaining_scheduled", "required_rr"
        ]
    ]


# -------------------------
# Step 3A: batting context
# -------------------------
def build_batting_context(ball_ctx: pd.DataFrame) -> pd.DataFrame:
    df = ball_ctx.copy()

    # For each batter in a match+innings:
    # entry ball = first legal ball they face
    # balls faced = count of legal balls they face
    # runs scored = sum runs_off_bat on their faced balls
    # exit ball = last ball they face
    # (basic MVP, no dismissal mapping)
    faced = df[df["is_legal"] == 1].copy()

    g = faced.groupby(["match_id", "innings", "batter"], as_index=False).agg(
        entry_seq=("seq_in_innings", "min"),
        exit_seq=("seq_in_innings", "max"),
        balls_faced=("seq_in_innings", "count"),
        runs_scored=("runs_off_bat", "sum"),
        pp_balls=("phase", lambda x: int((x == "PP").sum())),
        mid_balls=("phase", lambda x: int((x == "MID").sum())),
        death_balls=("phase", lambda x: int((x == "DEATH").sum())),
    )

    return g


# -------------------------
# Step 3B: bowling context
# -------------------------
def build_bowling_context(ball_ctx: pd.DataFrame) -> pd.DataFrame:
    df = ball_ctx.copy()

    # For each bowler in match+innings
    g = df.groupby(["match_id", "innings", "bowler"], as_index=False).agg(
        balls=("is_legal", "sum"),
        runs_conceded=("total_runs", "sum"),
        wickets=("bowler_wicket", "sum"),
        dot_balls=("total_runs", lambda x: int((x == 0).sum())),
        pp_balls=("phase", lambda x: int((x == "PP").sum())),
        mid_balls=("phase", lambda x: int((x == "MID").sum())),
        death_balls=("phase", lambda x: int((x == "DEATH").sum())),
    )

    g["overs"] = g["balls"] / 6.0
    g["economy"] = g.apply(lambda r: (r["runs_conceded"] / r["overs"]) if r["overs"] > 0 else 0.0, axis=1)
    return g


# -------------------------
# I/O
# -------------------------
def main():
    ensure_dir(OUT_DIR)

    balls_df = load_folder_to_dataframe(DATA_DIR)

    # Build ball context
    ball_ctx = build_ball_context(balls_df)

    # Build batter/bowler context
    bat_ctx = build_batting_context(ball_ctx)
    bowl_ctx = build_bowling_context(ball_ctx)

    # Save
    ball_ctx.to_csv(os.path.join(OUT_DIR, "ball_context.csv"), index=False)
    bat_ctx.to_csv(os.path.join(OUT_DIR, "batting_context.csv"), index=False)
    bowl_ctx.to_csv(os.path.join(OUT_DIR, "bowling_context.csv"), index=False)

    print("✅ Saved:")
    print(os.path.join(OUT_DIR, "ball_context.csv"), ball_ctx.shape)
    print(os.path.join(OUT_DIR, "batting_context.csv"), bat_ctx.shape)
    print(os.path.join(OUT_DIR, "bowling_context.csv"), bowl_ctx.shape)


if __name__ == "__main__":
    main()