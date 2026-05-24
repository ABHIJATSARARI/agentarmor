import React from 'react';

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--:--';
  }
}

function typeLabel(eventType) {
  const map = {
    prompt_injection: '💉 INJECTION',
    identity_spoofing: '🎭 SPOOFING',
    privilege_escalation: '⬆️ ESCALATION',
    data_exfiltration: '📤 EXFILTRATION',
    encoded_attack: '🔐 ENCODED',
    social_engineering: '🎣 SOCIAL ENG',
    behavioral_anomaly: '📊 ANOMALY',
    honeypot_trap: '🍯 HONEYPOT',
    immune_propagation: '🧬 IMMUNE',
    status_restored: '✅ RESTORED',
    manual_scan: '🔍 CONSOLE SCAN',
  };
  return map[eventType] || `⚡ ${eventType.toUpperCase().replace(/_/g, ' ')}`;
}

export default function ThreatFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="icon">📡</span> Threat Feed</div>
          <span className="card-badge badge-live">LIVE</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <div className="empty-state-text">Monitoring... No threats detected yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="icon">📡</span> Threat Feed</div>
        <span className="card-badge badge-live">LIVE</span>
      </div>
      <div className="threat-feed">
        {events.map((event, idx) => (
          <div key={event.id || idx} className={`threat-item ${event.severity}`}>
            <div className="threat-header">
              <span className={`threat-type ${event.severity}`}>
                {typeLabel(event.event_type)}
              </span>
              <span className="threat-time">{formatTime(event.timestamp)}</span>
            </div>
            <div className="threat-details">{event.details}</div>
            <div className="threat-agent">
              {event.blocked ? '⛔' : '✅'} {event.source_agent_name} — {event.action_taken}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
