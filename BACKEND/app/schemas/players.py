from pydantic import BaseModel


class PlayerItem(BaseModel):
    playerId: int
    name: str
    team: str | None
    currentIM: float
    band: str


class PlayerSummary(BaseModel):
    playerId: int
    name: str
    team: str | None
    currentIM: float
    baseline: int
    band: str
    asOfDate: str