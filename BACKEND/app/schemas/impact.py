from pydantic import BaseModel


class ImpactTrendItem(BaseModel):
    matchId: int
    date: str
    im: float


class ImpactTrend(BaseModel):
    playerId: int
    currentIM: float
    baseline: int
    band: str
    window: int
    trend: list[ImpactTrendItem]