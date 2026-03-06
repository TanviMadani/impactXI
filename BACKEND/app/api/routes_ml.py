from fastapi import APIRouter

from app.core import ml_models
from app.schemas.ml import BattingContext, BattingExpectedResponse

router = APIRouter(prefix="/ml", tags=["ml"])


@router.post("/batting-expected", response_model=BattingExpectedResponse)
def batting_expected(body: BattingContext) -> BattingExpectedResponse:
    expected = ml_models.predict_batting_expected(body.model_dump())
    return BattingExpectedResponse(expectedRuns=expected)

