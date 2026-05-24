import React from 'react';

export default function HoneypotView({ data }) {
  if (!data) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="icon">🍯</span> Honeypot Agent</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🍯</div>
          <div className="empty-state-text">Loading honeypot data...</div>
        </div>
      </div>
    );
  }

  const techniques = data.techniques_observed || {};
  const recentAttacks = data.recent_attacks || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="icon">🍯</span> Honeypot Agent</div>
        <span className="card-badge badge-live">
          {data.is_deployed ? 'DEPLOYED' : 'OFFLINE'}
        </span>
      </div>

      <div className="honeypot-stats">
        <div className="honeypot-stat">
          <div className="honeypot-stat-value">{data.total_traps || 0}</div>
          <div className="honeypot-stat-label">Traps Sprung</div>
        </div>
        <div className="honeypot-stat">
          <div className="honeypot-stat-value">{data.signatures_generated || 0}</div>
          <div className="honeypot-stat-label">Signatures</div>
        </div>
        <div className="honeypot-stat">
          <div className="honeypot-stat-value">{Object.keys(techniques).length}</div>
          <div className="honeypot-stat-label">Techniques</div>
        </div>
      </div>

      {Object.keys(techniques).length > 0 && (
        <div className="honeypot-techniques">
          {Object.entries(techniques).map(([tech, count]) => (
            <span key={tech} className="technique-tag">
              {tech}<span className="technique-count"> ×{count}</span>
            </span>
          ))}
        </div>
      )}

      {recentAttacks.length > 0 && (
        <div className="honeypot-log">
          {recentAttacks.map((atk) => (
            <div key={atk.id} className="honeypot-log-item">
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                [{atk.attacker_technique}]
              </span>{' '}
              {atk.attack_text?.substring(0, 60)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
