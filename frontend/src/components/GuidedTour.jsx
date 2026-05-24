import React, { useState, useEffect, useRef, useCallback } from 'react';

const TOUR_STEPS = [
  {
    target: '.header-brand',
    title: '🛡️ Welcome to AgentArmor',
    content: 'A three-layer biological immune system for AI agents. Inspired by how the human body defends against pathogens — applied to protecting AI agents from prompt injection, identity spoofing, and adversarial attacks.',
    position: 'bottom',
  },
  {
    target: '.pipeline-card',
    title: '🔄 Security Pipeline',
    content: 'Every input flows through 3 defense layers: Layer 1 (Injection Firewall) → Layer 2 (Behavioral Analysis) → Layer 3 (Immune Memory). Watch this animate in real-time when you scan an input!',
    position: 'bottom',
  },
  {
    target: '.metrics-row',
    title: '📊 Live Security Metrics',
    content: 'Real-time counters showing agents protected, attacks blocked, current threat level, and immune signatures generated. Numbers animate smoothly as the system operates.',
    position: 'bottom',
  },
  {
    target: '[data-tour="agent-monitor"]',
    title: '🤖 Agent Monitor',
    content: '6 AI agents are being monitored in real-time — Web Crawler, Mail Guard, Code Sentry, Data Miner, Support Bot, and File Ops. Click any agent to see its behavioral fingerprint radar chart.',
    position: 'right',
  },
  {
    target: '[data-tour="threat-feed"]',
    title: '📡 Live Threat Feed',
    content: 'Scrolling feed of all security events — attacks detected, anomalies flagged, agents quarantined, and immune signatures propagated. Events stream in via WebSocket in real-time.',
    position: 'left',
  },
  {
    target: '[data-tour="attack-console"]',
    title: '⚡ Interactive Attack Console',
    content: 'THE STAR FEATURE — Type any prompt injection attack and watch it get detected in real-time. Try the quick-attack buttons or type your own! The animated risk gauge shows the threat level.',
    position: 'left',
  },
  {
    target: '.simulate-section',
    title: '🎯 Attack Simulation',
    content: 'One-click buttons to trigger different attack types — Prompt Injection, Identity Spoofing, Privilege Escalation, Data Exfiltration. Watch the entire defense pipeline respond!',
    position: 'bottom',
  },
  {
    target: '[data-tour="honeypot"]',
    title: '🍯 Honeypot Agent',
    content: 'Layer 3 — A decoy agent that mimics vulnerability to attract attackers. It captures attack techniques, classifies them, and generates defense signatures for the immune memory.',
    position: 'top',
  },
  {
    target: '[data-tour="immune-memory"]',
    title: '🧬 Collective Immune Memory',
    content: 'When ONE agent is attacked, the defense signature propagates to ALL agents — providing instant collective immunity. The network graph shows agents connected to the central immune hub.',
    position: 'top',
  },
  {
    target: '[data-tour="detection-stats"]',
    title: '📊 Detection Analytics',
    content: 'Data-driven breakdown of detected threats by severity and event type. Shows which attack patterns are most common and how the system is performing.',
    position: 'top',
  },
];

export default function GuidedTour({ onComplete }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const tooltipRef = useRef(null);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const positionTooltip = useCallback(() => {
    if (!active || step >= TOUR_STEPS.length) return;

    const currentStep = TOUR_STEPS[step];
    const el = document.querySelector(currentStep.target);

    if (!el) {
      // Element not found, skip to next step
      if (step < TOUR_STEPS.length - 1) {
        setStep(step + 1);
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;

    // Spotlight position
    setSpotlightStyle({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Tooltip position
    const tooltipW = 380;
    const tooltipH = 200;
    let top, left;

    switch (currentStep.position) {
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'top':
        top = rect.top - tooltipH - 16;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.right + 16;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.left - tooltipW - 16;
        break;
      default:
        top = rect.bottom + 16;
        left = rect.left;
    }

    // Keep tooltip within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipH - 16));

    setTooltipStyle({ top, left, width: tooltipW });
  }, [active, step]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [positionTooltip]);

  // Scroll to element
  useEffect(() => {
    if (!active || step >= TOUR_STEPS.length) return;
    const el = document.querySelector(TOUR_STEPS[step].target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(positionTooltip, 400);
    }
  }, [step, active, positionTooltip]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setActive(false);
    onComplete?.();
  };

  if (!active || step >= TOUR_STEPS.length) return null;

  const currentStep = TOUR_STEPS[step];

  return (
    <div className="tour-overlay">
      {/* Dark backdrop with spotlight cutout */}
      <div className="tour-backdrop" onClick={handleClose} />

      {/* Spotlight highlight */}
      <div className="tour-spotlight" style={spotlightStyle} />

      {/* Tooltip */}
      <div className="tour-tooltip" style={tooltipStyle} ref={tooltipRef}>
        <div className="tour-tooltip-arrow" />
        <div className="tour-step-counter">
          {step + 1} / {TOUR_STEPS.length}
        </div>
        <h3 className="tour-title">{currentStep.title}</h3>
        <p className="tour-content">{currentStep.content}</p>
        <div className="tour-actions">
          <button className="tour-btn tour-btn-skip" onClick={handleClose}>
            Skip Tour
          </button>
          <div className="tour-nav">
            {step > 0 && (
              <button className="tour-btn tour-btn-prev" onClick={handlePrev}>
                ← Prev
              </button>
            )}
            <button className="tour-btn tour-btn-next" onClick={handleNext}>
              {step === TOUR_STEPS.length - 1 ? '✅ Finish' : 'Next →'}
            </button>
          </div>
        </div>
        {/* Progress dots */}
        <div className="tour-dots">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`tour-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
