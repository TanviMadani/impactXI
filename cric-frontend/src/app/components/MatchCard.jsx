import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy } from 'lucide-react';

export function MatchCard({ match }) {
  const formattedDate = new Date(match.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link to={`/matches/${match.id}`}>
      <motion.div
        className="bg-white rounded-xl p-5 border border-border hover:shadow-lg transition-all cursor-pointer"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-['Poppins'] font-semibold text-lg">{match.team1}</span>
              <span className="text-muted-foreground">vs</span>
              <span className="font-['Poppins'] font-semibold text-lg">{match.team2}</span>
            </div>
          </div>
          {match.closeFinish && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--mined26-highlight)]/20 text-xs font-['Inter'] font-medium" style={{ color: 'var(--mined26-highlight)' }}>
              <Trophy className="h-3 w-3" />
              Close Finish
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground font-['Inter']">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{match.venue}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-['Inter']">
            Season: <span className="font-medium text-foreground">{match.season}</span>
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
