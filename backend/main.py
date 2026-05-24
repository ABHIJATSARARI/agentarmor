import asyncio
from typing import List
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import ScanRequest, ThreatEvent, AttackSimulationRequest
from simulation.agent_simulator import AgentSimulator


# Global simulator instance
simulator = AgentSimulator()


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


async def event_callback(event: ThreatEvent):
    """Broadcast threat events to all connected WebSocket clients."""
    await manager.broadcast({
        "type": "threat_event",
        "data": {
            "id": event.id,
            "timestamp": event.timestamp.isoformat(),
            "event_type": event.event_type,
            "severity": event.severity.value if hasattr(event.severity, 'value') else str(event.severity),
            "source_agent_id": event.source_agent_id,
            "source_agent_name": event.source_agent_name,
            "details": event.details,
            "action_taken": event.action_taken,
            "blocked": event.blocked,
        }
    })


simulator.set_event_callback(event_callback)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — start simulator on startup."""
    task = asyncio.create_task(simulator.start())
    yield
    simulator.stop()
    task.cancel()


app = FastAPI(
    title="AgentArmor API",
    description="🛡️ Immune System for AI Agents — Three-Layer Security Framework",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ REST Endpoints ============


@app.get("/")
async def root():
    return {
        "name": "AgentArmor",
        "version": "1.0.0",
        "status": "operational",
        "team": "Srapid",
        "description": "Immune System for AI Agents",
    }


@app.post("/api/scan")
async def scan_input(request: ScanRequest):
    """Scan text for prompt injection attacks — the core interactive feature."""
    # Check immune memory first
    immune_match = simulator.immune_memory.check_immunity(request.text)

    # Run injection detector
    result = simulator.injection_detector.scan(request.text)

    response = {
        "id": result.id,
        "input_text": result.input_text,
        "risk_score": result.risk_score,
        "verdict": result.verdict.value,
        "matched_strategies": [
            {"strategy": m.strategy, "confidence": m.confidence, "details": m.details}
            for m in result.matched_strategies
        ],
        "explanation": result.explanation,
        "scan_time_ms": result.scan_time_ms,
        "immune_match": immune_match.signature_pattern if immune_match else None,
        "timestamp": result.timestamp.isoformat(),
    }

    # If malicious, feed to honeypot and immune memory
    if result.verdict.value == "MALICIOUS":
        simulator.honeypot.process_attack(request.text, "prompt_injection")
        for sig in simulator.honeypot.generated_signatures[-1:]:
            simulator.immune_memory.add_signature(sig)
            agent_ids = list(simulator.agents.keys())
            simulator.immune_memory.propagate_to_all(sig.id, agent_ids)

        # Broadcast detection event
        event = ThreatEvent(
            event_type="manual_scan",
            severity="critical",
            source_agent_id=request.agent_id or "console",
            source_agent_name="Attack Console",
            details=f"Console scan detected threat: {request.text[:60]}... | Risk: {result.risk_score}",
            action_taken="Signature captured and propagated to all agents.",
            blocked=True,
        )
        await event_callback(event)

    simulator.metrics["total_scans"] += 1
    return response


@app.get("/api/agents")
async def get_agents():
    """List all monitored agents with current profiles and deviations."""
    agents = []
    for agent in simulator.agents.values():
        deviations = simulator.behavioral_engine.get_deviation_scores(agent.id)
        agents.append({
            "id": agent.id,
            "name": agent.name,
            "type": agent.type.value,
            "status": agent.status.value,
            "uptime_hours": round(agent.uptime_hours, 1),
            "current_activity": agent.current_activity,
            "events_count": agent.events_count,
            "attacks_blocked": agent.attacks_blocked,
            "baseline_profile": {
                "api_frequency": round(agent.baseline_profile.api_frequency, 2),
                "response_time": round(agent.baseline_profile.response_time, 2),
                "action_diversity": round(agent.baseline_profile.action_diversity, 2),
                "error_rate": round(agent.baseline_profile.error_rate, 4),
                "resource_access": round(agent.baseline_profile.resource_access, 2),
                "data_volume": round(agent.baseline_profile.data_volume, 2),
            },
            "current_profile": {
                "api_frequency": round(agent.current_profile.api_frequency, 2),
                "response_time": round(agent.current_profile.response_time, 2),
                "action_diversity": round(agent.current_profile.action_diversity, 2),
                "error_rate": round(agent.current_profile.error_rate, 4),
                "resource_access": round(agent.current_profile.resource_access, 2),
                "data_volume": round(agent.current_profile.data_volume, 2),
            },
            "deviation_scores": deviations,
        })
    return {"agents": agents}


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get detailed agent information including anomaly assessment."""
    if agent_id not in simulator.agents:
        return {"error": "Agent not found"}

    agent = simulator.agents[agent_id]
    deviations = simulator.behavioral_engine.get_deviation_scores(agent_id)
    overall_deviation = simulator.behavioral_engine.get_overall_deviation(agent_id)
    anomaly_score, recommendation, anomalous_dims = simulator.anomaly_detector.analyze(
        agent_id, deviations
    )

    return {
        "id": agent.id,
        "name": agent.name,
        "type": agent.type.value,
        "status": agent.status.value,
        "uptime_hours": round(agent.uptime_hours, 1),
        "current_activity": agent.current_activity,
        "events_count": agent.events_count,
        "attacks_blocked": agent.attacks_blocked,
        "baseline_profile": agent.baseline_profile.model_dump(),
        "current_profile": agent.current_profile.model_dump(),
        "deviation_scores": deviations,
        "overall_deviation": round(overall_deviation, 3),
        "anomaly_score": anomaly_score,
        "anomaly_recommendation": recommendation,
        "anomalous_dimensions": anomalous_dims,
    }


