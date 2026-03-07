import polars as pl
from fastapi import APIRouter

from app.core import loader

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])


@router.get("/teams")
def list_teams():
    """Return team names; use team_player_master for squad counts when available."""
    if loader.team_player_master_df is not None:
        counts = (
            loader.team_player_master_df.group_by("team")
            .agg(pl.col("player").n_unique().alias("player_count"))
            .to_dicts()
        )
        return [
            {"name": row["team"], "playerCount": row["player_count"]}
            for row in sorted(counts, key=lambda x: x["team"])
        ]
    teams = set()
    for p in loader.player_index.values():
        t = p.get("team")
        if t is not None and str(t).strip() and str(t).strip().lower() not in ("nan", "unknown", ""):
            teams.add(str(t).strip())
    return [{"name": t, "playerCount": None} for t in sorted(teams)]


@router.get("/impact")
def impact_leaderboard(limit: int = 50):
    """
    Rank by impact first, then by matches_available (experience) as tiebreaker.
    """
    players = list(loader.player_index.values())
    # Sort: impact desc, then matches_available desc (experience), then name
    players = sorted(
        players,
        key=lambda x: (
            -(x.get("im_rolling_0_100") or 0),
            -(x.get("matches_available") or 0),
            (x.get("player_name") or ""),
        ),
    )
    players = players[:limit]

    return [
        {
            "playerId": p["player_id"],
            "name": p["player_name"],
            "team": p.get("team"),
            "im": p["im_rolling_0_100"],
            "band": p.get("band"),
            "matchesPlayed": p.get("matches_available"),
        }
        for p in players
    ]