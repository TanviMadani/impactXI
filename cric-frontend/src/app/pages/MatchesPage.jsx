import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, Info, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fetchMatchesList } from '../lib/api';

export function MatchesPage() {
  const [matchId, setMatchId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = matchId.trim();
    if (id) navigate(`/matches/${id}`);
  };

  const canLoadMore = total == null ? false : offset + limit < total;

  const loadPage = async (nextOffset, { append } = { append: false }) => {
    try {
      setError(null);
      const data = await fetchMatchesList(limit, nextOffset);
      setTotal(data?.total ?? null);
      setOffset(data?.offset ?? nextOffset);
      const newItems = Array.isArray(data?.items) ? data.items : [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
    } catch (e) {
      setError(e?.message || 'Failed to load matches');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPage(0, { append: false }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const q = matchId.trim();
    if (!q) return items;
    return items.filter((m) => String(m.match_id).includes(q));
  }, [items, matchId]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-2 text-primary">
            Match Impact
          </h1>
          <p className="font-['Inter'] text-muted-foreground">
            See who had the most impact in a match. Enter a match ID to view top players and impact scores.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-6 border border-border"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block font-['Inter'] text-sm font-medium text-foreground mb-2">
            Match ID
          </label>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Search / enter match ID (e.g. 335982)"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="font-['Inter'] bg-background border-border flex-1"
            />
            <Button type="submit" className="font-['Inter'] bg-primary text-primary-foreground">
              <Search className="mr-2 h-4 w-4" />
              View match
            </Button>
          </div>
        </motion.form>

        <div className="mt-6 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-['Inter'] text-sm text-foreground font-medium">Available match IDs</p>
                <p className="font-['Inter'] text-xs text-muted-foreground">
                  Click a match to open details. Use the box above to filter by ID.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="font-['Inter']"
              onClick={() => {
                setLoading(true);
                loadPage(0, { append: false }).finally(() => setLoading(false));
              }}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="p-4">
              <p className="font-['Inter'] text-sm text-destructive">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-4">
              <p className="font-['Inter'] text-sm text-muted-foreground">Loading matches…</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4">
              <p className="font-['Inter'] text-sm text-muted-foreground">
                No matches found{matchId.trim() ? ' for this filter.' : '.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredItems.map((m) => (
                <button
                  key={m.match_id}
                  type="button"
                  className="w-full text-left p-4 hover:bg-muted/40 transition-colors"
                  onClick={() => navigate(`/matches/${m.match_id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-['JetBrains_Mono'] text-sm text-foreground">
                        Match #{m.match_id}
                      </p>
                      {Array.isArray(m.topPlayersPreview) && m.topPlayersPreview.length > 0 ? (
                        <p className="font-['Inter'] text-xs text-muted-foreground mt-1">
                          Top players: {m.topPlayersPreview.map((p) => p?.name).filter(Boolean).join(', ')}
                        </p>
                      ) : (
                        <p className="font-['Inter'] text-xs text-muted-foreground mt-1">
                          Top players preview unavailable
                        </p>
                      )}
                    </div>
                    <span className="font-['Inter'] text-xs text-muted-foreground">Open</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-border flex items-center justify-between gap-3">
            <p className="font-['Inter'] text-xs text-muted-foreground">
              {total != null ? `${items.length} shown of ${total}` : `${items.length} shown`}
            </p>
            <Button
              type="button"
              variant="outline"
              className="font-['Inter']"
              disabled={!canLoadMore || loadingMore}
              onClick={() => {
                const nextOffset = offset + limit;
                setLoadingMore(true);
                loadPage(nextOffset, { append: true }).finally(() => setLoadingMore(false));
              }}
            >
              <ChevronDown className="mr-2 h-4 w-4" />
              Load more
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
