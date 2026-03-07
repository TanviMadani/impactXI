# ML/team_utils.py
# ------------------------------------------------------------
# Single source of truth for franchise name canonicalization.
# Use normalize_team_name() before any grouping, merging, leaderboard, or datastore export.
# ------------------------------------------------------------

import pandas as pd

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
