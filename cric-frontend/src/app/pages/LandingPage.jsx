import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Users, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchImpactLeaderboard } from '../lib/api';
import { getImpactColor } from '../lib/impactUtils';

export function LandingPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchImpactLeaderboard(50)
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]));
  }, []);

  const top5 = leaderboard.slice(0, 5);
  const avgImpact = top5.length
    ? (top5.reduce((s, p) => s + (p.im ?? 0), 0) / top5.length).toFixed(1)
    : '—';
  const highest = top5.length ? Math.max(...top5.map((p) => p.im ?? 0)).toFixed(1) : '—';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card to-background py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-['Poppins'] font-bold text-4xl md:text-6xl mb-6 text-primary">
              IPL Meter
            </h1>
            <p className="font-['Inter'] text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A context-aware Impact Metric for IPL players based on performance, pressure, and recent form.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/players">
                <Button size="lg" className="font-['Inter'] font-semibold bg-primary text-primary-foreground hover:opacity-90">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Players
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="lg" variant="outline" className="font-['Inter'] font-semibold border-primary text-primary">
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline" className="font-['Inter'] font-semibold border-secondary text-secondary">
                  Compare Players
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top 5 + Stat cards */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Poppins'] font-bold text-2xl mb-6 text-foreground">
            Top impact players
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="space-y-3">
                {top5.length === 0 && (
                  <p className="font-['Inter'] text-muted-foreground">Loading...</p>
                )}
                {top5.map((p, i) => (
                  <Link
                    key={p.playerId}
                    to={`/players/${p.playerId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-['JetBrains_Mono'] text-sm text-muted-foreground w-6">
                        #{i + 1}
                      </span>
                      <span className="font-['Inter'] font-semibold">{p.name}</span>
                      <span className="font-['Inter'] text-sm text-muted-foreground">{p.team || ''}</span>
                    </div>
                    <span
                      className="font-['JetBrains_Mono'] font-bold"
                      style={{ color: getImpactColor(p.im) }}
                    >
                      {typeof p.im === 'number' ? p.im.toFixed(1) : p.im}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Avg Impact (Top 5)</div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-primary">{avgImpact}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Highest Impact</div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-primary">{highest}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 col-span-2">
                <div className="text-xs text-muted-foreground font-['Inter'] mb-1">Metric</div>
                <p className="font-['Inter'] text-sm text-muted-foreground">
                  Normalized 0–100 score using rolling last 10 innings. Above 50 = positive impact; below 50 = below par.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Poppins'] font-bold text-2xl mb-8 text-center text-foreground">
            What makes Impact Meter different?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              className="bg-card rounded-xl p-6 border border-border"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary/20 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-lg mb-2">Performance</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                Runs, wickets, strike rate, and economy weighted by match context.
              </p>
            </motion.div>
            <motion.div
              className="bg-card rounded-xl p-6 border border-border"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-secondary/20 text-secondary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-lg mb-2">Context & pressure</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                Match situation and pressure moments so the score reflects true impact.
              </p>
            </motion.div>
            <motion.div
              className="bg-card rounded-xl p-6 border border-border"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-accent/20 text-accent">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-lg mb-2">Rolling last 10</h3>
              <p className="font-['Inter'] text-sm text-muted-foreground">
                Recent form focus with a rolling window so scores stay current.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-['Poppins'] font-bold text-2xl text-foreground mb-4">
            How is the score calculated?
          </h2>
          <p className="font-['Inter'] text-muted-foreground mb-6">
            Definition, formulation, assumptions, and sample outputs are documented in About Metric.
          </p>
          <Link to="/methodology">
            <Button size="lg" variant="outline" className="font-['Inter'] font-semibold border-primary text-primary">
              <BookOpen className="mr-2 h-5 w-5" />
              About Metric
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
