import { motion } from 'motion/react';

export function BreakdownBars({ performance, context, pressure }) {
  const components = [
    { label: 'Performance', value: performance, color: 'var(--mined26-primary)' },
    { label: 'Match Context', value: context, color: 'var(--mined26-accent)' },
    { label: 'Pressure', value: pressure, color: 'var(--mined26-highlight)' }
  ];

  return (
    <div className="space-y-4">
      {components.map((component, index) => (
        <div key={component.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-['Inter'] text-sm text-muted-foreground">{component.label}</span>
            <span className="font-['JetBrains_Mono'] font-semibold text-sm">{component.value}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: component.color }}
              initial={{ width: 0 }}
              animate={{ width: `${component.value}%` }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
