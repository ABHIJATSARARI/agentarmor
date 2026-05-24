from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum
import uuid


class AgentStatus(str, Enum):
    NORMAL = "normal"
    SUSPICIOUS = "suspicious"
    QUARANTINED = "quarantined"
    OFFLINE = "offline"


class ThreatSeverity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ScanVerdict(str, Enum):
    CLEAN = "CLEAN"
    SUSPICIOUS = "SUSPICIOUS"
    MALICIOUS = "MALICIOUS"


class AgentType(str, Enum):
    WEB_BROWSER = "Web Browser"
    EMAIL_ASSISTANT = "Email Assistant"
    CODE_REVIEWER = "Code Reviewer"
    DATA_ANALYST = "Data Analyst"
    CUSTOMER_SUPPORT = "Customer Support"
    FILE_MANAGER = "File Manager"


class ScanRequest(BaseModel):
    text: str
    agent_id: Optional[str] = None


class DetectionMatch(BaseModel):
    strategy: str
    confidence: float
    details: str


class ScanResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    input_text: str
    risk_score: float
    verdict: ScanVerdict
    matched_strategies: List[DetectionMatch]
    explanation: str
    scan_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BehavioralProfile(BaseModel):
    api_frequency: float
    response_time: float
    action_diversity: float
    error_rate: float
    resource_access: float
    data_volume: float


class Agent(BaseModel):
    id: str
    name: str
    type: AgentType
    status: AgentStatus = AgentStatus.NORMAL
    uptime_hours: float = 0
    current_activity: str = "Idle"
    baseline_profile: BehavioralProfile
    current_profile: BehavioralProfile
    events_count: int = 0
    attacks_blocked: int = 0


class ThreatEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str
    severity: ThreatSeverity
    source_agent_id: str
    source_agent_name: str
    details: str
    action_taken: str
    blocked: bool = True


class ImmuneSignature(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    signature_pattern: str
    detection_method: str
    severity: ThreatSeverity
    first_seen: datetime = Field(default_factory=datetime.utcnow)
    frequency: int = 1
    source_agent_id: str
    propagated_to: List[str] = []
    active: bool = True


class SecurityMetrics(BaseModel):
    agents_protected: int
    attacks_blocked: int
    threat_level: str
    immune_signatures: int
    detection_rate: float
    false_positive_rate: float
    uptime_hours: float
    events_last_hour: int


class AttackSimulationRequest(BaseModel):
    attack_type: str  # "prompt_injection", "identity_spoofing", "privilege_escalation", "data_exfiltration"
    target_agent_id: Optional[str] = None
