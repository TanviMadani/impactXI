import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { PlayerCard } from '../components/PlayerCard';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { fetchImpactLeaderboard, fetchPlayersSearch } from '../lib/api';

export function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');

  const loadLeaderboard = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchImpactLeaderboard(100)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPlayers(list.map((p) => ({
          playerId: p.playerId,
          name: p.name,
          team: p.team,
          currentIM: p.im,
          band: p.band,
          im: p.im,
        })));
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message || 'Failed to load players');
      })
      .finally(() => setLoading(false));
  }, []);

  const runSearch = useCallback((q) => {
    if (!q.trim()) {
      loadLeaderboard();
      return;
    }
    setLoading(true);
    setError(null);
    fetchPlayersSearch(q.trim(), 50)
      .then((res) => {
        const list = res?.items ?? [];
        setPlayers(list.map((p) => ({
          playerId: p.playerId,
          name: p.name,
          team: p.team,
          currentIM: p.currentIM,
          band: p.band,
          im: p.currentIM,
        })));
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message || 'Search failed');
      })
      .finally(() => setLoading(false));
  }, [loadLeaderboard]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadLeaderboard();
      return;
    }
    const t = setTimeout(() => runSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, runSearch, loadLeaderboard]);

  const teams = [
    'all',
    ...Array.from(new Set(players.map((p) => p.team).filter(Boolean)))
      .filter((t) => String(t).trim())
      .sort((a, b) => String(a).localeCompare(String(b))),
  ];
  const filteredPlayers = players.filter((p) => {
    const matchTeam = teamFilter === 'all' || p.team === teamFilter;
    return matchTeam;
  });

  if (loading && players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-['Inter'] text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-2 text-primary">
            Player Explorer
          </h1>
          <p className="font-['Inter'] text-muted-foreground">
            Search and filter by team. Click a player for Impact Meter score, last 10 innings trend, and match breakdown.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by player name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-['Inter'] bg-background border-border"
              />
            </div>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-['Inter'] text-sm"
            >
              <option value="all">All teams</option>
              {teams.filter((t) => t && t !== 'all').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="flex items-center justify-end">
              <span className="font-['Inter'] text-sm text-muted-foreground">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-['Inter']">
            <p className="font-medium">{error}</p>
            {error.includes('Backend not reachable') && (
              <p className="mt-2 text-sm text-muted-foreground">
                From the <code className="bg-muted px-1 rounded">BACKEND</code> folder run: <code className="bg-muted px-2 py-0.5 rounded">uvicorn app.main:app --reload --port 8000</code>
              </p>
            )}
          </div>
        )}

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredPlayers.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <PlayerCard player={player} />
            </motion.div>
          ))}
        </motion.div>

        {!loading && filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-['Inter']">
            No players found. Try a different search or team filter.
          </div>
        )}
      </div>
    </div>
  );
}
