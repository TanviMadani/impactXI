# Run ML pipeline with team data (then rebuild backend)

Run these from the project root (e.g. `IPL-Meter/`) unless stated otherwise.

---

## Part 1: Regenerate ML outputs (with teams)

All commands in this part are run from the **`ML/`** folder.

### Step 1 – Build innings tables (includes team columns)

```bash
cd ML
python build_tables.py
```

- Reads `ML/ipl/*.csv`, writes `outputs_impact_metric/batting_innings.csv` and `outputs_impact_metric/bowling_innings.csv` (with `batting_team` / `bowling_team`).

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

- Builds `data_store/player_rolling.parquet`, `player_innings.parquet`, `match_index.parquet` from the ML outputs (including the new `team` column).

---

## Part 3: Restart the backend

Stop the running backend (Ctrl+C if it’s in the terminal), then:

```bash
cd BACKEND
uvicorn app.main:app --reload --port 8000
```

- Backend loads the new `player_rolling.parquet`; the Players page team filter will list IPL teams from the data.
