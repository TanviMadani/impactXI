# IPL-Meter

A full-stack application that computes and displays an **Impact Metric** for IPL (Indian Premier League) cricket players. The metric combines batting and bowling performance with match context and pressure, normalized to a 0–100 scale (50 = neutral). The system includes an ML pipeline, a REST API, and a React frontend for leaderboards, player profiles, and match impact views.

**Demo:** [Live demo](https://impact-xi-bay.vercel.app/)


---

## About the Project

**IPL-Meter** answers: *How much did a player contribute in context?* Rather than raw runs or wickets alone, it uses:

- **Expected runs/wickets** from XGBoost models (trained on ball-level context: phase, pressure, entry conditions).
- **Residual impact** (actual − expected), then pressure-weighted (e.g. death overs, chases count more).
- **Normalization** to 0–100 via median/MAD so a few outliers don’t distort the scale (50 = neutral).
- **Recency** via a rolling last-10-innings average (weights 0.1 → 1.0 from oldest to newest).

Outputs include a **player Impact Meter** (current score and band: poor / below_avg / neutral / good / elite), **last 10 innings trend**, **per-match impact**, and **team leaderboards**. The app is built for IPL ball-by-ball data (e.g. Cricsheet-style CSVs in `ML/ipl/`).

### Project structure

| Folder / file        | Description |
|----------------------|-------------|
| **ML/**               | Python pipeline: build tables → add context → train XGBoost → compute match impact → rolling last 10. Reads `ipl/*.csv`, writes `outputs_impact_metric/*.csv`. |
| **BACKEND/**          | FastAPI app. Loads parquets from `data_store/`, serves `/players`, `/leaderboards`, `/matches`, etc. |
| **cric-frontend/**    | React (Vite) UI: leaderboard, players, player detail, matches, methodology. |
| **ML/RUN_PIPELINE_WITH_TEAMS.md** | Step-by-step ML run + parquet rebuild + backend restart. |

---

## Prerequisites

- **Python 3.10+** (for backend and ML)
- **Node.js 18+** and **npm** (for frontend)
- IPL ball-by-ball data in **ML/ipl/** (e.g. `*.csv` and optional `*_info.csv` for match dates)

---

## Dependencies

### Backend (`BACKEND/`)

- **fastapi**, **uvicorn** – API server  
- **polars**, **pyarrow** – parquet read  
- **pandas**, **numpy** – used by scripts  
- **pydantic**, **python-multipart**, **aiofiles** – request/response  
- **xgboost**, **scikit-learn**, **joblib** – optional model inference  
- **cachetools** – caching  

See `BACKEND/requirements.txt` for the full list.

### Frontend (`cric-frontend/`)

- **React 19**, **react-router** – UI and routing  
- **Vite** – build and dev server  
- **Tailwind CSS**, **Radix UI**, **lucide-react**, **motion** – layout and components  
- **recharts** – trend and comparison charts  

See `cric-frontend/package.json` for versions.

### ML (`ML/`)

- **pandas**, **numpy** – data handling  
- **scikit-learn** – train/test split, metrics  
- **xgboost** – expected runs/wickets models  

No separate `requirements.txt` in ML; use the backend env or a venv with the same stack.

---

## Installation

### 1. Clone and enter the project

```bash
git clone <repository-url>
cd IPL-Meter
```

### 2. Backend

```bash
cd BACKEND
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Frontend

```bash
cd cric-frontend
npm install
cd ..
```

### 4. ML (same Python as backend or a dedicated venv)

Use the backend venv or create one and install backend-style deps (pandas, numpy, scikit-learn, xgboost). No extra install step beyond that.

---

## Execution Instructions

### Quick run (backend + frontend only)

If you already have parquets in `BACKEND/data_store/` (e.g. from a previous ML run):

1. **Start the API**

   ```bash
   cd BACKEND
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start the frontend** (new terminal)

   ```bash
   cd cric-frontend
   npm run dev
   ```

3. Open the URL shown by Vite (e.g. `http://localhost:5173`). The app will call the API at `http://localhost:8000` by default.

### Full run (ML → parquets → backend → frontend)

To regenerate metrics from raw IPL data and then run the app:

1. **Run the ML pipeline** (from project root, all steps from `ML/`):

   ```bash
   cd ML
   python build_tables.py
   python add_context.py
   python train_expected_models_xgb.py
   python compute_match_impact.py
   python rolling_last10_impact.py
   cd ..
   ```

   This produces `ML/outputs_impact_metric/*.csv` (e.g. `player_impact_metric.csv`, `player_impact_trend_last10.csv`, `match_player_impact.csv`).

2. **Build backend parquets**

   ```bash
   cd BACKEND
   python scripts/build_datastore_parquets.py --ml_dir ../ML/outputs_impact_metric --out_dir data_store
   cd ..
   ```

   After this, **restart the backend** (or call `POST /admin/reload` with header `X-Admin-Key: <your ADMIN_KEY>`) so the API loads the new data.

3. **Start backend and frontend** (same as “Quick run” above).

Detailed ML steps and franchise name canonicalization are in **ML/RUN_PIPELINE_WITH_TEAMS.md**.

### Environment (optional)

- **Backend**
  - `DATA_STORE_DIR` – directory containing `player_rolling.parquet`, etc. (default: `BACKEND/data_store`)
  - `PORT` – API port (default: 8000)
  - `ALLOWED_ORIGINS` – CORS origins (default includes `http://localhost:5173`)
  - `ADMIN_KEY` – key for `POST /admin/reload` (default: `hackathon-secret`)

- **Frontend**
  - `VITE_API_URL` or `VITE_API_BASE_URL` – API base URL (default: `http://localhost:8000`)

---

## Summary

| Step              | Where        | Command / action |
|-------------------|-------------|-------------------|
| Install backend   | `BACKEND/`  | `pip install -r requirements.txt` |
| Install frontend  | `cric-frontend/` | `npm install` |
| Run ML pipeline   | `ML/`       | `build_tables.py` → `add_context.py` → `train_expected_models_xgb.py` → `compute_match_impact.py` → `rolling_last10_impact.py` |
| Build parquets    | `BACKEND/`  | `python scripts/build_datastore_parquets.py --ml_dir ../ML/outputs_impact_metric --out_dir data_store` |
| Start API        | `BACKEND/`  | `uvicorn app.main:app --reload --port 8000` |
| Start UI         | `cric-frontend/` | `npm run dev` |

After changing ML outputs or rebuilding parquets, restart the backend (or use `/admin/reload`) so the site shows the latest Impact Metric and recent innings data.
