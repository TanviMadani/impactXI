# BACKEND/app/core/datastore_mapping.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, Optional, Dict, Any, List
import re

import pandas as pd


# ----------------------------
# 0) Franchise name canonicalization (must match ML/team_utils.py)
# ----------------------------
TEAM_NAME_MAP = {
    "Rising Pune Supergiant": "Rising Pune Supergiants",
    "Rising Pune Supergiants": "Rising Pune Supergiants",
    "Kings XI Punjab": "Punjab Kings",
    "Punjab Kings": "Punjab Kings",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
    "Royal Challengers Bengaluru": "Royal Challengers Bengaluru",
    "Delhi Daredevils": "Delhi Capitals",
    "Delhi Capitals": "Delhi Capitals",
}


def normalize_team_name(x):
    if x is None:
        return x
    if pd.isna(x):
        return x
    s = str(x).strip()
    return TEAM_NAME_MAP.get(s, s)


# ----------------------------
# 1) Column inference helpers
# ----------------------------

def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(s).strip().lower()).strip("_")

def pick_col(df: pd.DataFrame, candidates: Iterable[str]) -> Optional[str]:
    """
    Return the first matching column from candidates (by normalized name),
    else None.
    """
    cols_map = {_norm(c): c for c in df.columns}
    for cand in candidates:
        key = _norm(cand)
        if key in cols_map:
            return cols_map[key]
    # try contains match
    for cand in candidates:
        key = _norm(cand)
        for k, original in cols_map.items():
            if key in k:
                return original
    return None

def ensure_player_id(df: pd.DataFrame, player_name_col: str, player_id_col: Optional[str] = None) -> pd.DataFrame:
    """
    Ensure df has an integer player_id column.
    If player_id_col exists use it; else create from factorize(player_name).
    """
    out = df.copy()
    if player_id_col and player_id_col in out.columns:
        out["player_id"] = pd.to_numeric(out[player_id_col], errors="coerce").fillna(-1).astype(int)
    else:
        out["player_id"] = pd.factorize(out[player_name_col].astype(str).fillna("UNKNOWN"))[0].astype(int) + 1
    return out

def band_from_score(score: float) -> str:
    # adjust thresholds if you want
    if pd.isna(score):
        return "Unknown"
    if score < 35:
        return "Low"
    if score < 65:
        return "Average"
    if score < 85:
        return "High"
    return "Elite"

def normalize_0_100(series: pd.Series) -> pd.Series:
    """
    If values already look like 0..100 keep them,
    else min-max scale into 0..100.
    """
    s = pd.to_numeric(series, errors="coerce")
    if s.dropna().empty:
        return s
    vmin, vmax = float(s.min()), float(s.max())
    if 0 <= vmin and vmax <= 100:
        return s
    if vmax == vmin:
        return pd.Series([50.0] * len(s), index=s.index)  # neutral if constant
    return (s - vmin) * (100.0 / (vmax - vmin))


# ----------------------------
# 2) Standard “datastore” frames
# ----------------------------

@dataclass
class DatastoreFrames:
    player_rolling: pd.DataFrame
    player_innings: pd.DataFrame
    match_index: pd.DataFrame


