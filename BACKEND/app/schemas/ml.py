from pydantic import BaseModel


class BattingContext(BaseModel):
    balls: int
    entry_score: float
    entry_wkts: int
    entry_balls_remaining: int
    entry_required_rr: float
    balls_pp: int
    balls_middle: int
    balls_death: int
    pressure_proxy: float
    fours: int
    sixes: int
    innings: int


class BattingExpectedResponse(BaseModel):
    expectedRuns: float

