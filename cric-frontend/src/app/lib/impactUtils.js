// Impact Meter helpers – used by gauge, badge, and cards

export function getImpactColor(score) {
  if (score >= 70) return 'var(--impact-high)';
  if (score >= 50) return 'var(--impact-neutral)';
  return 'var(--impact-low)';
}

export function getImpactLabel(score) {
  if (score >= 80) return 'Elite';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'Above Average';
  if (score >= 50) return 'Neutral';
  if (score >= 40) return 'Below Average';
  return 'Weak';
}
