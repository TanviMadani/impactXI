import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { fetchImpactLeaderboard } from '../lib/api';
import { getImpactColor, getImpactLabel } from '../lib/impactUtils';

export function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchImpactLeaderboard(100);
        setPlayers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const teams = ['all', ...Array.from(new Set(players.map((p) => p.team).filter(Boolean)))];
  const filtered = teamFilter === 'all'
    ? players
    : players.filter((p) => p.team === teamFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-['Inter']">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-destructive font-['Inter'] mb-2">{error}</p>
          <p className="text-muted-foreground font-['Inter'] text-sm">
            Run the backend from the <code className="bg-muted px-1 rounded">BACKEND</code> folder: <br />
            <code className="bg-muted px-2 py-1 rounded mt-1 inline-block text-left">uvicorn app.main:app --reload --port 8000</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-2 text-primary">
            Impact Leaderboard
          </h1>
          <p className="font-['Inter'] text-muted-foreground">
            Rankings by current Impact Meter score (rolling last 10 innings)
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-['Inter'] text-sm text-muted-foreground">Filter by team:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-foreground font-['Inter'] text-sm"
          >
            <option value="all">All teams</option>
            {teams.filter((t) => t && t !== 'all').map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="font-['Inter'] text-sm text-muted-foreground">
            {filtered.length} players
          </span>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-['Inter'] text-sm text-muted-foreground">Rank</th>
                  <th className="text-left py-4 px-4 font-['Inter'] text-sm text-muted-foreground">Player</th>
                  <th className="text-left py-4 px-4 font-['Inter'] text-sm text-muted-foreground">Team</th>
                  <th className="text-left py-4 px-4 font-['Inter'] text-sm text-muted-foreground">Current IM</th>
                  <th className="text-left py-4 px-4 font-['Inter'] text-sm text-muted-foreground">Band</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, index) => (
                  <motion.tr
                    key={p.playerId}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <td className="py-4 px-4 font-['JetBrains_Mono'] text-sm text-muted-foreground">
                      #{index + 1}
                    </td>
                    <td className="py-4 px-4 font-['Inter'] font-semibold text-foreground">{p.name}</td>
                    <td className="py-4 px-4 font-['Inter'] text-sm text-muted-foreground">{p.team || '—'}</td>
                    <td className="py-4 px-4">
                      <span
                        className="font-['JetBrains_Mono'] font-bold text-lg"
                        style={{ color: getImpactColor(p.im) }}
                      >
                        {typeof p.im === 'number' ? p.im.toFixed(1) : p.im}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-['Inter'] font-medium"
                        style={{
                          backgroundColor: `${getImpactColor(p.im)}22`,
                          color: getImpactColor(p.im),
                        }}
                      >
                        {getImpactLabel(p.im)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/players/${p.playerId}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-['Inter'] text-sm"
                      >
                        View <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-['Inter']">
            No players match the selected team.
          </div>
        )}
      </div>
    </div>
  );
}
