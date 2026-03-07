from fastapi import APIRouter
import json

from app.core import loader

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("")
def list_matches(limit: int = 50, offset: int = 0):
    """
    Returns available match IDs (unique per match). Use these IDs to fetch full match details.
    """
    items = []
    match_ids = sorted(loader.match_index.keys(), key=lambda x: (x if isinstance(x, (int, float)) else 0))
    window = match_ids[offset : offset + limit]

    for mid in window:
        match = loader.match_index.get(mid) or {}
        preview = []
        raw = match.get("top_players_json")
        if isinstance(raw, str) and raw:
            try:
                arr = json.loads(raw)
                if isinstance(arr, list):
                    for p in arr[:3]:
                        if isinstance(p, dict):
                            preview.append({
                                "name": p.get("player") or p.get("name"),
                                "impact": p.get("impact"),
                            })
            except Exception:
                preview = []
        try:
            mid_int = int(mid)
        except (TypeError, ValueError):
            mid_int = mid
        items.append({"match_id": mid_int, "topPlayersPreview": preview})

    return {"items": items, "count": len(items), "total": len(match_ids), "limit": limit, "offset": offset}


@router.get("/{match_id}")
def match_details(match_id: int):
    """
    Full match result: teams, player performance (scorecard), top players, result.
    """
    match = loader.match_index.get(match_id)

    if not match:
        return {"error": "Match not found"}

    out = dict(match)
    # Ensure match_id in response is int
    out["match_id"] = match_id

    # Attach scorecard if available (batting: runs, balls, strike_rate; bowling: wickets, runs_conceded, economy)
    card = loader.scorecard_by_match.get(match_id, {})
    out["batting_card"] = card.get("batting", [])
    out["bowling_card"] = card.get("bowling", [])

    # Parse top_players_json for convenience if it's a string
    raw = out.get("top_players_json")
    if isinstance(raw, str) and raw:
        try:
            out["top_players"] = json.loads(raw)
        except Exception:
            out["top_players"] = []
    else:
        out["top_players"] = raw if isinstance(raw, list) else []

    return out