import { getImpactColor } from '../lib/impactUtils';

export function ImpactBadge({ score, size = 'md' }) {
  const color = getImpactColor(score);
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-['JetBrains_Mono'] font-semibold ${sizes[size]}`}
      style={{
        backgroundColor: `${color}20`,
        color
      }}
    >
      {score}
    </div>
  );
}
