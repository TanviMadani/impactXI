import os
import glob
import pandas as pd
from typing import List, Tuple, Optional


# ---------------------------
# Config
# ---------------------------
DATA_DIR = "./ipl"                 # folder where csvs are present
OUT_DIR = "./outputs_impact_metric"


# ---------------------------
# Helpers
# ---------------------------
def ensure_outdir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def coalesce_cols(df: pd.DataFrame, candidates: List[str], fill_value=0) -> pd.Series:
    """Pick the first existing column from candidates, else return fill_value series."""
    for c in candidates:
        if c in df.columns:
            return df[c]
    return pd.Series([fill_value] * len(df), index=df.index)


def _show_suspect_lines(path: str, line_no: int = 22, context: int = 2) -> None:
    """Print a few lines around the suspect line number (1-based)."""
    try:
        start = max(1, line_no - context)
        end = line_no + context
        print(f"\n--- Showing lines {start} to {end} from: {path} ---")
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for i, line in enumerate(f, start=1):
                if start <= i <= end:
                    print(f"Line {i}: {line.rstrip()}")
                if i > end:
                    break
        print("--- End lines ---\n")
    except Exception as e:
        print("Could not display suspect lines:", repr(e))


def safe_read_csv(path: str, verbose: bool = False) -> pd.DataFrame:
    """
    Robust CSV reader to handle:
    - Bad quoting / stray commas (ParserError)
    - Mixed encodings
    - Occasional corrupt rows

    Strategy:
      1) normal read_csv (fast C engine)
      2) python engine
      3) python engine + on_bad_lines='warn' (skip bad rows)
    """
    encodings_to_try = ["utf-8", "utf-8-sig", "cp1252", "latin1"]

    last_err: Optional[Exception] = None

    for enc in encodings_to_try:
        # Attempt 1: fast engine
        try:
            return pd.read_csv(path, encoding=enc)
        except pd.errors.ParserError as e:
            last_err = e
            if verbose:
                print(f"⚠️ ParserError (fast engine) for {path} with encoding={enc}: {e}")
        except UnicodeDecodeError as e:
            last_err = e
            if verbose:
                print(f"⚠️ UnicodeDecodeError for {path} with encoding={enc}: {e}")
        except Exception as e:
            last_err = e
            if verbose:
                print(f"⚠️ Other read error (fast engine) for {path} with encoding={enc}: {repr(e)}")

        # Attempt 2: python engine (more tolerant)
        try:
            return pd.read_csv(path, encoding=enc, engine="python")
        except pd.errors.ParserError as e:
            last_err = e
            if verbose:
                print(f"⚠️ ParserError (python engine) for {path} with encoding={enc}: {e}")
        except UnicodeDecodeError as e:
            last_err = e
            if verbose:
                print(f"⚠️ UnicodeDecodeError (python engine) for {path} with encoding={enc}: {e}")
        except Exception as e:
            last_err = e
            if verbose:
                print(f"⚠️ Other read error (python engine) for {path} with encoding={enc}: {repr(e)}")

        # Attempt 3: python engine + skip bad lines (keeps pipeline running)
        try:
            if verbose:
                print(f"⚠️ Falling back to on_bad_lines='warn' for {path} with encoding={enc}")
            return pd.read_csv(path, encoding=enc, engine="python", on_bad_lines="warn")
        except Exception as e:
            last_err = e
            if verbose:
                print(f"⚠️ Still failed on_bad_lines for {path} with encoding={enc}: {repr(e)}")

    # If everything failed, raise with context
    print(f"\n❌ Failed to read CSV after all fallbacks: {path}")
    if isinstance(last_err, pd.errors.ParserError):
        _show_suspect_lines(path, line_no=22, context=3)
    raise last_err if last_err else RuntimeError("Unknown error while reading CSV.")


