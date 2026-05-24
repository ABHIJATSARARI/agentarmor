import React from 'react';
import AnimatedCounter from './AnimatedCounter';

export default function MetricCard({ label, value, sub, icon, color }) {
  const isNumber = typeof value === 'number';

  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-label">
        <span>{icon}</span>
        {label}
      </div>
      <div className={`metric-value ${color}`}>
        {isNumber ? <AnimatedCounter value={value} /> : value}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
