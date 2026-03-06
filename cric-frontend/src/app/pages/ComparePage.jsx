import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImpactMeterRadial } from '../components/ImpactMeterRadial';
import {
  fetchImpactLeaderboard,
  fetchPlayerSummary,
  fetchPlayerImpact,
} from '../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export function ComparePage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    fetchImpactLeaderboard(100)
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setPlayerData({});
      return;
    }
    selectedIds.forEach((id) => {
      Promise.all([fetchPlayerSummary(id), fetchPlayerImpact(id, 10)])
        .then(([summary, impact]) => {
          if (summary?.error) return;
          setPlayerData((prev) => ({
            ...prev,
            [id]: {
              summary,
              trend: impact?.trend ?? [],
            },
          }));
        })
        .catch(() => {});
    });
  }, [selectedIds]);

  const addPlayer = (id) => {
    const num = String(id);
    if (selectedIds.length < 4 && !selectedIds.includes(num)) {
      setSelectedIds([...selectedIds, num]);
    }
  };

  const removePlayer = (id) => {
    setSelectedIds(selectedIds.filter((i) => i !== String(id)));
    setPlayerData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const selectedPlayers = selectedIds
    .map((id) => leaderboard.find((p) => String(p.playerId) === id))
    .filter(Boolean);

  const trendChartData =
    selectedPlayers.length > 0
      ? (() => {
          const maxLen = Math.max(
            ...selectedPlayers.map((p) => (playerData[p.playerId]?.trend?.length ?? 0))
          );
          return Array.from({ length: maxLen }, (_, i) => {
            const point = { index: i + 1 };
            selectedPlayers.forEach((p) => {
              const t = playerData[p.playerId]?.trend?.[i];
              point[p.name] = t?.im != null ? t.im : null;
            });
            return point;
          });
        })()
      : [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-2 text-primary">
            Compare Players
          </h1>
          <p className="font-['Inter'] text-muted-foreground">
            Select 2–4 players to compare Impact Meter and last 10 innings trend
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-['Inter'] text-sm text-muted-foreground">Add player:</span>
            <Select value="" onValueChange={(v) => addPlayer(v)}>
              <SelectTrigger
                className="font-['Inter'] w-[280px] bg-background border-border"
                disabled={selectedIds.length >= 4}
              >
                <SelectValue placeholder={selectedIds.length >= 4 ? 'Max 4 players' : 'Choose player...'} />
              </SelectTrigger>
              <SelectContent>
                {leaderboard
                  .filter((p) => !selectedIds.includes(String(p.playerId)))
                  .map((p) => (
                    <SelectItem key={p.playerId} value={String(p.playerId)} className="font-['Inter']">
                      {p.name} ({p.team || '—'}) — IM {typeof p.im === 'number' ? p.im.toFixed(1) : p.im}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <span className="font-['Inter'] text-sm text-muted-foreground">
              {selectedIds.length} / 4 selected
            </span>
          </div>

          {selectedPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedPlayers.map((p, index) => (
                <motion.div
                  key={p.playerId}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index] }}
                  />
                  <span className="font-['Inter'] text-sm">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removePlayer(p.playerId)}
                    className="ml-1 p-1 rounded-full hover:bg-background transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selectedPlayers.length === 0 && (
          <div className="bg-card rounded-xl border border-border py-12 text-center">
            <p className="font-['Inter'] text-muted-foreground">
              Select at least 2 players to compare
            </p>
          </div>
        )}

        {selectedPlayers.length > 0 && (
          <>
            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6 text-foreground">
                Impact Meter
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {selectedPlayers.map((p, index) => (
                  <motion.div
                    key={p.playerId}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ImpactMeterRadial score={p.im} size="md" showLabel={false} />
                    <h3 className="font-['Inter'] font-semibold mt-2 text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-['Inter']">{p.team || '—'}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6 text-foreground">
                Last 10 innings trend
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="index"
                      className="text-muted-foreground"
                      style={{ fontSize: '0.75rem', fontFamily: 'Inter' }}
                      label={{ value: 'Inning', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      className="text-muted-foreground"
                      style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontFamily: 'Inter',
                      }}
                    />
                    <ReferenceLine y={50} stroke="var(--impact-neutral)" strokeDasharray="5 5" />
                    <Legend wrapperStyle={{ fontFamily: 'Inter' }} />
                    {selectedPlayers.map((p, index) => (
                      <Line
                        key={p.playerId}
                        type="monotone"
                        dataKey={p.name}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6 text-foreground">
                Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Metric</th>
                      {selectedPlayers.map((p) => (
                        <th key={p.playerId} className="text-center py-3 px-4 font-['Inter'] text-sm">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Current IM</td>
                      {selectedPlayers.map((p) => (
                        <td key={p.playerId} className="text-center py-3 px-4 font-['JetBrains_Mono'] font-semibold text-primary">
                          {typeof p.im === 'number' ? p.im.toFixed(1) : p.im}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Trend points</td>
                      {selectedPlayers.map((p) => (
                        <td key={p.playerId} className="text-center py-3 px-4 font-['JetBrains_Mono'] text-sm">
                          {playerData[p.playerId]?.trend?.length ?? 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-['Inter'] text-sm text-muted-foreground">Last 10 avg</td>
                      {selectedPlayers.map((p) => {
                        const trend = playerData[p.playerId]?.trend ?? [];
                        const avg = trend.length
                          ? (trend.reduce((s, t) => s + (t.im ?? 0), 0) / trend.length).toFixed(1)
                          : '—';
                        return (
                          <td key={p.playerId} className="text-center py-3 px-4 font-['JetBrains_Mono'] text-sm">
                            {avg}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
