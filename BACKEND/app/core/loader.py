import polars as pl
from .config import PLAYER_ROLLING_FILE, PLAYER_INNINGS_FILE, MATCH_INDEX_FILE

player_rolling_df = None
player_innings_df = None
match_index_df = None

player_index = {}
innings_index = {}
match_index = {}


def load_data():

    global player_rolling_df, player_innings_df, match_index_df
    global player_index, innings_index, match_index

    player_rolling_df = pl.read_parquet(PLAYER_ROLLING_FILE)
    player_innings_df = pl.read_parquet(PLAYER_INNINGS_FILE)
    match_index_df = pl.read_parquet(MATCH_INDEX_FILE)

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
        for row in match_index_df.to_dicts()
    }