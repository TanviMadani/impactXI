import polars as pl
from .config import settings

player_rolling_df = None
player_innings_df = None
match_index_df = None
team_player_master_df = None
match_batting_card_df = None
match_bowling_card_df = None

player_index = {}
innings_index = {}
match_index = {}
scorecard_by_match = {}


def load_data():

    global player_rolling_df, player_innings_df, match_index_df, team_player_master_df
    global match_batting_card_df, match_bowling_card_df
    global player_index, innings_index, match_index, scorecard_by_match

    player_rolling_df = pl.read_parquet(settings.PLAYER_ROLLING_FILE)
    # Normalize ID types to avoid string/int mismatches across the API.
    player_innings_df = (
        pl.read_parquet(settings.PLAYER_INNINGS_FILE)
        .with_columns(pl.col("match_id").cast(pl.Int64, strict=False))
    )
    match_index_df = (
        pl.read_parquet(settings.MATCH_INDEX_FILE)
        .with_columns(pl.col("match_id").cast(pl.Int64, strict=False))
    )

    player_index = {
        row["player_id"]: row
        for row in player_rolling_df.to_dicts()
    }

    innings_index = {}

    for row in player_innings_df.to_dicts():

        pid = row["player_id"]

        if pid not in innings_index:
            innings_index[pid] = []

        innings_index[pid].append(row)

    match_index = {}
    for row in match_index_df.drop_nulls("match_id").to_dicts():
        mid = row["match_id"]
        if mid is not None:
            try:
                match_index[int(mid)] = row
            except (TypeError, ValueError):
                match_index[mid] = row

    scorecard_by_match = {}
    if settings.MATCH_BATTING_CARD_FILE.exists() and settings.MATCH_BOWLING_CARD_FILE.exists():
        match_batting_card_df = pl.read_parquet(settings.MATCH_BATTING_CARD_FILE)
        match_bowling_card_df = pl.read_parquet(settings.MATCH_BOWLING_CARD_FILE)
        for row in match_batting_card_df.to_dicts():
            mid = row.get("match_id")
            if mid is not None:
                try:
                    mid = int(mid)
                except (TypeError, ValueError):
                    pass
                if mid not in scorecard_by_match:
                    scorecard_by_match[mid] = {"batting": [], "bowling": []}
                scorecard_by_match[mid]["batting"].append(row)
        for row in match_bowling_card_df.to_dicts():
            mid = row.get("match_id")
            if mid is not None:
                try:
                    mid = int(mid)
                except (TypeError, ValueError):
                    pass
                if mid not in scorecard_by_match:
                    scorecard_by_match[mid] = {"batting": [], "bowling": []}
                scorecard_by_match[mid]["bowling"].append(row)
    else:
        match_batting_card_df = None
        match_bowling_card_df = None

    if settings.TEAM_PLAYER_MASTER_FILE.exists():
        team_player_master_df = pl.read_parquet(settings.TEAM_PLAYER_MASTER_FILE)
    else:
        team_player_master_df = None