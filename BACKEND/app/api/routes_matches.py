from fastapi import APIRouter
import json

from app.core import loader

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("")
def list_matches(limit: int = 50, offset: int = 0):
    """
    Returns available match IDs (and a tiny preview of top players when present).
    """
    items = []

    # Preserve a stable order.
    match_ids = sorted(loader.match_index.keys())
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
                            preview.append(
                                {
                                    "name": p.get("player") or p.get("name"),
                                    "impact": p.get("impact"),
                                }
                            )
            except Exception:
                preview = []

        items.append({"match_id": mid, "topPlayersPreview": preview})

    return {"items": items, "count": len(items), "total": len(match_ids), "limit": limit, "offset": offset}


@router.get("/{match_id}")
def match_details(match_id: int):

    match = loader.match_index.get(match_id)

    if not match:
        return {"error": "Match not found"}

    return match