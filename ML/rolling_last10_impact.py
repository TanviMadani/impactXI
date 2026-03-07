# step6_rolling_last10_impact.py
# ------------------------------------------------------------
# STEP 6:
# From Step 5 match-level impacts, compute the final Player Impact Metric (IM)
# as a recency-weighted rolling average over the last 10 innings (matches).
#
# Input:
#   ./outputs_impact_metric/match_player_impact.csv
#
# Outputs:
#   ./outputs_impact_metric/player_impact_metric.csv
#   ./outputs_impact_metric/player_impact_trend_last10.csv   (for frontend trend chart)
#
# Notes:
# - We need match order. Best is to use match start date from *_info.csv.
#   If you have Step 1/2 info parquet/csv, we’ll use it automatically.
# - Fallback: if no date found, we sort by match_id (works okay for MVP).
#
# Run:
#   python step6_rolling_last10_impact.py
# ------------------------------------------------------------

import os
import glob
import pandas as pd
import numpy as np

BASE_DIR = "./outputs_impact_metric"
IMPACT_PATH = os.path.join(BASE_DIR, "match_player_impact.csv")

# We try to find match dates using your existing info files in ./ipl/*_info.csv
IPL_DIR = "./ipl"

OUT_IM_PATH = os.path.join(BASE_DIR, "player_impact_metric.csv")
OUT_TREND_PATH = os.path.join(BASE_DIR, "player_impact_trend_last10.csv")

LAST_N = 10

# Recency weights: oldest->newest (0.1..1.0)
WEIGHTS = np.linspace(0.1, 1.0, LAST_N)


def load_match_dates_from_info(ipl_dir: str) -> pd.DataFrame:
    """
    Attempts to build a match_id -> start_date mapping from *_info.csv files.
    Different datasets store info differently, so we support two common patterns:
      A) key/value rows: (key, value) or (info, value)
      B) columns directly including start_date / dates / match_date
    Returns DataFrame: match_id, match_date (datetime)
    """
    info_files = glob.glob(os.path.join(ipl_dir, "*_info.csv"))
    if not info_files:
        return pd.DataFrame(columns=["match_id", "match_date"])

    rows = []
    for path in info_files:
        match_id = os.path.basename(path).replace("_info.csv", "")
        try:
            df = pd.read_csv(path)
        except Exception:
            continue

        # Case B: date column already present
        for col in ["start_date", "start_dates", "match_date", "date", "dates"]:
            if col in df.columns:
                # pick first non-null
                val = df[col].dropna().astype(str)
                if len(val) > 0:
                    rows.append((match_id, val.iloc[0]))
                    break
        else:
            # Case A: key/value style
            # try typical column names
            key_col = None
            val_col = None
            for kc in ["key", "info", "event", "name"]:
                if kc in df.columns:
                    key_col = kc
                    break
            for vc in ["value", "info_value", "data", "val"]:
                if vc in df.columns:
                    val_col = vc
                    break

            if key_col is not None and val_col is not None:
                tmp = df[[key_col, val_col]].copy()
                tmp[key_col] = tmp[key_col].astype(str).str.lower()

                # common keys
                for k in ["start_date", "start date", "date", "match_date"]:
                    hit = tmp[tmp[key_col] == k]
                    if not hit.empty:
                        rows.append((match_id, str(hit[val_col].iloc[0])))
                        break

    out = pd.DataFrame(rows, columns=["match_id", "match_date_raw"]).drop_duplicates("match_id")
    if out.empty:
        return pd.DataFrame(columns=["match_id", "match_date"])

    # Parse dates robustly (IPL info may be yyyy-mm-dd)
    out["match_date"] = pd.to_datetime(out["match_date_raw"], errors="coerce", utc=False)
    out = out.dropna(subset=["match_date"])[["match_id", "match_date"]]
    return out


def load_player_teams_from_innings() -> dict:
    """
    Build player -> team from batting_innings.csv and bowling_innings.csv.
    Uses batting_team for batters, bowling_team for bowlers; if a player appears in both, batting takes precedence.
    """
    player_team = {}
    batting_path = os.path.join(BASE_DIR, "batting_innings.csv")
    bowling_path = os.path.join(BASE_DIR, "bowling_innings.csv")
    if os.path.exists(batting_path):
        b = pd.read_csv(batting_path)
        if "batter" in b.columns and "batting_team" in b.columns:
            for _, row in b.drop_duplicates("batter", keep="last").iterrows():
                player_team[str(row["batter"]).strip()] = str(row["batting_team"]).strip() or "Unknown"
    if os.path.exists(bowling_path):
        b = pd.read_csv(bowling_path)
        if "bowler" in b.columns and "bowling_team" in b.columns:
            for _, row in b.drop_duplicates("bowler", keep="last").iterrows():
                p = str(row["bowler"]).strip()
                if p and p not in player_team:
                    player_team[p] = str(row["bowling_team"]).strip() or "Unknown"
    return player_team


