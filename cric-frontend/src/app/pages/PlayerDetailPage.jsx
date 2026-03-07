import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImpactMeterRadial } from '../components/ImpactMeterRadial';
import { TrendLineChart } from '../components/TrendLineChart';
import { ArrowLeft, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  fetchPlayerSummary,
  fetchPlayerImpact,
  fetchPlayerInnings,
} from '../lib/api';
import { getImpactColor } from '../lib/impactUtils';

export function PlayerDetailPage() {
  const { playerId } = useParams();
  const [summary, setSummary] = useState(null);
  const [impact, setImpact] = useState(null);
  const [innings, setInnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchPlayerSummary(playerId),
      fetchPlayerImpact(playerId, 10),
      fetchPlayerInnings(playerId, 20),
    ])
      .then(([s, i, inn]) => {
        if (s?.error) {
          setError(s.error);
          setSummary(null);
        } else {
          setSummary(s);
        }
        if (i?.trend) setImpact(i);
        else setImpact(null);
        setInnings(inn?.items ?? []);
      })
      .catch((e) => {
        console.error(e);
        setError('Failed to load player');
      })
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-['Inter'] text-muted-foreground">Loading player...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Poppins'] text-2xl mb-4 text-foreground">Player not found</h2>
          <p className="font-['Inter'] text-muted-foreground mb-4">{error || 'Unknown error'}</p>
          <Link to="/players">
            <Button variant="outline">Back to Players</Button>
          </Link>
        </div>
      </div>
    );
  }

  const score = summary.currentIM ?? 0;
  const trendValues = impact?.trend?.map((t) => t.im) ?? [];
  const trendLabels = impact?.trend?.map((t) => t.date?.slice(0, 10) || `M${t.matchId}`) ?? [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/players">
          <Button variant="ghost" className="mb-6 font-['Inter']">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Players
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-card rounded-xl p-8 border border-border mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h1 className="font-['Poppins'] font-bold text-4xl mb-2 text-foreground">{summary.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground font-['Inter'] mb-6">
                <span className="text-lg">{summary.team || '—'}</span>
                <span>·</span>
                <span className="text-lg">{summary.band || '—'}</span>
                {summary.asOfDate && (
                  <>
                    <span>·</span>
                    <span className="text-sm">Last updated {summary.asOfDate}</span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Baseline</div>
                  <div className="font-['JetBrains_Mono'] text-xl font-semibold text-foreground">50</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Impact band</div>
                  <div className="font-['Inter'] font-semibold" style={{ color: getImpactColor(score) }}>
                    {summary.band || '—'}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Form</div>
                  <div className="font-['Inter'] font-semibold text-foreground">{summary.form || '—'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Matches played</div>
                  <div className="font-['JetBrains_Mono'] text-xl font-semibold text-foreground">{summary.matchesPlayed ?? '—'}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <ImpactMeterRadial score={score} size="lg" />
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-['Poppins'] font-semibold text-xl text-foreground">Last 10 innings trend</h2>
            </div>
            <div className="h-64">
              {trendValues.length > 0 ? (
                <TrendLineChart
                  data={trendValues}
                  labels={trendLabels}
                  color="var(--chart-1)"
                  showBaseline
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground font-['Inter'] text-sm">
                  No trend data
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-['Inter'] mt-4">
              Rolling impact per match. Baseline 50 = neutral.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-secondary" />
              <h2 className="font-['Poppins'] font-semibold text-xl text-foreground">Why this score?</h2>
            </div>
            <p className="font-['Inter'] text-muted-foreground text-sm mb-4">
              Impact Meter combines <strong className="text-foreground">performance</strong> (runs, wickets, strike rate), <strong className="text-foreground">match context</strong>, and <strong className="text-foreground">pressure</strong>. Scores are normalized 0–100 with 50 as neutral. Recency is built in via the rolling last 10 innings.
            </p>
            <p className="font-['Inter'] text-muted-foreground text-sm">
              Component breakdown (performance / context / pressure) can be exposed when the backend provides it.
            </p>
          </div>
        </div>

        {/* Recent innings table */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-accent" />
            <h2 className="font-['Poppins'] font-semibold text-xl text-foreground">Recent innings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-['Inter'] text-sm text-muted-foreground">#</th>
                  <th className="text-left py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Match</th>
                  <th className="text-left py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Impact</th>
                </tr>
              </thead>
              <tbody>
                {innings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground font-['Inter'] text-sm">
                      No innings data
                    </td>
                  </tr>
                )}
                {innings.map((row, idx) => {
                  const matchId = row.match_id ?? row.matchId;
                  const hasValidMatch = matchId != null && String(matchId).trim() !== '' && String(matchId) !== 'NA';
                  return (
                    <motion.tr
                      key={`${matchId}-${idx}`}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="py-3 px-4 font-['JetBrains_Mono'] text-sm text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-4 font-['Inter'] text-sm">{row.date || '—'}</td>
                      <td className="py-3 px-4 font-['Inter'] text-sm">
                        {hasValidMatch ? (
                          <Link to={`/matches/${matchId}`} className="text-primary hover:underline font-medium">
                            Match #{matchId}
                          </Link>
                        ) : (
                          <>Match #{matchId ?? '—'}</>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="font-['JetBrains_Mono'] font-semibold"
                          style={{ color: getImpactColor(row.im_innings_0_100) }}
                        >
                          {row.im_innings_0_100 != null ? Number(row.im_innings_0_100).toFixed(1) : '—'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/compare">
            <Button size="lg" className="font-['Inter'] font-semibold bg-secondary text-secondary-foreground">
              Compare with another player
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
