import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Users, Trophy, Info, Calculator, TrendingUp, Target, Zap, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MethodologyContent } from './MethodologyPage';

export function LandingPage() {
  useEffect(() => {
    if (window.location.hash === '#about-metric') {
      const el = document.getElementById('about-metric');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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

        
      {/* About the metric (merged from Methodology page) - commented out
      <section id="about-metric" className="py-12 scroll-mt-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Poppins'] font-bold text-3xl mb-2 text-foreground">
            About the metric
          </h2>
          <p className="font-['Inter'] text-muted-foreground mb-8">
            How Impact is defined, calculated, and shown—definition, formulation, assumptions, sample outputs, and robustness.
          </p>
          <MethodologyContent embedMode />
        </div>
      </section>
      */}
    </div>
  );
}
