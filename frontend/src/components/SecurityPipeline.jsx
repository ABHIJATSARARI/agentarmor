import React, { useState, useEffect } from 'react';

/**
 * Visual pipeline showing input flowing through Layer 1 → Layer 2 → Layer 3.
 * Animates in sequence when a scan result is provided.
 */

const LAYERS = [
  {
    id: 'input',
    icon: '📥',
    label: 'INPUT',
    desc: 'Incoming text',
    color: '#8899b4',
  },
  {
    id: 'layer1',
    icon: '🧱',
    label: 'LAYER 1',
    desc: 'Injection Firewall',
    color: '#00f0ff',
    detail: '5 detection strategies',
  },
  {
    id: 'layer2',
    icon: '🔬',
    label: 'LAYER 2',
    desc: 'Behavioral Analysis',
    color: '#a855f7',
    detail: '6-dim fingerprint',
  },
  {
    id: 'layer3',
    icon: '🧬',
    label: 'LAYER 3',
    desc: 'Immune Memory',
    color: '#ffaa00',
    detail: 'Collective immunity',
  },
  {
    id: 'output',
    icon: '✅',
    label: 'OUTPUT',
    desc: 'Verdict',
    color: '#00ff88',
  },
];

export default function SecurityPipeline({ scanResult, scanning }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (scanning) {
      setCompleted(false);
      setActiveStep(0);
      // Animate through layers
      const timers = [];
      for (let i = 1; i < LAYERS.length; i++) {
        timers.push(setTimeout(() => setActiveStep(i), i * 400));
      }
      timers.push(setTimeout(() => setCompleted(true), LAYERS.length * 400));
      return () => timers.forEach(clearTimeout);
    }
  }, [scanning]);

  useEffect(() => {
    if (scanResult && !scanning) {
      setActiveStep(LAYERS.length - 1);
      setCompleted(true);
    }
  }, [scanResult, scanning]);

  const getNodeStatus = (index) => {
    if (!scanResult || !completed) {
      if (index <= activeStep) return 'processing';
      return 'idle';
    }

    // Completed scan — show results per layer
    if (index === 0) return 'passed'; // Input always passes through
    if (index === 1) {
      // Layer 1: Injection firewall result
      if (scanResult.verdict === 'MALICIOUS') return 'blocked';
      if (scanResult.verdict === 'SUSPICIOUS') return 'warning';
      return 'passed';
    }
    if (index === 2) return 'passed'; // Layer 2 always processes
    if (index === 3) {
      // Layer 3: Immune memory
      if (scanResult.immune_match) return 'matched';
      return 'passed';
    }
    if (index === 4) {
      // Output
      if (scanResult.verdict === 'MALICIOUS') return 'blocked';
      if (scanResult.verdict === 'SUSPICIOUS') return 'warning';
      return 'passed';
    }
    return 'idle';
  };

  const statusColors = {
    idle: 'rgba(136, 153, 180, 0.3)',
    processing: '#00f0ff',
    passed: '#00ff88',
    blocked: '#ff3366',
    warning: '#ffaa00',
    matched: '#a855f7',
  };

  const statusLabels = {
    passed: '✅ PASSED',
    blocked: '⛔ BLOCKED',
    warning: '⚠️ FLAGGED',
    matched: '🧬 MATCHED',
    processing: '⏳ SCANNING',
    idle: '○ WAITING',
  };

  return (
    <div className="card pipeline-card">
      <div className="card-header">
        <div className="card-title"><span className="icon">🔄</span> Security Pipeline</div>
        <span className="card-badge badge-active">3-LAYER DEFENSE</span>
      </div>

      <div className="pipeline-container">
        {LAYERS.map((layer, index) => {
          const status = getNodeStatus(index);
          const color = status === 'idle' ? statusColors.idle : statusColors[status];
          const isActive = index <= activeStep;

          return (
            <React.Fragment key={layer.id}>
              {/* Node */}
              <div className={`pipeline-node ${status} ${isActive ? 'active' : ''}`}>
                <div
                  className="pipeline-node-circle"
                  style={{
                    borderColor: color,
                    boxShadow: isActive ? `0 0 16px ${color}44, 0 0 32px ${color}22` : 'none',
                  }}
                >
                  <span className="pipeline-node-icon">{layer.icon}</span>
                </div>
                <div className="pipeline-node-label">{layer.label}</div>
                <div className="pipeline-node-desc">{layer.desc}</div>
                {layer.detail && (
                  <div className="pipeline-node-detail">{layer.detail}</div>
                )}
                {completed && index > 0 && index < 4 && (
                  <div className="pipeline-status-tag" style={{ color, borderColor: `${color}66`, backgroundColor: `${color}15` }}>
                    {statusLabels[status]}
                  </div>
                )}
                {completed && index === 4 && scanResult && (
                  <div
                    className="pipeline-status-tag"
                    style={{
                      color,
                      borderColor: `${color}66`,
                      backgroundColor: `${color}15`,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                    }}
                  >
                    {scanResult.verdict} — {scanResult.risk_score}/100
                  </div>
                )}
              </div>

              {/* Connector */}
              {index < LAYERS.length - 1 && (
                <div className="pipeline-connector">
                  <div
                    className="pipeline-connector-line"
                    style={{
                      background: index < activeStep
                        ? `linear-gradient(90deg, ${statusColors[getNodeStatus(index)]}, ${statusColors[getNodeStatus(index + 1)]})`
                        : 'rgba(136, 153, 180, 0.15)',
                    }}
                  />
                  {index < activeStep && (
                    <div
                      className="pipeline-connector-dot"
                      style={{ background: statusColors[getNodeStatus(index + 1)] }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Scan time */}
      {completed && scanResult && (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          marginTop: '8px',
        }}>
          Full pipeline scan completed in {scanResult.scan_time_ms}ms
          {scanResult.matched_strategies?.length > 0 &&
            ` · ${scanResult.matched_strategies.length} threat indicators detected`
          }
        </div>
      )}
    </div>
  );
}