def build_player_rolling(player_metric_csv: str) -> pd.DataFrame:
    """
    Input: outputs_impact_metric/player_impact_metric.csv
    Output: player_rolling.parquet schema:
      player_id, player_name, team?, im_rolling_0_100, band, as_of_date?
    """
    df = pd.read_csv(player_metric_csv)

    name_col = pick_col(df, ["player_name", "player", "batter", "bowler", "name"])
    if not name_col:
        raise ValueError(f"Could not infer player name column in {player_metric_csv}. Columns: {list(df.columns)}")

    # Avoid "id" as candidate: pick_col's contains-match would select "match_id" as pid_col
    pid_col = pick_col(df, ["player_id", "pid"])

    # ML pipeline writes impact_metric_last10; prefer it so website matches ML output
    score_col = pick_col(df, [
        "impact_metric_last10", "im_rolling_0_100", "rolling_impact", "impact_rolling",
        "impact_score", "player_impact", "im_score", "im"
    ])
    if not score_col:
        # fallback: first numeric column that is not obviously an id or match_id
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        numeric_cols = [c for c in numeric_cols if "id" not in _norm(c) and "match" not in _norm(c)]
        if not numeric_cols:
            raise ValueError(f"Could not find a numeric impact column in {player_metric_csv}")
        score_col = numeric_cols[0]

    team_col = pick_col(df, ["team", "batting_team", "bowling_team", "franchise"])
    date_col = pick_col(df, ["as_of_date", "date", "computed_at", "updated_at"])
    matches_col = pick_col(df, ["matches_available", "matches", "match_count", "innings"])

    df = ensure_player_id(df, player_name_col=name_col, player_id_col=pid_col)

    out = pd.DataFrame({
        "player_id": df["player_id"].astype(int),
        "player_name": df[name_col].astype(str),
        "im_rolling_0_100": normalize_0_100(df[score_col]).astype(float),
    })

    if team_col:
        out["team"] = df[team_col].astype(str).apply(normalize_team_name)
    if date_col:
        out["as_of_date"] = df[date_col].astype(str)
    else:
        out["as_of_date"] = "NA"
    if matches_col:
        out["matches_available"] = pd.to_numeric(df[matches_col], errors="coerce").fillna(0).astype(int)
    else:
        out["matches_available"] = 0

    out["band"] = out["im_rolling_0_100"].apply(band_from_score)

    # Rank by impact then by experience (more matches = tiebreaker)
    out = out.sort_values(
        ["im_rolling_0_100", "matches_available", "player_name"],
        ascending=[False, False, True],
    ).reset_index(drop=True)
    return out


def build_player_innings(trend_last10_csv: str, player_id_map: Dict[str, int] | None = None) -> pd.DataFrame:
    """
    Input: outputs_impact_metric/player_impact_trend_last10.csv
    Output: player_innings.parquet schema:
      player_id, player_name, match_id?, date?, im_innings_0_100, inning_index
    This function supports both "long" (one row per innings) and "wide" (last10 columns).
    """
    df = pd.read_csv(trend_last10_csv)

    name_col = pick_col(df, ["player_name", "player", "batter", "bowler", "name"])
    if not name_col:
        raise ValueError(f"Could not infer player name column in {trend_last10_csv}")

    # Avoid "id" as candidate: pick_col's contains-match would select "match_id" as pid_col
    pid_col = pick_col(df, ["player_id", "pid"])

    match_col = pick_col(df, ["match_id", "mid"])
    date_col = pick_col(df, ["date", "match_date", "timestamp"])

    # Case A: already long format with a per-innings score
    score_long = pick_col(df, ["im_innings_0_100", "impact_score_0_100", "innings_impact", "impact", "im", "impact_score"])
    if score_long and (match_col or date_col):
        df = ensure_player_id(df, player_name_col=name_col, player_id_col=pid_col)
        out = pd.DataFrame({
            "player_id": df["player_id"].astype(int),
            "player_name": df[name_col].astype(str),
            "im_innings_0_100": normalize_0_100(df[score_long]).astype(float),
        })
        out["match_id"] = df[match_col].astype(str) if match_col else "NA"
        out["date"] = df[date_col].astype(str) if date_col else "NA"
        # Per-player inning index (1=oldest, N=newest) so API sort by inning_index desc = most recent first
        out["inning_index"] = out.groupby("player_id").cumcount() + 1
        return out

    # Case B: wide format: last10 columns like impact_1..impact_10 / last10_1.. / im1..im10 etc.
    wide_candidates = []
    for c in df.columns:
        cn = _norm(c)
        if re.match(r"(im|impact|score|val|v)_(\d+)$", cn) or re.match(r"(im|impact|score|val|v)(\d+)$", cn):
            wide_candidates.append(c)
        if "last10" in cn and any(ch.isdigit() for ch in cn):
            wide_candidates.append(c)

    # also accept columns that contain "t1..t10"
    if not wide_candidates:
        for c in df.columns:
            cn = _norm(c)
            if re.search(r"(last_?10|trend)", cn) and pd.api.types.is_numeric_dtype(df[c]):
                wide_candidates.append(c)

    if not wide_candidates:
        # final fallback: take top 10 numeric columns (excluding ids)
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c]) and "id" not in _norm(c)]
        wide_candidates = numeric_cols[:10]

    # sort wide columns by any trailing number
    def trailing_num(col: str) -> int:
        m = re.search(r"(\d+)\D*$", str(col))
        return int(m.group(1)) if m else 999

    wide_cols = sorted(set(wide_candidates), key=trailing_num)

    # build ids
    if pid_col and pid_col in df.columns:
        df["player_id"] = pd.to_numeric(df[pid_col], errors="coerce").fillna(-1).astype(int)
    else:
        if player_id_map:
            df["player_id"] = df[name_col].astype(str).map(player_id_map).fillna(-1).astype(int)
            missing = (df["player_id"] < 0).sum()
            if missing:
                # assign new ids for missing names
                new_ids = pd.factorize(df.loc[df["player_id"] < 0, name_col].astype(str))[0].astype(int) + (max(player_id_map.values()) + 1)
                df.loc[df["player_id"] < 0, "player_id"] = new_ids
        else:
            df["player_id"] = pd.factorize(df[name_col].astype(str).fillna("UNKNOWN"))[0].astype(int) + 1

    rows: List[Dict[str, Any]] = []
    for _, r in df.iterrows():
        pname = str(r[name_col])
        pid = int(r["player_id"])
        for i, c in enumerate(wide_cols[:10], start=1):
            rows.append({
                "player_id": pid,
                "player_name": pname,
                "match_id": "NA",
                "date": "NA",
                "inning_index": i,
                "im_innings_0_100": r.get(c, None),
            })

    out = pd.DataFrame(rows)
    out["im_innings_0_100"] = normalize_0_100(out["im_innings_0_100"]).astype(float)
    return out


