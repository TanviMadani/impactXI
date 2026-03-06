from fastapi import APIRouter

from app.core import loader

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/{match_id}")
def match_details(match_id: int):

    match = loader.match_index.get(match_id)

    if not match:
        return {"error": "Match not found"}

    return match