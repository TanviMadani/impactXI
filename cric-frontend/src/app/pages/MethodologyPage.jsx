import { motion } from 'motion/react';
import {
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Award,
  Info,
  Database,
  Cpu,
  BarChart3,
  GitBranch,
  FileJson,
  Server,
  LayoutDashboard,
  CheckCircle2,
  Gauge,
} from 'lucide-react';

export function MethodologyContent({ embedMode = false }) {
  return (
    <>
        {/* ========== DELIVERABLE 1: Definition of Impact ========== */}
        <motion.section
          id={embedMode ? undefined : 'about-metric'}
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              1. Definition of Impact
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Impact</strong> is a player’s contribution in a match (or over recent matches) measured <em>relative to expectation</em> in the same situation—not raw runs or wickets alone. It answers: “How much did this performance change the outcome compared to what we’d expect from an average performer in that context?”
          </p>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            Three pillars contribute to Impact:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-['Poppins'] font-semibold text-foreground">Performance</h3>
              </div>
              <p className="font-['Inter'] text-sm text-muted-foreground">Actual runs, wickets, economy vs <strong className="text-foreground">expected</strong> from our ML models (context-adjusted). Positive residual = above expectation.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-secondary" />
                <h3 className="font-['Poppins'] font-semibold text-foreground">Context</h3>
              </div>
              <p className="font-['Inter'] text-sm text-muted-foreground">Match situation: phase (Powerplay / Middle / Death), entry score/wickets, required run rate. Same stats are valued differently in different situations.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-['Poppins'] font-semibold text-foreground">Pressure</h3>
              </div>
              <p className="font-['Inter'] text-sm text-muted-foreground">High-pressure phases (e.g. death overs, chase) are upweighted via multipliers so that performing under pressure counts more.</p>
            </div>
          </div>
        </motion.section>

        {/* ========== DELIVERABLE 2: Mathematical Formulation ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              2. Mathematical Formulation
            </h2>
          </div>

          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            The Impact Metric (IM) is defined in two stages: <strong className="text-foreground">per-match raw impact</strong> (bat + bowl, pressure-weighted), then <strong className="text-foreground">normalization to 0–100</strong> with <strong className="text-foreground">baseline 50 = neutral</strong>. Player-level IM is the recency-weighted average of the last 10 match impacts.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Raw impact (per match)</h3>
              <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`total_impact_raw = bat_impact_raw + bowl_runs_impact_raw + bowl_wkts_impact_raw
  where:
  bat_impact_raw   = BAT_WEIGHT × bat_residual × bat_pressure_mult   (bat_residual = runs − expected_runs)
  bowl_runs_impact = BOWL_RUNS_WEIGHT × bowl_residual_runs × bowl_pressure_mult
  bowl_wkts_impact = bowl_residual_wkts × WICKET_WEIGHT_RUNS × bowl_pressure_mult`}
              </pre>
            </div>
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Normalization to 0–100 (robust_0_100)</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground mb-2">
                We use <strong className="text-foreground">median and MAD</strong> (median absolute deviation) so a few outliers don’t distort the scale. z-scores are clipped to ±3 so no single performance dominates.
              </p>
              <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`z = (x − median) / (1.4826 × MAD + ε)   ; z clipped to [-3, 3]
score = 50 + (z / 3) × 50                 ; maps z ∈ [-3,3] → [0, 100]
IM = clip(score, 0, 100)`}
              </pre>
            </div>
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Baseline logic</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                <strong className="text-foreground">50 = neutral</strong> (average impact). Above 50 = positive impact; below 50 = below par. Labels: poor (0–35), below_avg (35–45), neutral (45–55), good (55–70), elite (70–100).
              </p>
            </div>
          </div>
        </motion.section>

        {/* ========== DELIVERABLE 3: Model / Algorithm (context, situation, recency) ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              3. Model / Algorithm: Context, Situation & Recency
            </h2>
          </div>
          <ul className="space-y-4 font-['Inter'] text-muted-foreground">
            <li>
              <strong className="text-foreground">Match context</strong> — Phase (Powerplay 0–5, Middle 6–15, Death 16–19), entry score/wickets when the batter/bowler came in, balls remaining, required run rate (innings 2). These feed the XGBoost expected-run models and the pressure proxy.
            </li>
            <li>
              <strong className="text-foreground">Situation</strong> — Pressure multipliers: batting uses <code className="bg-muted px-1 rounded">pressure_proxy</code> (clipped 0.7–2.0); bowling uses death fraction + second-innings bonus (clipped 0.8–1.6). Same residual counts more in high-pressure phases.
            </li>
            <li>
              <strong className="text-foreground">Recency (rolling last 10 innings)</strong> — Player IM = recency-weighted average of last 10 match impact scores. Weights [0.1, 0.2, …, 1.0] from oldest to newest so recent form matters more. Trend data drives the “Last 10 innings” chart on the player page.
            </li>
          </ul>
        </motion.section>

        {/* ========== DELIVERABLE 4: Assumptions & Design Choices ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              4. Assumptions & Design Choices
            </h2>
          </div>
          <ul className="space-y-3 font-['Inter'] text-muted-foreground">
            <li><strong className="text-foreground">T20 phases:</strong> Powerplay (overs 0–5), Middle (6–15), Death (16–19). Phase counts feed both expected-run models and pressure.</li>
            <li><strong className="text-foreground">Weightage:</strong> BAT_WEIGHT = 1, BOWL_RUNS_WEIGHT = 1, WICKET_WEIGHT_RUNS = 20 (one wicket ≈ 20 runs of impact). Chosen so batting and bowling contributions are comparable.</li>
            <li><strong className="text-foreground">Pressure caps:</strong> Bat pressure multiplier clipped to [0.7, 2.0]; bowl to [0.8, 1.6] to avoid a single high-pressure over dominating.</li>
            <li><strong className="text-foreground">Baseline 50:</strong> Median-centred normalization so the average player in the dataset maps to 50; no arbitrary “par” run total.</li>
            <li><strong className="text-foreground">Train/test split by match_id:</strong> Prevents leakage; model never sees the same match in train and test.</li>
            <li><strong className="text-foreground">Recency window:</strong> Fixed at 10 matches for all players for comparability; fewer matches available ⇒ we use whatever is available (no padding).</li>
          </ul>
        </motion.section>

        {/* ========== DELIVERABLE 5: Sample Outputs ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              5. Sample Outputs
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            Example of how IM is computed for a single match and then rolled into a player score.
          </p>
          <div className="space-y-4 font-['Inter'] text-sm">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-['Poppins'] font-semibold text-foreground mb-2">Match scenario: Batter in a chase</h3>
              <p className="text-muted-foreground mb-2">Player scores 45 runs in 30 balls. Expected runs from model (given balls, phase mix, entry score, required RR) = 32. Pressure proxy = 0.25 (moderate chase pressure).</p>
              <pre className="font-['JetBrains_Mono'] text-xs bg-background p-3 rounded border overflow-x-auto">
{`bat_residual = 45 − 32 = +13
bat_pressure_mult = (1 + 0.25) = 1.25 (within [0.7, 2.0])
bat_impact_raw = 1 × 13 × 1.25 = 16.25`}
              </pre>
              <p className="text-muted-foreground mt-2">After adding bowling impact (if any) and combining with all players in the match, <code className="bg-muted px-1 rounded">total_impact_raw</code> is normalized via median/MAD to get <code className="bg-muted px-1 rounded">impact_score_0_100</code> for that match (e.g. 72 → “good”).</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-['Poppins'] font-semibold text-foreground mb-2">Player rolling IM (last 10)</h3>
              <p className="text-muted-foreground mb-2">Suppose a player’s last 10 match impact scores (oldest → newest) are [48, 52, 55, 51, 58, 62, 59, 64, 68, 72]. Weights 0.1…1.0.</p>
              <pre className="font-['JetBrains_Mono'] text-xs bg-background p-3 rounded border overflow-x-auto">
{`rolling_im = (48×0.1 + 52×0.2 + … + 72×1.0) / (0.1+0.2+…+1.0) ≈ 61.5`}
              </pre>
              <p className="text-muted-foreground mt-2">Displayed as <strong className="text-foreground">61.5</strong> on the leaderboard and in the Impact meter; the trend chart shows the 10 match scores with a baseline at 50.</p>
            </div>
          </div>
        </motion.section>

        {/* ========== DELIVERABLE 6: Robustness ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              6. Robustness: Edge Cases & Anti-Inflation
            </h2>
          </div>
          <ul className="space-y-3 font-['Inter'] text-muted-foreground">
            <li><strong className="text-foreground">Median/MAD normalization:</strong> A few extreme performances don’t stretch the scale; we use median and MAD instead of mean/std so outliers don’t distort 0–100.</li>
            <li><strong className="text-foreground">z-score clipping (±3):</strong> Raw impact is mapped to z, then clipped to [-3, 3] before converting to 0–100. Prevents one freak match from pushing everyone else into a narrow band.</li>
            <li><strong className="text-foreground">Pressure caps:</strong> Multipliers are clipped (bat 0.7–2.0, bowl 0.8–1.6) so one death over or chase moment can’t arbitrarily inflate impact.</li>
            <li><strong className="text-foreground">Few innings:</strong> If a player has &lt;10 matches, we use all available; rolling average is over N matches (no artificial padding). Fair for new players.</li>
            <li><strong className="text-foreground">Constant MAD:</strong> If MAD ≈ 0 (all raw impacts similar), we assign 50 to everyone so we don’t divide by zero and the scale stays neutral.</li>
            <li><strong className="text-foreground">Match-level split:</strong> Train/test by match_id avoids leakage from same match; expected-run models generalize to unseen matches.</li>
          </ul>
        </motion.section>

        {/* ========== DELIVERABLE 7 (Bonus): Visualization ========== */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <Gauge className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              7. Visualization: Impact Meter & Trend View
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            The app surfaces IM in two main ways:
          </p>
          <ul className="space-y-3 font-['Inter'] text-muted-foreground">
            <li><strong className="text-foreground">Impact meter (gauge):</strong> A circular gauge showing the current Impact Score (0–100) with a colour band (e.g. green for high, amber for neutral, red for low). Used on the <strong className="text-foreground">Leaderboard</strong>, <strong className="text-foreground">Player detail</strong> page, and <strong className="text-foreground">Compare</strong> page.</li>
            <li><strong className="text-foreground">Trend view (last 10 innings):</strong> A line chart of match-by-match impact scores with a baseline at 50. Available on the <strong className="text-foreground">Player profile</strong> (“Last 10 innings trend”) and in <strong className="text-foreground">Compare</strong> when comparing multiple players. Shows whether form is improving or declining.</li>
          </ul>
          <p className="font-['Inter'] text-sm text-muted-foreground mt-4">
            Navigate to <strong className="text-foreground">Leaderboard</strong> for rankings by IM, <strong className="text-foreground">Players → [select player]</strong> for the meter and trend chart, and <strong className="text-foreground">Compare</strong> to put two or more players side by side.
          </p>
        </motion.section>

        {/* -------------------- How the project works -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              How the project works
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            Raw ball-by-ball IPL data (CSVs) is processed in the <strong className="text-foreground">ML pipeline</strong> to build
            innings tables, add phase/context, train XGBoost models for &quot;expected&quot; runs/wickets, then compute
            per-match impact and a rolling player metric. The <strong className="text-foreground">backend</strong> loads
            parquet outputs and serves APIs; the <strong className="text-foreground">frontend</strong> shows leaderboards,
            player profiles, and match impact.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-muted font-['Inter'] text-sm">ML folder: build_tables → add_context → train XGB → compute_match_impact → rolling_last10</span>
            <span className="px-3 py-1 rounded-full bg-muted font-['Inter'] text-sm">Backend: parquet → FastAPI</span>
            <span className="px-3 py-1 rounded-full bg-muted font-['Inter'] text-sm">Frontend: React, leaderboard / players / matches</span>
          </div>
        </motion.section>

        {/* -------------------- 2. Data pipeline -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              Data pipeline
            </h2>
          </div>

          <ul className="space-y-4 font-['Inter'] text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-['JetBrains_Mono'] text-sm font-semibold text-primary shrink-0">Step 1</span>
              <div>
                <strong className="text-foreground">build_tables.py</strong> — Reads match CSVs from <code className="bg-muted px-1 rounded">./ipl</code>, builds
                <code className="bg-muted px-1 rounded">batting_innings.csv</code> and <code className="bg-muted px-1 rounded">bowling_innings.csv</code> (runs, balls, strike rate, economy, fours, sixes, wickets per match/innings/player).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-['JetBrains_Mono'] text-sm font-semibold text-primary shrink-0">Step 2</span>
              <div>
                <strong className="text-foreground">add_context.py</strong> — From ball-by-ball data, builds <strong className="text-foreground">ball_context</strong> (over index, phase: Powerplay/Middle/Death, cumulative runs/wickets, required run rate for chases), then <strong className="text-foreground">batting_context.csv</strong> and <strong className="text-foreground">bowling_context.csv</strong> with runs, balls, phase-wise ball counts (PP/Mid/Death), and optional entry/exit context.
              </div>
            </li>
          </ul>
        </motion.section>

        {/* -------------------- 3. ML models -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              ML models (XGBoost)
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            All models are <strong className="text-foreground">XGBoost regressors</strong> (squarederror). Train/test split is by <code className="bg-muted px-1 rounded">match_id</code> to avoid leakage. Predictions are &quot;expected&quot; runs or wickets; <strong className="text-foreground">impact = actual − expected</strong>, then scaled and pressure-weighted.
          </p>

          <div className="space-y-6 mt-6">
            <div className="pl-4 border-l-4 border-primary">
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">1. Batting expected runs</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground mb-2">
                <strong>Inputs:</strong> balls, entry_score, entry_wkts, entry_balls_remaining, entry_required_rr, balls_pp, balls_middle, balls_death, pressure_proxy, fours, sixes, innings.
              </p>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                <strong>Output:</strong> expected_runs. <strong>Residual:</strong> bat_residual = runs − expected_runs (positive = better than expected).
              </p>
            </div>
            <div className="pl-4 border-l-4 border-secondary">
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">2. Bowling expected runs conceded</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground mb-2">
                <strong>Inputs:</strong> balls, innings, balls_pp, balls_middle, balls_death, wides, noballs, dot_balls.
              </p>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                <strong>Output:</strong> expected_runs_conceded. <strong>Residual:</strong> bowl_residual_runs = expected_runs_conceded − runs_conceded (positive = bowler did better than expected).
              </p>
            </div>
            <div className="pl-4 border-l-4 border-accent">
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">3. Bowling expected wickets (optional)</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                Same feature set as runs. Output: expected_wickets. <strong>Residual:</strong> bowl_residual_wkts. Wickets are then weighted (e.g. 20 runs per wicket) in the impact formula.
              </p>
            </div>
          </div>
          <p className="font-['Inter'] text-xs text-muted-foreground mt-4">
            Model files: <code className="bg-muted px-1 rounded">xgb_batting_expected_runs.json</code>, <code className="bg-muted px-1 rounded">xgb_bowling_expected_runs_conceded.json</code>, <code className="bg-muted px-1 rounded">xgb_bowling_expected_wickets.json</code> (in backend data_store/models or ML outputs_impact_metric/models).
          </p>
        </motion.section>

        {/* -------------------- 4. Impact calculation -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              Impact calculation (compute_match_impact.py)
            </h2>
          </div>

          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            Per match, batting and bowling contributions are combined into a <strong className="text-foreground">raw impact</strong>, then normalized to a <strong className="text-foreground">0–100 score</strong> (50 = neutral). Labels: poor / below_avg / neutral / good / elite.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Batting impact</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground mb-1">
                Pressure multiplier from <code className="bg-muted px-1 rounded">pressure_proxy</code> (clipped 0.7–2.0):
              </p>
              <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`bat_pressure_mult = (1 + pressure_proxy).clip(0.7, 2.0)
bat_impact_raw = BAT_WEIGHT × bat_residual × bat_pressure_mult`}
              </pre>
            </div>
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Bowling impact</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground mb-1">
                Pressure from death overs and second-innings bonus (clipped 0.8–1.6):
              </p>
              <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`death_frac = balls_death / balls
innings_bonus = 0.2 if innings == 2 else 0
bowl_pressure_mult = (1 + 0.6×death_frac + innings_bonus).clip(0.8, 1.6)
bowl_runs_impact_raw = BOWL_RUNS_WEIGHT × bowl_residual_runs × bowl_pressure_mult
bowl_wkts_impact_raw = bowl_residual_wkts × WICKET_WEIGHT_RUNS × bowl_pressure_mult`}
              </pre>
            </div>
            <div>
              <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-2">Combine and normalize to 0–100</h3>
              <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`total_impact_raw = bat_impact_raw + bowl_runs_impact_raw + bowl_wkts_impact_raw
impact_score_0_100 = robust_0_100(total_impact_raw)   # median/MAD scaling, z clipped ±3, mapped to 0–100
impact_label = cut(score, bins=[0,35,45,55,70,100] → poor | below_avg | neutral | good | elite)`}
              </pre>
            </div>
          </div>
        </motion.section>

        {/* -------------------- 5. Rolling last 10 -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              Rolling last 10 (player IM)
            </h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">rolling_last10_impact.py</strong> takes per-match <code className="bg-muted px-1 rounded">impact_score_0_100</code>, sorts by match date (or match_id), and for each player computes a <strong className="text-foreground">recency-weighted average</strong> over the last 10 matches. Newest match has highest weight.
          </p>
          <pre className="font-['JetBrains_Mono'] text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`WEIGHTS = [0.1, 0.2, ..., 1.0]  # oldest → newest
rolling_im = Σ(scores × weights) / Σ(weights)
Final IM = last rolling value after all matches`}
          </pre>
          <p className="font-['Inter'] text-sm text-muted-foreground mt-4">
            Outputs: <code className="bg-muted px-1 rounded">player_impact_metric.csv</code> (player, impact_metric_last10, matches_available), <code className="bg-muted px-1 rounded">player_impact_trend_last10.csv</code> (for frontend trend chart).
          </p>
        </motion.section>

        {/* -------------------- 6. How data is shown -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">
              How data is shown in the app
            </h2>
          </div>

          <div className="space-y-4 font-['Inter'] text-muted-foreground">
            <div className="flex gap-3">
              <Server className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <strong className="text-foreground">Backend</strong> — Loads parquet files from <code className="bg-muted px-1 rounded">data_store/</code>: <code className="bg-muted px-1 rounded">player_rolling.parquet</code>, <code className="bg-muted px-1 rounded">player_innings.parquet</code>, <code className="bg-muted px-1 rounded">match_index.parquet</code>. These are built from the ML pipeline CSVs via <code className="bg-muted px-1 rounded">datastore_mapping.py</code>. APIs: /players, /players/:id, /players/:id/impact, /players/:id/innings, /leaderboards/impact, /matches, /matches/:id.
              </div>
            </div>
            <div className="flex gap-3">
              <FileJson className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <strong className="text-foreground">Leaderboard</strong> — Uses <code className="bg-muted px-1 rounded">player_rolling</code> (im_rolling_0_100, band). <strong className="text-foreground">Player detail</strong> — Summary from player_rolling; impact trend from player_innings (last N matches); band and gauge from same score. <strong className="text-foreground">Match detail</strong> — From match_index (top_players_json): top performers and their impact in that match.
              </div>
            </div>
            <div className="flex gap-3">
              <BarChart3 className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <strong className="text-foreground">Impact bands in UI</strong> — 0–40 Below par, 40–70 Neutral to above average, 70–100 Strong to elite. Baseline 50 = neutral; above 50 = positive impact, below 50 = below par.
              </div>
            </div>
          </div>
        </motion.section>

        {/* -------------------- 7. What is the Impact Metric (existing content, condensed) -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">What is the Impact Metric?</h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            A context-aware score (0–100): performance vs expected, weighted by match phase and pressure. <strong className="text-foreground">50 = neutral</strong>; above 50 = positive impact, below 50 = below par.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="font-['JetBrains_Mono'] font-bold text-xl text-primary mb-2">70–100</div>
              <div className="font-['Inter'] text-sm text-muted-foreground">Strong to elite impact</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="font-['JetBrains_Mono'] font-bold text-xl text-accent mb-2">40–70</div>
              <div className="font-['Inter'] text-sm text-muted-foreground">Neutral to above average</div>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="font-['JetBrains_Mono'] font-bold text-xl text-destructive mb-2">0–40</div>
              <div className="font-['Inter'] text-sm text-muted-foreground">Below par</div>
            </div>
          </div>
        </motion.section>

        {/* -------------------- 8. Components (existing, kept) -------------------- */}
        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">Components</h2>
          </div>
          <div className="space-y-6">
            <div className="pl-4 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-['Poppins'] font-semibold text-lg text-foreground">1. Performance</h3>
              </div>
              <p className="font-['Inter'] text-muted-foreground">Runs, wickets, strike rate, economy vs expected (residuals from ML models).</p>
            </div>
            <div className="pl-4 border-l-4 border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-secondary" />
                <h3 className="font-['Poppins'] font-semibold text-lg text-foreground">2. Match context</h3>
              </div>
              <p className="font-['Inter'] text-muted-foreground">Phase (Powerplay / Middle / Death), entry score/wickets, required run rate.</p>
            </div>
            <div className="pl-4 border-l-4 border-accent">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-['Poppins'] font-semibold text-lg text-foreground">3. Pressure</h3>
              </div>
              <p className="font-['Inter'] text-muted-foreground">Pressure multipliers: death overs, second innings; same stats count more in high-pressure phases.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="bg-card rounded-xl p-8 border border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">Summary</h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed">
            Impact is defined as contribution relative to expectation, with pressure and context built in. The 0–100 scale uses median/MAD and z-clipping for robustness. All seven hackathon deliverables above are covered on this page and in the app (Leaderboard, Player detail, Match detail, Compare, Methodology).
          </p>
        </motion.section>
      </>
  );
}

export function MethodologyPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-4 text-primary">
            How Impact Is Calculated
          </h1>
          <p className="font-['Inter'] text-lg text-muted-foreground max-w-2xl mx-auto">
            End-to-end: data pipeline, ML models, impact formulas, and how numbers appear in the app
          </p>
          <div className="mt-6 inline-flex flex-wrap justify-center gap-2">
            {[
              'Definition of Impact',
              'Mathematical Formulation',
              'Model / Algorithm',
              'Assumptions & Design Choices',
              'Sample Outputs',
              'Robustness',
              'Visualization (Impact meter & trend)',
            ].map((label, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-['Inter'] text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <MethodologyContent />
      </div>
    </div>
  );
}
