from fastapi import APIRouter

from app.core import loader

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])


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
            "im": p["im_rolling_0_100"]
        }
        for p in players
    ]