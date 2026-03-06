import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function TrendLineChart({ 
  data, 
  labels,
  color = 'var(--mined26-primary)',
  showBaseline = true
}) {
  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `G${index + 1}`,
    score: value
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="name" 
          stroke="var(--muted-foreground)"
          style={{ fontSize: '0.75rem', fontFamily: 'Inter' }}
        />
        <YAxis 
          domain={[0, 100]}
          stroke="var(--muted-foreground)"
          style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontSize: '0.875rem',
            color: 'var(--foreground)'
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        {showBaseline && (
          <ReferenceLine 
            y={50} 
            stroke="var(--impact-neutral)" 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Baseline', 
              position: 'right',
              style: { fontSize: '0.75rem', fill: 'var(--muted-foreground)' }
            }}
          />
        )}
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
