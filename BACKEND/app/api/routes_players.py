from fastapi import APIRouter

from app.core import loader
from app.core.form_utils import batting_form_from_scores

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
                "matchesPlayed": p.get("matches_available"),
            })

        if len(results) >= limit:
            break

    return {"items": results, "count": len(results)}


def _player_form(player_id: int) -> str:
    """Compute form category from last 10 innings impact scores."""
    rows = loader.innings_index.get(player_id, [])
    rows = sorted(rows, key=lambda x: (x.get("inning_index") or 0), reverse=True)[:10]
    scores = []
    for r in rows:
        im = r.get("im_innings_0_100")
        if im is not None:
            try:
                scores.append(float(im))
            except (TypeError, ValueError):
                pass
    return batting_form_from_scores(scores)


@router.get("/{player_id}")
def player_summary(player_id: int):

    player = loader.player_index.get(player_id)

    if not player:
        return {"error": "Player not found"}

    form = _player_form(player_id)

    return {
        "playerId": player["player_id"],
        "name": player["player_name"],
        "team": player.get("team"),
        "currentIM": player["im_rolling_0_100"],
        "baseline": 50,
        "band": player.get("band"),
        "asOfDate": player["as_of_date"],
        "matchesPlayed": player.get("matches_available"),
        "form": form,
    }


@router.get("/{player_id}/impact")
def player_impact(player_id: int, window: int = 10):

    rows = loader.innings_index.get(player_id, [])
    # Sort by inning_index desc (most recent first) or date
    rows = sorted(
        rows,
        key=lambda x: (x.get("inning_index") or 0, x.get("date") or ""),
        reverse=True,
    )[:window]

    trend = []
    for r in rows:
        mid = r.get("match_id")
        if mid is not None:
            try:
                mid = int(mid)
            except (TypeError, ValueError):
                pass
        trend.append({
            "matchId": mid,
            "date": r.get("date"),
            "im": r.get("im_innings_0_100"),
        })

    player = loader.player_index.get(player_id)
    form = _player_form(player_id)

    return {
        "playerId": player_id,
        "currentIM": player["im_rolling_0_100"] if player else None,
        "baseline": 50,
        "band": player.get("band") if player else None,
        "window": window,
        "trend": trend,
        "form": form,
    }


@router.get("/{player_id}/matches")
def player_matches(player_id: int):
    """
    Return list of matches this player played (from trend/innings).
    Each match has a unique match_id that exists in the matches table.
    """
    rows = loader.innings_index.get(player_id, [])
    seen = set()
    items = []
    for r in sorted(
        rows,
        key=lambda x: (x.get("inning_index") or 0, x.get("date") or ""),
        reverse=True,
    ):
        mid = r.get("match_id")
        if mid is None or mid == "NA" or mid in seen:
            continue
        seen.add(mid)
        try:
            mid_int = int(mid)
        except (TypeError, ValueError):
            mid_int = mid
        items.append({
            "matchId": mid_int,
            "date": r.get("date"),
            "im": r.get("im_innings_0_100"),
        })
    return {"playerId": player_id, "items": items}


@router.get("/{player_id}/innings")
def player_innings(player_id: int, limit: int = 20):

    rows = loader.innings_index.get(player_id, [])
    rows = sorted(
        rows,
        key=lambda x: (x.get("inning_index") or 0, x.get("date") or ""),
        reverse=True,
    )[:limit]

    # Normalize match_id to int for consistency with matches API
    out = []
    for r in rows:
        r = dict(r)
        mid = r.get("match_id")
        if mid is not None and mid != "NA":
            try:
                r["match_id"] = int(mid)
            except (TypeError, ValueError):
                pass
        out.append(r)

    return {"playerId": player_id, "items": out}