@app.post("/api/simulate/attack")
async def simulate_attack(request: AttackSimulationRequest):
    """Trigger a simulated attack for demo/presentation purposes."""
    result = await simulator.trigger_attack(request.attack_type, request.target_agent_id)
    return {
        "status": "attack_simulated",
        "target_agent": result["target_agent"],
        "scan_result": {
            "risk_score": result["scan_result"].risk_score,
            "verdict": result["scan_result"].verdict.value,
        },
        "trap_record": result["trap_record"],
    }


@app.get("/api/threats")
async def get_threats():
    """Get recent threat events for the feed."""
    events = simulator.events[-50:]
    return {
        "events": [
            {
                "id": e.id,
                "timestamp": e.timestamp.isoformat(),
                "event_type": e.event_type,
                "severity": e.severity.value if hasattr(e.severity, 'value') else str(e.severity),
                "source_agent_id": e.source_agent_id,
                "source_agent_name": e.source_agent_name,
                "details": e.details,
                "action_taken": e.action_taken,
                "blocked": e.blocked,
            }
            for e in reversed(events)
        ]
    }


@app.get("/api/metrics")
async def get_metrics():
    """Get aggregate security metrics for the dashboard."""
    return simulator.get_metrics()


@app.get("/api/immune-memory")
async def get_immune_memory():
    """Get immune memory signatures and propagation data."""
    signatures = simulator.immune_memory.get_all_signatures()
    return {
        "signatures": [
            {
                "id": s.id,
                "pattern": s.signature_pattern,
                "detection_method": s.detection_method,
                "severity": s.severity.value,
                "first_seen": s.first_seen.isoformat(),
                "frequency": s.frequency,
                "source_agent_id": s.source_agent_id,
                "propagated_to": s.propagated_to,
                "active": s.active,
            }
            for s in signatures
        ],
        "propagation_log": simulator.immune_memory.get_propagation_log(),
        "stats": simulator.immune_memory.get_stats(),
    }


@app.get("/api/honeypot")
async def get_honeypot():
    """Get honeypot status and captured attacks."""
    return simulator.honeypot.get_stats()


# ============ WebSocket ============


@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time event stream for the dashboard."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
