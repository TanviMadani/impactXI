import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchMatchDetails } from '../lib/api';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getImpactColor } from '../lib/impactUtils';

export function MatchDetailPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    setError(null);
    fetchMatchDetails(matchId)
      .then((data) => {
        if (data?.error) {
          setError(data.error);
          setMatch(null);
        } else {
          setMatch(data);
        }
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message || 'Failed to load match');
        setMatch(null);
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading && !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-['Inter'] text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Poppins'] text-2xl mb-4 text-foreground">Match not found</h2>
          <p className="font-['Inter'] text-muted-foreground mb-4">{error || 'Unknown error'}</p>
          <Link to="/matches">
            <Button variant="outline">Back to Matches</Button>
          </Link>
        </div>
      </div>
    );
  }

  let topPlayers = [];
  try {
    const raw = match.top_players_json ?? match.top_players;
    if (typeof raw === 'string') topPlayers = JSON.parse(raw);
    else if (Array.isArray(raw)) topPlayers = raw;
  } catch (_) {}

  const dateStr = match.date
    ? new Date(match.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  const teamA = match.team1 ?? match.teamA ?? match.team_a ?? null;
  const teamB = match.team2 ?? match.teamB ?? match.team_b ?? null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/matches">
          <Button variant="ghost" className="mb-6 font-['Inter']">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Button>
        </Link>

        <div className="bg-card rounded-xl p-8 border border-border mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 className="font-['Poppins'] font-bold text-2xl md:text-3xl text-foreground">
              {teamA || `Match #${match.match_id ?? matchId}`} {teamB ? `vs ${teamB}` : ''}
            </h1>
          </div>
          {dateStr && (
            <p className="font-['Inter'] text-muted-foreground">{dateStr}</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-['Poppins'] font-semibold text-xl text-foreground">
              Top impact in this match
            </h2>
          </div>
          {topPlayers.length === 0 ? (
            <p className="font-['Inter'] text-muted-foreground text-sm">
              No player impact data for this match.
            </p>
          ) : (
            <div className="space-y-3">
              {topPlayers.map((p, index) => (
                <motion.div
                  key={p.player + index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-['JetBrains_Mono'] text-sm text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                    <span className="font-['Inter'] font-semibold text-foreground">
                      {p.player ?? p.name ?? '—'}
                    </span>
                  </div>
                  <span
                    className="font-['JetBrains_Mono'] font-bold text-lg"
                    style={{ color: getImpactColor(p.impact ?? 50) }}
                  >
                    {p.impact != null ? Number(p.impact).toFixed(1) : '—'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 font-['Inter'] text-sm text-muted-foreground">
          Impact in this match is computed from performance, context, and pressure. Who really changed the match?
        </p>
      </div>
    </div>
  );
}
