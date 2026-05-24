import React, { useRef, useEffect } from 'react';

export default function ImmuneMemory({ signatures, agents }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !agents || agents.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Draw agent nodes in a circle
    const agentCount = agents.length;
    const radius = Math.min(W, H) / 2 - 40;
    const nodes = [];

    agents.forEach((agent, i) => {
      const angle = (i / agentCount) * 2 * Math.PI - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      nodes.push({ x, y, agent });

      // Connection lines to center (immune memory hub)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Agent node
      const statusColor = agent.status === 'normal'
        ? '#00ff88'
        : agent.status === 'suspicious'
        ? '#ffaa00'
        : '#ff3366';

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, 2 * Math.PI);
      ctx.fillStyle = statusColor.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('#', '');
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
      gradient.addColorStop(0, `${statusColor}33`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = `${statusColor}44`;
      ctx.fill();
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#8899b4';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(agent.name.split('-')[0], x, y + 16);
    });

    // Central hub
    const hubGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    hubGradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    hubGradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hub icon
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧬', cx, cy);

    // Draw propagation indicators (animated arcs between signature count)
    const sigCount = signatures?.length || 0;
    if (sigCount > 0) {
      nodes.forEach(({ x, y }) => {
        // Small immunity indicator
        ctx.beginPath();
        ctx.arc(x + 12, y - 8, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
      });
    }

  }, [agents, signatures]);

  const sigList = signatures || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="icon">🧬</span> Immune Memory</div>
        <span className="card-badge badge-active">{sigList.length} SIGS</span>
      </div>

      <div className="immune-network">
        <canvas
          ref={canvasRef}
          width={460}
          height={200}
          className="immune-canvas"
        />
      </div>

      {sigList.length > 0 ? (
        <div className="immune-signatures">
          {sigList.slice(-10).reverse().map((sig) => (
            <div key={sig.id} className="sig-item">
              <span className="sig-pattern" title={sig.pattern}>
                {sig.pattern}
              </span>
              <span className="sig-propagation">
                📡 {sig.propagated_to?.length || 0}
              </span>
              <span className="sig-frequency">
                ×{sig.frequency}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', color: 'var(--text-muted)',
          fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
          padding: 'var(--space-md)'
        }}>
          No signatures yet — awaiting first attack detection
        </div>
      )}
    </div>
  );
}
