# 🛡️ AgentArmor — Immune System for AI Agents

> **Team Srapid** | Built by **Abhijat** | Microsoft Build AI Hackathon 2025  
> Track: **Security in the Agentic Future**

### 🌐 [Live Demo → agentarmor.vercel.app](https://agentarmor.vercel.app/)

---


## 🧬 Problem Statement

As AI agents proliferate — browsing the web, processing emails, managing files, and making autonomous decisions — they become prime targets for a new class of attacks:

- **Prompt Injection**: Malicious instructions hidden in inputs that hijack agent behavior
- **Identity Spoofing**: Attackers impersonating trusted agents or users
- **Privilege Escalation**: Agents being tricked into accessing resources beyond their scope
- **Data Exfiltration**: Sensitive data leaked through manipulated agent actions

Traditional cybersecurity tools (firewalls, antivirus, WAFs) are not designed for this threat landscape. **There is no standardized security framework for protecting AI agents.**

## 💡 Solution Overview

**AgentArmor** is a three-layer biological immune system for AI agents, inspired by how the human body defends against pathogens:

| Layer | Name | Biological Analog | What It Does |
|-------|------|-------------------|-------------|
| **Layer 1** | Prompt Injection Firewall | Skin barrier | Multi-strategy detection engine that scans ALL inputs before they reach agents |
| **Layer 2** | Behavioral Immune System | Innate immunity | Builds behavioral fingerprints per agent and detects anomalies in real-time |
| **Layer 3** | Collective Immunity | Adaptive immunity | Honeypot agents trap attackers + immune memory propagates defenses to all agents |

### Key Innovation: Collective Immunity
When **one agent** is attacked, the attack signature is captured, analyzed, and **propagated to ALL agents** in the network — providing instant collective immunity. Attack one, defend all.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard (Vite)                     │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Agent    │ │  Threat   │ │  Attack  │ │    Immune     │  │
│  │  Monitor  │ │  Feed     │ │  Console │ │    Memory     │  │
│  └──────────┘ └───────────┘ └──────────┘ └───────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                    Python FastAPI Backend                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Security Engine Pipeline                    │ │
│  │  ┌──────────┐  ┌───────────────┐  ┌──────────────────┐ │ │
│  │  │ Layer 1  │  │   Layer 2     │  │    Layer 3       │ │ │
│  │  │ Injection│──│ Behavioral    │──│ Honeypot +       │ │ │
│  │  │ Firewall │  │ Anomaly Det.  │  │ Immune Memory    │ │ │
│  │  └──────────┘  └───────────────┘  └──────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Agent Simulator (6 Live Agents)               │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🤖 AI Integration Details

### Layer 1: Multi-Strategy Prompt Injection Detection
- **5 detection strategies** running in parallel:
  - Pattern Matching (30+ injection patterns)
  - Encoding Detection (Base64, Unicode, HTML entities, hex)
  - Structural Analysis (imperative commands, role reassignment, context splitting)
  - Entropy Analysis (Shannon entropy for obfuscated payloads)
  - Zero-Width Character Detection (steganographic attacks)
- Returns: risk score (0-100), verdict, matched strategies, explanation
- **Sub-50ms latency** — does not slow down agent processing

### Layer 2: Behavioral Fingerprinting & Anomaly Detection
- Builds a 6-dimensional behavioral baseline per agent:
  - API call frequency, response time, action diversity, error rate, resource access, data volume
- Real-time deviation scoring with weighted anomaly detection
- Automatic status transitions: Normal → Suspicious → Quarantined
- Self-healing: agents auto-recover when behavior normalizes

### Layer 3: Honeypot + Collective Immune Memory
- **Honeypot Agent**: Decoy that mimics a vulnerable agent, engages attackers, and captures attack techniques
- **Immune Memory**: Stores all attack signatures with metadata
- **Propagation Network**: When an attack is detected, the signature is broadcast to ALL agents
- **Immunity Check**: New inputs are cross-referenced against known signatures for instant blocking

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| Frontend | React 18, Vite 5, Canvas API |
| Real-time | WebSocket (native) |
| Styling | Custom CSS (dark cybersecurity theme, glassmorphism) |
| Fonts | Inter, JetBrains Mono (Google Fonts) |

**No external AI API keys required** — all detection runs locally using heuristic engines and statistical analysis. Azure OpenAI integration available as a production upgrade path.

## 🚀 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend
```bash
cd agentarmor/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd agentarmor/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend at `http://localhost:8000`.

## 📸 Demo Features

1. **Interactive Attack Console** — Type or paste any prompt injection attack and see it detected in real-time with risk scores and strategy breakdowns
2. **Live Agent Monitoring** — 6 simulated AI agents with real-time behavioral fingerprints
3. **Real-Time Threat Feed** — Scrolling feed of detected attacks, anomalies, and immune propagation events
4. **Honeypot Dashboard** — See captured attacks and classified techniques
5. **Immune Memory Network** — Visual graph showing defense propagation across all agents
6. **Simulate Attacks** — One-click attack simulation buttons for demo presentations

## 👤 Team

| Member | Role |
|--------|------|
| **Abhijat** | Solo Developer — Architecture, Backend, Frontend, Design |

## 📄 License

MIT License — Built for Microsoft Build AI Hackathon 2025
