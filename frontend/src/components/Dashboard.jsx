import React, { useState, useCallback } from 'react';
import MetricCard from './MetricCard';
import AgentMonitor from './AgentMonitor';
import ThreatFeed from './ThreatFeed';
import AttackConsole from './AttackConsole';
import BehaviorChart from './BehaviorChart';
import HoneypotView from './HoneypotView';
import ImmuneMemory from './ImmuneMemory';
import SecurityPipeline from './SecurityPipeline';
import DetectionStats from './DetectionStats';
import ExpandableCard from './ExpandableCard';
import { fetchAPI } from '../utils/api';
import { ATTACK_TYPES } from '../utils/constants';

export default function Dashboard({ metrics, agents, events, honeypot, immuneData, selectedAgent, onSelectAgent }) {
  const [pipelineResult, setPipelineResult] = useState(null);
  const [pipelineScanning, setPipelineScanning] = useState(false);

  const handleScanResult = useCallback((result, isScanning) => {
    setPipelineScanning(isScanning);
    if (result) setPipelineResult(result);
  }, []);

  const handleSimulate = async (attackType) => {
    try {
      await fetchAPI('/api/simulate/attack', {
        method: 'POST',
        body: JSON.stringify({ attack_type: attackType }),
      });
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const threatLevelColor = {
    LOW: 'green',
    MEDIUM: 'amber',
    HIGH: 'red',
    CRITICAL: 'red',
  };

  return (
    <div className="dashboard">
      {/* Metric Cards */}
      <div className="metrics-row">
        <MetricCard
          label="Agents Protected"
          value={metrics.agents_protected || 0}
          sub={`${metrics.agents_normal || 0} normal · ${metrics.agents_suspicious || 0} suspicious · ${metrics.agents_quarantined || 0} quarantined`}
          icon="🛡️"
          color="cyan"
        />
        <MetricCard
          label="Attacks Blocked"
          value={metrics.attacks_blocked || 0}
          sub={`${metrics.total_scans || 0} total scans · ${metrics.detection_rate || 0}% detection`}
          icon="⛔"
          color="red"
        />
        <MetricCard
          label="Threat Level"
          value={metrics.threat_level || 'LOW'}
          sub={`${metrics.events_last_hour || 0} events in current session`}
          icon="🚨"
          color={threatLevelColor[metrics.threat_level] || 'green'}
        />
        <MetricCard
          label="Immune Signatures"
          value={metrics.immune_signatures || 0}
          sub={`${metrics.honeypot_traps || 0} honeypot traps`}
          icon="🧬"
          color="amber"
        />
      </div>

      {/* Security Pipeline Visualization */}
      <SecurityPipeline scanResult={pipelineResult} scanning={pipelineScanning} />

      {/* Simulate Attack Buttons */}
      <div className="simulate-section">
        <span style={{
          fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)', alignSelf: 'center', marginRight: '8px'
        }}>
          SIMULATE ATTACK →
        </span>
        {ATTACK_TYPES.map((at) => (
          <button
            key={at.value}
            className="simulate-btn"
            onClick={() => handleSimulate(at.value)}
          >
            {at.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <ExpandableCard title="🤖 Agent Monitor" tourId="agent-monitor">
            <AgentMonitor
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={onSelectAgent}
            />
          </ExpandableCard>
          <ExpandableCard title="📊 Behavioral Fingerprint" tourId="behavior-chart">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span className="icon">📊</span> Behavioral Fingerprint</div>
                <span className="card-badge badge-active">CANVAS</span>
              </div>
              <BehaviorChart agent={selectedAgent} />
            </div>
          </ExpandableCard>
        </div>

        <ExpandableCard title="📡 Live Threat Feed" tourId="threat-feed">
          <ThreatFeed events={events} />
        </ExpandableCard>

        <ExpandableCard title="⚡ Attack Console" tourId="attack-console">
          <AttackConsole onScanResult={handleScanResult} />
        </ExpandableCard>
      </div>

      {/* Bottom Grid — 3 columns */}
      <div className="bottom-grid-3">
        <ExpandableCard title="🍯 Honeypot Agent" tourId="honeypot">
          <HoneypotView data={honeypot} />
        </ExpandableCard>
        <ExpandableCard title="🧬 Immune Memory" tourId="immune-memory">
          <ImmuneMemory
            signatures={immuneData?.signatures}
            agents={agents}
          />
        </ExpandableCard>
        <ExpandableCard title="📊 Detection Analytics" tourId="detection-stats">
          <DetectionStats events={events} />
        </ExpandableCard>
      </div>
    </div>
  );
}
