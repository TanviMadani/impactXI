import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function MatchesPage() {
  const [matchId, setMatchId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = matchId.trim();
    if (id) navigate(`/matches/${id}`);
  };

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
              placeholder="e.g. 12345"
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

        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="font-['Inter'] text-sm text-muted-foreground">
            Match IDs come from your data pipeline. If you have a list of matches, it can be added here. For now, use a known match ID to see top batting/bowling impact and context.
          </p>
        </div>
      </div>
    </div>
  );
}
