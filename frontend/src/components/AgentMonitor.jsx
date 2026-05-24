import React from 'react';

export default function AgentMonitor({ agents, selectedAgent, onSelectAgent }) {
  if (!agents || agents.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="icon">🤖</span> Agent Monitor</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <div className="empty-state-text">No agents detected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="icon">🤖</span> Agents</div>
        <span className="card-badge badge-live">LIVE</span>
      </div>
      <div className="agent-list">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`agent-item ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
            onClick={() => onSelectAgent(agent)}
          >
            <div className={`agent-status-dot ${agent.status}`} />
            <div className="agent-info">
              <div className="agent-name">{agent.name}</div>
              <div className="agent-activity">{agent.current_activity}</div>
            </div>
            {agent.attacks_blocked > 0 && (
              <div className="agent-attacks">⛔ {agent.attacks_blocked}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
