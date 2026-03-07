from fastapi import APIRouter

from app.core import loader

router = APIRouter(prefix="/players", tags=["players"])


@router.get("")
def search_players(q: str = "", limit: int = 20):

    results = []

    for p in loader.player_index.values():

        if q.lower() in p["player_name"].lower():

            results.append({
                "playerId": p["player_id"],
                "name": p["player_name"],
                "team": p.get("team"),
                "currentIM": p["im_rolling_0_100"],
                "band": p.get("band"),
            })

        if len(results) >= limit:
            break

    return {"items": results, "count": len(results)}


@router.get("/{player_id}")
def player_summary(player_id: int):

    player = loader.player_index.get(player_id)

    if not player:
        return {"error": "Player not found"}

    return {
        "playerId": player["player_id"],
        "name": player["player_name"],
        "team": player.get("team"),
        "currentIM": player["im_rolling_0_100"],
        "baseline": 50,
        "band": player.get("band"),
        "asOfDate": player["as_of_date"]
    }


@router.get("/{player_id}/impact")
def player_impact(player_id: int, window: int = 10):

    rows = loader.innings_index.get(player_id, [])

    rows = sorted(rows, key=lambda x: x["date"], reverse=True)[:window]

    trend = [
        {"matchId": r["match_id"], "date": r["date"], "im": r["im_innings_0_100"]}
        for r in rows
    ]

    player = loader.player_index[player_id]

    return {
        "playerId": player_id,
        "currentIM": player["im_rolling_0_100"],
        "baseline": 50,
        "band": player.get("band"),
        "window": window,
        "trend": trend
    }


@router.get("/{player_id}/innings")
def player_innings(player_id: int, limit: int = 20):

    rows = loader.innings_index.get(player_id, [])

    rows = sorted(rows, key=lambda x: x["date"], reverse=True)[:limit]

    return {"playerId": player_id, "items": rows}