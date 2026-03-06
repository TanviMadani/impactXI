from fastapi import APIRouter, Header
from app.core.loader import load_data
from app.core.config import ADMIN_KEY

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/reload")
def reload_data(x_admin_key: str = Header(...)):

    if x_admin_key != ADMIN_KEY:
        return {"error": "Unauthorized"}

    load_data()

    return {"status": "reloaded"}