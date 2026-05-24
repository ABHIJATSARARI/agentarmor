import React, { useRef, useEffect } from 'react';

const DIMENSIONS = [
  { key: 'api_frequency', label: 'API Freq' },
  { key: 'response_time', label: 'Resp Time' },
  { key: 'action_diversity', label: 'Action Div' },
  { key: 'error_rate', label: 'Error Rate' },
  { key: 'resource_access', label: 'Resource' },
  { key: 'data_volume', label: 'Data Vol' },
];

function normalizeProfile(profile, baseline) {
  // Normalize each dimension relative to baseline (0-1 scale)
  return DIMENSIONS.map(({ key }) => {
    const base = baseline[key] || 1;
    const val = profile[key] || 0;
    return Math.min(val / (base * 2), 1); // Scale so baseline is at 0.5
  });
}

export default function BehaviorChart({ agent }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !agent) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(cx, cy) - 30;

    ctx.clearRect(0, 0, W, H);

    const n = DIMENSIONS.length;
    const angleStep = (2 * Math.PI) / n;

    // Draw grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines & labels
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + maxR * Math.cos(angle);
      const y = cy + maxR * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.stroke();

      // Label
      const lx = cx + (maxR + 18) * Math.cos(angle);
      const ly = cy + (maxR + 18) * Math.sin(angle);
      ctx.fillStyle = '#8899b4';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(DIMENSIONS[i].label, lx, ly);
    }

    // Helper to draw a polygon
    function drawPoly(values, fillColor, strokeColor, lineWidth) {
      ctx.beginPath();
      values.forEach((val, i) => {
        const r = val * maxR;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw dots
      values.forEach((val, i) => {
        const r = val * maxR;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      });
    }

    if (agent.baseline_profile && agent.current_profile) {
      const baselineVals = normalizeProfile(agent.baseline_profile, agent.baseline_profile);
      const currentVals = normalizeProfile(agent.current_profile, agent.baseline_profile);

      // Draw baseline
      drawPoly(baselineVals, 'rgba(0, 240, 255, 0.08)', 'rgba(0, 240, 255, 0.5)', 1.5);
      // Draw current
      drawPoly(currentVals, 'rgba(255, 170, 0, 0.1)', 'rgba(255, 170, 0, 0.8)', 2);
    }
  }, [agent]);

  if (!agent) {
    return (
      <div className="behavior-chart-container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Select an agent to view behavioral fingerprint</div>
        </div>
      </div>
    );
  }

  return (
    <div className="behavior-chart-container">
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="behavior-canvas"
      />
      <div className="behavior-legend">
        <div className="legend-item">
          <div className="legend-dot baseline" />
          <span style={{ color: 'var(--text-secondary)' }}>Baseline</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot current" />
          <span style={{ color: 'var(--text-secondary)' }}>Current</span>
        </div>
      </div>
      <div style={{
        fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        {agent.name} — Status: <span style={{
          color: agent.status === 'normal' ? 'var(--accent-green)' :
            agent.status === 'suspicious' ? 'var(--accent-amber)' : 'var(--accent-red)',
          fontWeight: 700
        }}>{agent.status.toUpperCase()}</span>
      </div>
    </div>
  );
}
