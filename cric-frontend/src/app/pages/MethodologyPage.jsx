import { motion } from 'motion/react';
import { Calculator, TrendingUp, Target, Zap, Award, Info } from 'lucide-react';

export function MethodologyPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-['Poppins'] font-bold text-4xl mb-4 text-primary">
            About the Metric
          </h1>
          <p className="font-['Inter'] text-lg text-muted-foreground max-w-2xl mx-auto">
            Definition, formulation, assumptions, and how we evaluate IPL player impact
          </p>
        </div>

        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">What is the Impact Metric?</h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            The Impact Metric is a context-aware score (0–100) that measures a player’s true contribution. It uses performance, match context, and pressure. <strong className="text-foreground">50 = neutral</strong>; above 50 is positive impact, below 50 is below par.
          </p>
        </motion.section>

        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
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
              <p className="font-['Inter'] text-muted-foreground">
                Runs, wickets, strike rate, economy, and contribution, weighted by context.
              </p>
            </div>

            <div className="pl-4 border-l-4 border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-secondary" />
                <h3 className="font-['Poppins'] font-semibold text-lg text-foreground">2. Match context</h3>
              </div>
              <p className="font-['Inter'] text-muted-foreground">
                Match importance and situation so the same stats are valued correctly in different games.
              </p>
            </div>

            <div className="pl-4 border-l-4 border-accent">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-['Poppins'] font-semibold text-lg text-foreground">3. Pressure</h3>
              </div>
              <p className="font-['Inter'] text-muted-foreground">
                Performance in high-pressure phases: death overs, chases, and key moments.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground">Baseline (50) & bands</h2>
          </div>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            50 = neutral. Bands: <strong className="text-foreground">Elite/Strong</strong> (high), <strong className="text-foreground">Neutral</strong> (around 50), <strong className="text-foreground">Weak</strong> (low).
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

        <motion.section
          className="bg-card rounded-xl p-8 border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground mb-4">Rolling last 10 innings</h2>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            The current score uses a <strong className="text-foreground">rolling average of the last 10 innings</strong>: recent form, enough data to be meaningful, and updates as new matches are added.
          </p>
          <ul className="space-y-2 font-['Inter'] text-muted-foreground">
            <li>· Recent form focus</li>
            <li>· Same window for all players</li>
            <li>· Recency reflected in the trend chart</li>
          </ul>
        </motion.section>

        <motion.section
          className="bg-card rounded-xl p-8 border border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-['Poppins'] font-semibold text-2xl text-foreground mb-4">Assumptions & robustness</h2>
          <p className="font-['Inter'] text-muted-foreground leading-relaxed mb-4">
            The metric assumes normalized inputs and a consistent definition of pressure/context from your pipeline. Edge cases (few innings, role mix, weather) can be handled in the backend before exposure here.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