# ---------------------------
# Step 1: Load from folder
# ---------------------------
def load_folder_to_dataframes(data_dir: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Reads:
      - match ball files: *.csv excluding *_info.csv
      - info files: *_info.csv
    Returns:
      balls_df, info_df
    """
    if not os.path.isdir(data_dir):
        raise FileNotFoundError(f"DATA_DIR not found: {data_dir}")

    all_csv = glob.glob(os.path.join(data_dir, "*.csv"))
    if not all_csv:
        raise FileNotFoundError(f"No CSV files found inside: {data_dir}")

    match_csvs = [p for p in all_csv if not p.lower().endswith("_info.csv")]
    info_csvs  = [p for p in all_csv if p.lower().endswith("_info.csv")]

    print(f"Found CSV files total: {len(all_csv)}")
    print(f"Match ball-by-ball CSVs: {len(match_csvs)}")
    print(f"Match info CSVs: {len(info_csvs)}")

    balls_parts = []
    info_parts = []

    bad_files = []

    # ---- Load match CSVs
    for i, path in enumerate(match_csvs, 1):
        match_id = os.path.splitext(os.path.basename(path))[0]  # filename without .csv
        try:
            df = safe_read_csv(path, verbose=False)
            df["match_id"] = str(match_id)
            balls_parts.append(df)
        except Exception as e:
            print(f"\n❌ Skipping bad match CSV: {path}")
            print("Reason:", repr(e))
            bad_files.append(path)

        if i % 200 == 0:
            print(f"Loaded {i}/{len(match_csvs)} match CSVs...")

    # ---- Load info CSVs (optional)
    for i, path in enumerate(info_csvs, 1):
        match_id = os.path.basename(path).replace("_info.csv", "")
        try:
            df = safe_read_csv(path, verbose=False)
            df["match_id"] = str(match_id)
            info_parts.append(df)
        except Exception as e:
            print(f"\n❌ Skipping bad info CSV: {path}")
            print("Reason:", repr(e))
            bad_files.append(path)

        if i % 200 == 0:
            print(f"Loaded {i}/{len(info_csvs)} info CSVs...")

    balls_df = pd.concat(balls_parts, ignore_index=True) if balls_parts else pd.DataFrame()
    info_df = pd.concat(info_parts, ignore_index=True) if info_parts else pd.DataFrame()

    print("---- Loaded combined shapes ----")
    print("balls_df:", balls_df.shape)
    print("info_df :", info_df.shape)

    if bad_files:
        print(f"\n⚠️ Total bad files skipped: {len(bad_files)}")
        # Print first few only to avoid spam
        for p in bad_files[:10]:
            print(" -", p)
        if len(bad_files) > 10:
            print(" - ...")

        # Save list
        ensure_outdir(OUT_DIR)
        with open(os.path.join(OUT_DIR, "bad_files_skipped.txt"), "w", encoding="utf-8") as f:
            for p in bad_files:
                f.write(p + "\n")
        print(f"Saved skipped file list to: {os.path.join(OUT_DIR, 'bad_files_skipped.txt')}")

    return balls_df, info_df


# ---------------------------
# Step 2: Build innings tables
# ---------------------------
def build_batting_innings_table(balls_df: pd.DataFrame) -> pd.DataFrame:
    df = balls_df.copy()

    batter_col = "striker" if "striker" in df.columns else ("batter" if "batter" in df.columns else None)
    if batter_col is None:
        raise ValueError("No batter column found. Expected 'striker' or 'batter'.")
    if "innings" not in df.columns:
        raise ValueError("No 'innings' column found.")

    # Runs off bat
    runs_off_bat = coalesce_cols(df, ["runs_off_bat", "batter_runs", "runs_batter"], fill_value=0).fillna(0).astype(int)

    # Wides -> for balls faced
    wides = coalesce_cols(df, ["wides", "wide"], fill_value=0).fillna(0).astype(float)
    is_wide = wides > 0

    # Outs (striker only)
    player_dismissed = None
    if "player_dismissed" in df.columns:
        player_dismissed = df["player_dismissed"].astype(str)
    elif "wicket_player_out" in df.columns:
        player_dismissed = df["wicket_player_out"].astype(str)

    wicket_flag = pd.Series([0] * len(df), index=df.index)
    if player_dismissed is not None:
        wicket_flag = (player_dismissed == df[batter_col].astype(str)).astype(int)

    batting_team = df["batting_team"] if "batting_team" in df.columns else pd.Series([None] * len(df), index=df.index)

    df_tmp = pd.DataFrame({
        "match_id": df["match_id"].astype(str),
        "innings": df["innings"],
        "batter": df[batter_col].astype(str),
        "batting_team": batting_team.astype(str),
        "runs_off_bat": runs_off_bat,
        "is_wide": is_wide.astype(int),
        "wicket": wicket_flag.astype(int),
    })

    grouped = df_tmp.groupby(["match_id", "innings", "batter"], as_index=False).agg(
        batting_team=("batting_team", "first"),
        runs=("runs_off_bat", "sum"),
        balls=("is_wide", lambda x: int((x == 0).sum())),     # exclude wides
        fours=("runs_off_bat", lambda x: int((x == 4).sum())),
        sixes=("runs_off_bat", lambda x: int((x == 6).sum())),
        outs=("wicket", "max"),
    )

    grouped["strike_rate"] = grouped.apply(
        lambda r: (r["runs"] / r["balls"] * 100.0) if r["balls"] > 0 else 0.0, axis=1
    )

    grouped = grouped.sort_values(["match_id", "innings", "runs"], ascending=[True, True, False]).reset_index(drop=True)
    return grouped


def build_bowling_innings_table(balls_df: pd.DataFrame) -> pd.DataFrame:
    df = balls_df.copy()

    if "innings" not in df.columns:
        raise ValueError("No 'innings' column found.")
    if "bowler" not in df.columns:
        raise ValueError("No 'bowler' column found.")

    runs_off_bat = coalesce_cols(df, ["runs_off_bat", "batter_runs", "runs_batter"], fill_value=0).fillna(0).astype(int)
    extras = coalesce_cols(df, ["extras", "total_extras"], fill_value=0).fillna(0).astype(int)

    byes = coalesce_cols(df, ["byes"], fill_value=0).fillna(0).astype(int)
    legbyes = coalesce_cols(df, ["legbyes"], fill_value=0).fillna(0).astype(int)

    wides = coalesce_cols(df, ["wides", "wide"], fill_value=0).fillna(0).astype(float)
    noballs = coalesce_cols(df, ["noballs", "noball"], fill_value=0).fillna(0).astype(float)

    # Legal balls exclude wides and no-balls
    is_legal = ((wides <= 0) & (noballs <= 0)).astype(int)

    # Wickets credited to bowler (exclude run out etc.)
    wicket_type = df["wicket_type"].astype(str).str.lower() if "wicket_type" in df.columns else pd.Series([""] * len(df))
    wicket_any = (wicket_type != "") & (wicket_type != "nan")
    bowler_wicket = wicket_any & (~wicket_type.isin(["run out", "retired hurt", "obstructing the field"]))

    # Runs conceded to bowler (exclude byes/legbyes)
    runs_conceded = (runs_off_bat + extras - byes - legbyes).clip(lower=0)

    bowling_team = coalesce_cols(df, ["bowling_team", "bowling_team_name"], fill_value="").astype(str)

    df_tmp = pd.DataFrame({
        "match_id": df["match_id"].astype(str),
        "innings": df["innings"],
        "bowler": df["bowler"].astype(str),
        "bowling_team": bowling_team,
        "runs_conceded": runs_conceded.astype(int),
        "legal_ball": is_legal.astype(int),
        "wicket_bowler": bowler_wicket.astype(int),
        "dot_ball": ((runs_off_bat == 0) & (extras == 0) & (is_legal == 1)).astype(int),
        "wides": wides.astype(int),
        "noballs": noballs.astype(int),
    })

    grouped = df_tmp.groupby(["match_id", "innings", "bowler"], as_index=False).agg(
        runs_conceded=("runs_conceded", "sum"),
        balls=("legal_ball", "sum"),
        wickets=("wicket_bowler", "sum"),
        dot_balls=("dot_ball", "sum"),
        wides=("wides", "sum"),
        noballs=("noballs", "sum"),
        bowling_team=("bowling_team", "first"),
    )

    grouped["overs"] = grouped["balls"] / 6.0
    grouped["economy"] = grouped.apply(
        lambda r: (r["runs_conceded"] / r["overs"]) if r["overs"] > 0 else 0.0, axis=1
    )

    grouped = grouped.sort_values(
        ["match_id", "innings", "wickets", "economy"],
        ascending=[True, True, False, True]
    ).reset_index(drop=True)

    return grouped


def main():
    ensure_outdir(OUT_DIR)

    # STEP 1
    balls_df, info_df = load_folder_to_dataframes(DATA_DIR)

    if balls_df.empty:
        raise RuntimeError("balls_df is empty. All match CSVs failed to load or no match CSVs found.")

    # --- FIX for Parquet: force season to string (because values like "2020/21" exist)
    if "season" in balls_df.columns:
        balls_df["season"] = balls_df["season"].astype(str)

    if not info_df.empty and "season" in info_df.columns:
        info_df["season"] = info_df["season"].astype(str)
        # Save combined (optional but useful)
        balls_df.to_parquet(os.path.join(OUT_DIR, "all_balls_combined.parquet"), index=False)
    if not info_df.empty:
        info_df.to_parquet(os.path.join(OUT_DIR, "all_info_combined.parquet"), index=False)

    # STEP 2
    batting_innings = build_batting_innings_table(balls_df)
    bowling_innings = build_bowling_innings_table(balls_df)

    batting_innings.to_csv(os.path.join(OUT_DIR, "batting_innings.csv"), index=False)
    bowling_innings.to_csv(os.path.join(OUT_DIR, "bowling_innings.csv"), index=False)

    print("\n✅ Done!")
    print("Saved:", os.path.join(OUT_DIR, "batting_innings.csv"), batting_innings.shape)
    print("Saved:", os.path.join(OUT_DIR, "bowling_innings.csv"), bowling_innings.shape)

    print("\n--- Batting sample ---")
    print(batting_innings.head(10).to_string(index=False))

    print("\n--- Bowling sample ---")
    print(bowling_innings.head(10).to_string(index=False))


if __name__ == "__main__":
    main()