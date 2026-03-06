from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.loader import load_data
from app.core.config import settings
from app.api import routes_players, routes_matches, routes_leaderboards, routes_admin, routes_ml

app = FastAPI(title="Cricket Impact Metric API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    load_data()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(routes_players.router)
app.include_router(routes_matches.router)
app.include_router(routes_leaderboards.router)
app.include_router(routes_admin.router)
app.include_router(routes_ml.router)