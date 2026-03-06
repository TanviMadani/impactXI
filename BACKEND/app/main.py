from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.loader import load_data
from app.api import routes_players, routes_matches, routes_leaderboards, routes_admin, routes_ml

app = FastAPI(title="Cricket Impact Metric API")

# Allow frontend (Vite dev server) to call this API
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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