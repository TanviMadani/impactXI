from pydantic import BaseModel


class Match(BaseModel):
    matchId: int
    teamA: str
    teamB: str
    winner: str | None
    venue: str
    date: str