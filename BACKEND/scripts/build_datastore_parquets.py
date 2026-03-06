# BACKEND/scripts/build_datastore_parquets.py
from __future__ import annotations
import argparse
import os
import sys
import json
import pandas as pd

# Ensure BACKEND is on path so "import app" works when run from any directory
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BASE_DIR not in sys.path:
    sys.path.insert(0, _BASE_DIR)

from app.core.datastore_mapping import (
    build_player_rolling,
    build_player_innings,
    build_match_index,
)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ml_dir", required=True, help="Path to ML/outputs_impact_metric folder")
    parser.add_argument("--out_dir", default="data_store", help="Backend data_store output folder")
    args = parser.parse_args()

    ml_dir = args.ml_dir
    out_dir = args.out_dir
    os.makedirs(out_dir, exist_ok=True)

    # Required ML outputs (based on your screenshot)
    player_metric_csv = os.path.join(ml_dir, "player_impact_metric.csv")
    trend_last10_csv  = os.path.join(ml_dir, "player_impact_trend_last10.csv")
    match_impact_csv  = os.path.join(ml_dir, "match_player_impact.csv")

    # Optional meta file (you have it)
    all_info_parquet  = os.path.join(ml_dir, "all_info_combined.parquet")
    all_info_parquet  = all_info_parquet if os.path.exists(all_info_parquet) else None

    # Validate
    for fp in [player_metric_csv, trend_last10_csv, match_impact_csv]:
        if not os.path.exists(fp):
            raise FileNotFoundError(f"Missing required file: {fp}")

    print("Loading & building player_rolling...")
    player_rolling = build_player_rolling(player_metric_csv)

    # create name->id map so trend table uses same ids even if it lacks them
    player_id_map = dict(zip(player_rolling["player_name"].astype(str), player_rolling["player_id"].astype(int)))

    print("Loading & building player_innings (trend/last10)...")
    # build_player_innings supports long or wide formats
    player_innings = build_player_innings(trend_last10_csv, player_id_map=player_id_map)

    print("Loading & building match_index...")
    match_index = build_match_index(match_impact_csv, all_info_parquet=all_info_parquet)

    # Convert top_players_json to JSON string for Parquet friendliness (some backends prefer string)
    if "top_players_json" in match_index.columns:
        match_index["top_players_json"] = match_index["top_players_json"].apply(lambda x: json.dumps(x, ensure_ascii=False))

    # Save Parquets
    p1 = os.path.join(out_dir, "player_rolling.parquet")
    p2 = os.path.join(out_dir, "player_innings.parquet")
    p3 = os.path.join(out_dir, "match_index.parquet")

    player_rolling.to_parquet(p1, index=False)
    player_innings.to_parquet(p2, index=False)
    match_index.to_parquet(p3, index=False)

    print("\n✅ Saved datastore Parquets:")
    print(" -", p1, "rows:", len(player_rolling))
    print(" -", p2, "rows:", len(player_innings))
    print(" -", p3, "rows:", len(match_index))

if __name__ == "__main__":
    main()