import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Users, Trophy } from 'lucide-react';
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
      <MethodologyContent embedMode />
    </div>
  );
}
