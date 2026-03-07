# Run ML pipeline with team data (then rebuild backend)

Run these from the project root (e.g. `IPL-Meter/`) unless stated otherwise.

**Franchise names** are canonicalized everywhere (see `ML/team_utils.py`): e.g. "Rising Pune Supergiant" → "Rising Pune Supergiants", "Kings XI Punjab" → "Punjab Kings", "Delhi Daredevils" → "Delhi Capitals", "Royal Challengers Bangalore" → "Royal Challengers Bengaluru".

**Squad counts** use `team_player_master.csv` (all players who appeared for a franchise), not `player_impact_metric.csv`. The backend builds `team_player_master.parquet` when present and uses it for `/leaderboards/teams` player counts.

---

## Part 1: Regenerate ML outputs (with teams)

All commands in this part are run from the **`ML/`** folder.

### Step 1 – Build innings tables (includes team columns)

```bash
cd ML
python build_tables.py
```

- Reads `ML/ipl/*.csv`, canonicalizes team names, writes `outputs_impact_metric/batting_innings.csv`, `bowling_innings.csv`, and `team_player_master.csv` (with `batting_team` / `bowling_team`; master = all players who appeared for each franchise).

### Step 2 – Add ball and batting/bowling context

```bash
python add_context.py
```

- Writes `ball_context.csv`, `batting_context.csv`, `bowling_context.csv` in `outputs_impact_metric/`.

### Step 3 – Train XGBoost expected-run models

```bash
python train_expected_models_xgb.py
```

- Writes `batting_expected.csv`, `bowling_expected.csv` and model JSONs in `outputs_impact_metric/models/`.

### Step 4 – Compute per-match impact

```bash
python compute_match_impact.py
```

- Writes `outputs_impact_metric/match_player_impact.csv`.

### Step 5 – Rolling last 10 + team column

```bash
python rolling_last10_impact.py
```

- Reads `batting_innings.csv` and `bowling_innings.csv` from Step 1, assigns each player a team.
- Writes `player_impact_metric.csv` (with `team`) and `player_impact_trend_last10.csv`.

---

## Part 2: Rebuild backend parquets

Run from the **`BACKEND/`** folder.

```bash
cd BACKEND
python scripts/build_datastore_parquets.py --ml_dir ../ML/outputs_impact_metric --out_dir data_store
```

- Builds `data_store/player_rolling.parquet`, `player_innings.parquet`, `match_index.parquet`, and (if present) `team_player_master.parquet` from the ML outputs. Squad counts in `/leaderboards/teams` use `team_player_master` when available.

---

## Part 3: Restart the backend

Stop the running backend (Ctrl+C if it’s in the terminal), then:

```bash
cd BACKEND
uvicorn app.main:app --reload --port 8000
```

- Backend loads the new `player_rolling.parquet`; the Players page team filter will list IPL teams from the data.

---

## If the website shows different data than the ML output

The website reads from **backend parquets**, not directly from the ML CSV files. If you re-ran the ML pipeline (e.g. new “Top 15” in the terminal) but the site still shows old names/teams/scores:

1. **Rebuild parquets** (Part 2): from `BACKEND/` run  
   `python scripts/build_datastore_parquets.py --ml_dir ../ML/outputs_impact_metric --out_dir data_store`
2. **Restart the backend** (Part 3): stop the server (Ctrl+C), then start it again with `uvicorn app.main:app --reload --port 8000`

The backend uses `player_rolling.parquet` (built from `player_impact_metric.csv`) and maps the column `impact_metric_last10` to the impact score shown on the site. Until parquets are rebuilt and the server restarted, the site will keep showing the previous data.