def compute_weighted_last10(scores: np.ndarray) -> float:
    """
    scores: array of recent scores in chronological order (old->new), length <= LAST_N
    Use matching tail of WEIGHTS so newest has biggest weight.
    """
    m = len(scores)
    if m == 0:
        return 50.0
    w = WEIGHTS[-m:]
    return float(np.sum(scores * w) / np.sum(w))


def main():
    if not os.path.exists(IMPACT_PATH):
        raise FileNotFoundError(f"Missing {IMPACT_PATH} (run Step 5)")

    impact = pd.read_csv(IMPACT_PATH)

    # We use impact_score_0_100 if present, else compute from total_impact_raw
    if "impact_score_0_100" not in impact.columns:
        raise ValueError("Expected column 'impact_score_0_100' missing in match_player_impact.csv")

    # Attach match dates if possible
    dates = load_match_dates_from_info(IPL_DIR)

    impact["match_id"] = impact["match_id"].astype(str)
    impact["player"] = impact["player"].astype(str)
    impact["impact_score_0_100"] = pd.to_numeric(impact["impact_score_0_100"], errors="coerce").fillna(50.0)

    if not dates.empty:
        dates["match_id"] = dates["match_id"].astype(str)
        impact = impact.merge(dates, on="match_id", how="left")
    else:
        impact["match_date"] = pd.NaT

    # Sort order: by date if available, else by match_id
    # Also ensure stable ordering inside same match_id
    has_dates = impact["match_date"].notna().any()
    if has_dates:
        impact = impact.sort_values(["player", "match_date", "match_id"], ascending=[True, True, True]).reset_index(drop=True)
    else:
        # fallback: match_id numeric sort
        impact["match_id_num"] = pd.to_numeric(impact["match_id"], errors="coerce")
        impact = impact.sort_values(["player", "match_id_num", "match_id"], ascending=[True, True, True]).reset_index(drop=True)

    player_team = load_player_teams_from_innings()

    # For each player: compute rolling last-10 recency weighted IM
    # We also produce a trend table with the last 10 match impacts.
    im_rows = []
    trend_rows = []

    for player, g in impact.groupby("player", sort=False):
        scores = g["impact_score_0_100"].to_numpy(dtype=float)
        match_ids = g["match_id"].to_numpy()

        # rolling: IM after each match
        rolling_im = []
        for i in range(len(scores)):
            start = max(0, i - LAST_N + 1)
            window = scores[start:i + 1]  # chronological old->new
            rolling_im.append(compute_weighted_last10(window))
        g = g.copy()
        g["rolling_im_last10"] = rolling_im

        # Final IM = last rolling value
        final_im = float(g["rolling_im_last10"].iloc[-1])
        last_match_id = str(g["match_id"].iloc[-1])

        im_rows.append({
            "player": player,
            "player_name": player,
            "impact_metric_last10": round(final_im, 2),
            "matches_available": int(len(g)),
            "last_match_id": last_match_id,
            "team": player_team.get(str(player).strip(), "Unknown"),
        })

        # Trend: keep last 10 matches for frontend chart
        tail = g.tail(LAST_N).copy()
        tail = tail[["player", "match_id", "impact_score_0_100", "rolling_im_last10"]]
        tail["rank_in_last10_old_to_new"] = range(1, len(tail) + 1)  # 1=oldest, N=newest
        trend_rows.append(tail)

    im_df = pd.DataFrame(im_rows).sort_values("impact_metric_last10", ascending=False).reset_index(drop=True)
    trend_df = pd.concat(trend_rows, ignore_index=True)

    im_df.to_csv(OUT_IM_PATH, index=False)
    trend_df.to_csv(OUT_TREND_PATH, index=False)

    print(f"Saved: {OUT_IM_PATH} shape={im_df.shape}")
    print(f"Saved: {OUT_TREND_PATH} shape={trend_df.shape}")

    print("\n--- Top 15 Players by Impact Metric ---")
    print(im_df.head(15).to_string(index=False))



if __name__ == "__main__":
    main()