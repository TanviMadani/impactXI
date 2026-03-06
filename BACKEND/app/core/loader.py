import polars as pl
from .config import settings

player_rolling_df = None
player_innings_df = None
match_index_df = None

player_index = {}
innings_index = {}
match_index = {}


def load_data():

    global player_rolling_df, player_innings_df, match_index_df
    global player_index, innings_index, match_index

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

    match_index = {
        row["match_id"]: row
        for row in match_index_df.drop_nulls("match_id").to_dicts()
    }