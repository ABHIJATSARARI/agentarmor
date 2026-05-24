import React from 'react';

/**
 * Shows breakdown of detection strategies that have been firing.
 */
export default function DetectionStats({ events }) {
  // Count event types from threat feed
  const typeCounts = {};
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  (events || []).forEach((e) => {
    const type = e.event_type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    const sev = e.severity || 'info';
    if (severityCounts[sev] !== undefined) severityCounts[sev]++;
  });

  const total = events?.length || 0;

  const typeLabels = {
    prompt_injection: { icon: '💉', label: 'Prompt Injection' },
    identity_spoofing: { icon: '🎭', label: 'Identity Spoofing' },
    privilege_escalation: { icon: '⬆️', label: 'Privilege Escalation' },
    data_exfiltration: { icon: '📤', label: 'Data Exfiltration' },
    encoded_attack: { icon: '🔐', label: 'Encoded Attack' },
    social_engineering: { icon: '🎣', label: 'Social Engineering' },
    behavioral_anomaly: { icon: '📊', label: 'Behavioral Anomaly' },
    honeypot_trap: { icon: '🍯', label: 'Honeypot Trap' },
    immune_propagation: { icon: '🧬', label: 'Immune Update' },
    status_restored: { icon: '✅', label: 'Status Restored' },
    manual_scan: { icon: '🔍', label: 'Console Scan' },
  };

  const sortedTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const severityBars = [
    { key: 'critical', color: '#ff3366', label: 'Critical' },
    { key: 'high', color: '#ff6b35', label: 'High' },
    { key: 'medium', color: '#ffaa00', label: 'Medium' },
    { key: 'info', color: '#00f0ff', label: 'Info' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="icon">📊</span> Detection Analytics</div>
        <span className="card-badge badge-active">{total} EVENTS</span>
      </div>

      {/* Severity breakdown bar */}
      <div className="severity-bar-container">
        <div className="severity-bar">
          {severityBars.map(({ key, color }) => {
            const width = total > 0 ? (severityCounts[key] / total) * 100 : 0;
            return width > 0 ? (
              <div
                key={key}
                className="severity-bar-segment"
                style={{ width: `${width}%`, background: color }}
                title={`${key}: ${severityCounts[key]}`}
              />
            ) : null;
          })}
        </div>
        <div className="severity-bar-labels">
          {severityBars.map(({ key, color, label }) => (
            <span key={key} className="severity-bar-label">
              <span className="severity-dot" style={{ background: color }} />
              {label}: {severityCounts[key]}
            </span>
          ))}
        </div>
      </div>

      {/* Event type breakdown */}
      <div className="detection-types">
        {sortedTypes.map(([type, count]) => {
          const info = typeLabels[type] || { icon: '⚡', label: type.replace(/_/g, ' ') };
          const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
          return (
            <div key={type} className="detection-type-row">
              <span className="detection-type-icon">{info.icon}</span>
              <span className="detection-type-label">{info.label}</span>
              <div className="detection-type-bar-bg">
                <div
                  className="detection-type-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="detection-type-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
