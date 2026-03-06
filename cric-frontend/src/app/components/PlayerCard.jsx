import { Link } from 'react-router';
import { motion } from 'motion/react';
import { TrendSparkline } from './TrendSparkline';
import { ImpactBadge } from './ImpactBadge';
import { User } from 'lucide-react';

export function PlayerCard({ player, trend = [] }) {
  const score = player.currentIM ?? player.im ?? player.impactScore ?? 0;
  const id = player.playerId ?? player.id;

  return (
    <Link to={`/players/${id}`}>
      <motion.div
        className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-['Poppins'] font-semibold text-lg text-foreground mb-1 truncate">
              {player.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="font-['Inter'] truncate">{player.team || '—'}</span>
              {player.band && (
                <>
                  <span>·</span>
                  <span className="font-['Inter']">{player.band}</span>
                </>
              )}
            </div>
          </div>
          <ImpactBadge score={score} size="lg" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1 font-['Inter']">Last 10 innings</div>
            {trend.length > 0 ? (
              <TrendSparkline data={trend} color="var(--chart-1)" />
            ) : (
              <div className="h-6 flex items-center text-xs text-muted-foreground font-['Inter']">
                View profile for trend
              </div>
            )}
          </div>
        </div>

        {(player.asOfDate || player.innings) != null && (
          <div className="mt-4 pt-3 border-t border-border flex gap-4 text-xs text-muted-foreground font-['Inter']">
            {player.asOfDate && (
              <span>Updated {player.asOfDate}</span>
            )}
            {player.innings != null && (
              <span><span className="font-medium text-foreground">{player.innings}</span> innings</span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
