import React, { useState, useCallback } from 'react';
import { fetchAPI } from '../utils/api';
import { QUICK_ATTACKS } from '../utils/constants';
import RiskGauge from './RiskGauge';

export default function AttackConsole({ onScanResult }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState([]);

  const handleScan = useCallback(async () => {
    if (!input.trim() || scanning) return;
    setScanning(true);
    setResult(null);

    // Notify parent for pipeline animation
    onScanResult?.(null, true);

    try {
      const res = await fetchAPI('/api/scan', {
        method: 'POST',
        body: JSON.stringify({ text: input }),
      });
      setResult(res);
      onScanResult?.(res, false);

      // Add to history
      setHistory((prev) => [
        { text: input.substring(0, 50), verdict: res.verdict, score: res.risk_score, time: new Date().toLocaleTimeString() },
        ...prev,
      ].slice(0, 10));
    } catch (err) {
      setResult({ error: err.message });
      onScanResult?.(null, false);
    }
    setScanning(false);
  }, [input, scanning, onScanResult]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleScan();
  };

  const confClass = (conf) => {
    if (conf >= 0.8) return 'high';
    if (conf >= 0.5) return 'medium';
    return 'low';
  };

  return (
    <div className="card attack-console">
      <div className="card-header">
        <div className="card-title"><span className="icon">⚡</span> Attack Console</div>
        <span className="card-badge badge-active">INTERACTIVE</span>
      </div>

      <div className="console-input-area">
        <div className="quick-attacks">
          {QUICK_ATTACKS.map((atk, i) => (
            <button
              key={i}
              className="quick-attack-btn"
              onClick={() => setInput(atk.text)}
            >
              {atk.label}
            </button>
          ))}
        </div>

        <textarea
          className="console-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste a potential prompt injection attack here...&#10;Press Ctrl+Enter or click SCAN to analyze."
          spellCheck={false}
        />

        <button
          className={`scan-btn ${scanning ? 'scanning' : ''}`}
          onClick={handleScan}
          disabled={scanning || !input.trim()}
        >
          {scanning ? '⏳ Scanning...' : '🛡️ Scan Input'}
        </button>
      </div>

      {result && !result.error && (
        <div className="scan-result">
          {/* Gauge + Verdict side by side */}
          <div className="result-top">
            <div className="result-gauge">
              <RiskGauge score={result.risk_score} verdict={result.verdict} size={110} />
            </div>
            <div className="result-verdict-info">
              <div className={`verdict-label ${result.verdict}`}>
                {result.verdict === 'MALICIOUS' && '⛔ '}
                {result.verdict === 'SUSPICIOUS' && '⚠️ '}
                {result.verdict === 'CLEAN' && '✅ '}
                {result.verdict}
              </div>
              <div className="result-explanation">{result.explanation}</div>
              {result.immune_match && (
                <div className="immune-match-tag">
                  🧬 Immune Memory Match: "{result.immune_match}"
                </div>
              )}
              <div className="scan-time">
                Scanned in {result.scan_time_ms}ms · {result.matched_strategies?.length || 0} indicators
              </div>
            </div>
          </div>

          {/* Strategies */}
          {result.matched_strategies && result.matched_strategies.length > 0 && (
            <div className="strategies-list">
              {result.matched_strategies.map((s, i) => (
                <div key={i} className="strategy-item">
                  <span className="strategy-name">
                    {s.strategy}: {s.details}
                  </span>
                  <span className={`strategy-confidence ${confClass(s.confidence)}`}>
                    {Math.round(s.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result && result.error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          ❌ Error: {result.error}
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="scan-history">
          <div className="scan-history-title">Recent Scans</div>
          {history.map((h, i) => (
            <div key={i} className="scan-history-item">
              <span className={`scan-history-verdict ${h.verdict}`}>
                {h.verdict === 'MALICIOUS' ? '⛔' : h.verdict === 'SUSPICIOUS' ? '⚠️' : '✅'}
              </span>
              <span className="scan-history-text">{h.text}...</span>
              <span className="scan-history-score" style={{
                color: h.score >= 70 ? 'var(--accent-red)' :
                  h.score >= 35 ? 'var(--accent-amber)' : 'var(--accent-green)'
              }}>{h.score}</span>
              <span className="scan-history-time">{h.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
