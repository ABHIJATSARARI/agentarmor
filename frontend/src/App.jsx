import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from './components/Dashboard';
import GuidedTour from './components/GuidedTour';
import { fetchAPI, WebSocketManager } from './utils/api';
import { POLL_INTERVAL } from './utils/constants';

export default function App() {
  const [metrics, setMetrics] = useState({});
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [honeypot, setHoneypot] = useState(null);
  const [immuneData, setImmuneData] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [connected, setConnected] = useState(false);
  const [showTour, setShowTour] = useState(true);
  const wsRef = useRef(null);

  // Fetch initial data and poll for updates
  const fetchAll = useCallback(async () => {
    try {
      const [metricsRes, agentsRes, threatsRes, honeypotRes, immuneRes] = await Promise.all([
        fetchAPI('/api/metrics'),
        fetchAPI('/api/agents'),
        fetchAPI('/api/threats'),
        fetchAPI('/api/honeypot'),
        fetchAPI('/api/immune-memory'),
      ]);
      setMetrics(metricsRes);
      setAgents(agentsRes.agents || []);
      setEvents(threatsRes.events || []);
      setHoneypot(honeypotRes);
      setImmuneData(immuneRes);

      // Update selected agent if it exists
      if (selectedAgent) {
        const updated = (agentsRes.agents || []).find(a => a.id === selectedAgent.id);
        if (updated) setSelectedAgent(updated);
      }
    } catch (err) {
      console.error('[AgentArmor] Fetch error:', err);
    }
  }, [selectedAgent]);

  // WebSocket for real-time events
  useEffect(() => {
    const ws = new WebSocketManager((message) => {
      if (message.type === 'threat_event') {
        setEvents((prev) => {
          const updated = [message.data, ...prev];
          return updated.slice(0, 50);
        });
        // Refresh metrics on threat events
        fetchAPI('/api/metrics').then(setMetrics).catch(() => {});
        fetchAPI('/api/agents').then(r => {
          setAgents(r.agents || []);
          setSelectedAgent(prev => {
            if (prev) {
              const updated = (r.agents || []).find(a => a.id === prev.id);
              return updated || prev;
            }
            return prev;
          });
        }).catch(() => {});
        fetchAPI('/api/immune-memory').then(setImmuneData).catch(() => {});
        fetchAPI('/api/honeypot').then(setHoneypot).catch(() => {});
      }
      setConnected(true);
    });

    ws.connect();
    wsRef.current = ws;

    return () => ws.disconnect();
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Select first agent by default
  useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🛡️</div>
          <div>
            <div className="header-title">AgentArmor</div>
            <div className="header-subtitle">Immune System for AI Agents</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="tour-restart-btn"
            onClick={() => setShowTour(true)}
            title="Restart guided tour"
          >
            <span>🎯</span> Tour
          </button>
          <div className="header-status">
            <span className="status-dot" />
            SYSTEMS OPERATIONAL
          </div>
          <div className="header-team">
            Team Srapid · Built by Abhijat
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <Dashboard
        metrics={metrics}
        agents={agents}
        events={events}
        honeypot={honeypot}
        immuneData={immuneData}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

      {/* Guided Tour */}
      {showTour && (
        <GuidedTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}
