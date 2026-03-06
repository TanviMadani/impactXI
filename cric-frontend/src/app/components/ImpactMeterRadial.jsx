import { motion } from 'motion/react';
import { getImpactColor, getImpactLabel } from '../lib/impactUtils';

export function ImpactMeterRadial({ score, size = 'md', showLabel = true }) {
  const sizes = {
    sm: { width: 120, strokeWidth: 8, fontSize: '1.5rem', labelSize: '0.75rem' },
    md: { width: 180, strokeWidth: 12, fontSize: '2.5rem', labelSize: '0.875rem' },
    lg: { width: 240, strokeWidth: 16, fontSize: '3.5rem', labelSize: '1rem' }
  };

  const { width, strokeWidth, fontSize, labelSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getImpactColor(score);
  const label = getImpactLabel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-['JetBrains_Mono'] font-bold"
            style={{ fontSize, color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-['Inter']">Impact Score</span>
        </div>
      </div>
      {showLabel && (
        <div
          className="px-3 py-1 rounded-full font-['Inter'] font-medium"
          style={{
            backgroundColor: `${color}20`,
            color,
            fontSize: labelSize
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