def build_match_index(match_player_impact_csv: str, all_info_parquet: Optional[str] = None) -> pd.DataFrame:
    """
    Input: outputs_impact_metric/match_player_impact.csv
    Output: match_index.parquet schema:
      match_id, date?, team1?, team2?, top_players_json
    """
    df = pd.read_csv(match_player_impact_csv)

    match_col = pick_col(df, ["match_id", "mid"])
    if not match_col:
        raise ValueError(f"Could not infer match_id column in {match_player_impact_csv}")

    name_col = pick_col(df, ["player_name", "player", "batter", "bowler", "name"])
    score_col = pick_col(df, ["total_impact", "impact", "im_total_0_100", "im_0_100", "im", "score"])
    if not score_col:
        # fallback: first numeric column not id
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c]) and "id" not in _norm(c)]
        if not numeric_cols:
            raise ValueError(f"Could not find impact score column in {match_player_impact_csv}")
        score_col = numeric_cols[0]

    # group per match and pick top players
    df[score_col] = pd.to_numeric(df[score_col], errors="coerce")
    grouped = []
    for mid, g in df.groupby(match_col, sort=False):
        g2 = g.sort_values(score_col, ascending=False).head(5)
        top_players = []
        for _, rr in g2.iterrows():
            top_players.append({
                "player": str(rr.get(name_col, "NA")) if name_col else "NA",
                "impact": None if pd.isna(rr[score_col]) else float(rr[score_col]),
            })
        grouped.append({
            "match_id": str(mid),
            "top_players_json": top_players,
        })

    out = pd.DataFrame(grouped)

    # optional enrich with match meta
    if all_info_parquet:
        try:
            meta = pd.read_parquet(all_info_parquet)
            meta_mid = pick_col(meta, ["match_id", "mid"])
            if meta_mid:
                # pick some common meta cols
                date_col = pick_col(meta, ["date", "match_date", "start_date"])
                team1 = pick_col(meta, ["team1", "team_1", "home_team"])
                team2 = pick_col(meta, ["team2", "team_2", "away_team"])
                venue = pick_col(meta, ["venue", "ground", "stadium"])

                meta_small = pd.DataFrame({"match_id": meta[meta_mid].astype(str)})
                if date_col: meta_small["date"] = meta[date_col].astype(str)
                if team1: meta_small["team1"] = meta[team1].astype(str).apply(normalize_team_name)
                if team2: meta_small["team2"] = meta[team2].astype(str).apply(normalize_team_name)
                if venue: meta_small["venue"] = meta[venue].astype(str)

                out = out.merge(meta_small.drop_duplicates("match_id"), on="match_id", how="left")
        except Exception:
            # meta is optional; don't fail
            pass

    return out