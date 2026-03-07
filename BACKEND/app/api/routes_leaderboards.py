from fastapi import APIRouter

from app.core import loader

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])


@router.get("/teams")
def list_teams():
    """Return all unique team names from the player datastore (from ML pipeline)."""
    teams = set()
    for p in loader.player_index.values():
        t = p.get("team")
        if t is not None and str(t).strip() and str(t).strip().lower() not in ("nan", "unknown", ""):
            teams.add(str(t).strip())
    return sorted(teams)


@router.get("/impact")
def impact_leaderboard(limit: int = 50):

    players = list(loader.player_index.values())

    players = sorted(players, key=lambda x: x["im_rolling_0_100"], reverse=True)

    players = players[:limit]

    return [
        {
            "playerId": p["player_id"],
            "name": p["player_name"],
            "team": p.get("team"),
            "im": p["im_rolling_0_100"],
            "band": p.get("band"),
        }
        for p in players
    ]