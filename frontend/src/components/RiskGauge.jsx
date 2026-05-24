import React, { useRef, useEffect } from 'react';

/**
 * Animated circular risk score gauge with color transitions.
 */
export default function RiskGauge({ score, verdict, size = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    const lineWidth = 8;

    // Animate the arc
    let currentAngle = 0;
    const targetAngle = (score / 100) * 1.5 * Math.PI; // 270 degrees max
    const startAngle = 0.75 * Math.PI; // Start from bottom-left

    const getColor = (s) => {
      if (s >= 70) return '#ff3366';
      if (s >= 35) return '#ffaa00';
      return '#00ff88';
    };

    const getGlowColor = (s) => {
      if (s >= 70) return 'rgba(255, 51, 102, 0.3)';
      if (s >= 35) return 'rgba(255, 170, 0, 0.3)';
      return 'rgba(0, 255, 136, 0.3)';
    };

    const color = getColor(score);
    const glowColor = getGlowColor(score);

    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Background track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + 1.5 * Math.PI);
      ctx.strokeStyle = 'rgba(136, 153, 180, 0.1)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (i / 10) * 1.5 * Math.PI;
        const innerR = radius - lineWidth / 2 - 3;
        const outerR = radius - lineWidth / 2 - (i % 5 === 0 ? 8 : 5);
        ctx.beginPath();
        ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
        ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
        ctx.strokeStyle = 'rgba(136, 153, 180, 0.2)';
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Animated progress arc
      if (currentAngle < targetAngle) {
        currentAngle += (targetAngle - currentAngle) * 0.08 + 0.01;
        if (currentAngle > targetAngle) currentAngle = targetAngle;
      }

      if (currentAngle > 0) {
        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + currentAngle);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = lineWidth + 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + currentAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // End dot
        const endAngle = startAngle + currentAngle;
        ctx.beginPath();
        ctx.arc(
          cx + radius * Math.cos(endAngle),
          cy + radius * Math.sin(endAngle),
          4, 0, 2 * Math.PI
        );
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Center text — score
      ctx.fillStyle = color;
      ctx.font = `bold ${size * 0.28}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(score), cx, cy - 4);

      // Sub text
      ctx.fillStyle = 'rgba(136, 153, 180, 0.8)';
      ctx.font = `500 ${size * 0.1}px 'Inter', sans-serif`;
      ctx.fillText('RISK', cx, cy + size * 0.16);

      if (currentAngle < targetAngle) {
        frame = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [score, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}
