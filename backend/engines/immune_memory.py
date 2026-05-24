from datetime import datetime
from typing import List, Dict, Optional
from models.schemas import ImmuneSignature


class ImmuneMemory:
    """Layer 3: Collective Immunity — Shared Threat Memory Network"""

    def __init__(self):
        self.signatures: List[ImmuneSignature] = []
        self.propagation_log: List[Dict] = []
        self.agent_immunity: Dict[str, List[str]] = {}  # agent_id -> [signature_ids]

    def add_signature(self, signature: ImmuneSignature) -> ImmuneSignature:
        """Add a new threat signature to immune memory."""
        # Deduplicate
        for existing in self.signatures:
            if existing.signature_pattern == signature.signature_pattern:
                existing.frequency += 1
                return existing

        self.signatures.append(signature)
        return signature

    def propagate_to_agent(self, signature_id: str, agent_id: str) -> bool:
        """Propagate a signature to a specific agent."""
        for sig in self.signatures:
            if sig.id == signature_id:
                if agent_id not in sig.propagated_to:
                    sig.propagated_to.append(agent_id)
                    self.agent_immunity.setdefault(agent_id, []).append(signature_id)
                    self.propagation_log.append({
                        "timestamp": datetime.utcnow().isoformat(),
                        "signature_id": signature_id,
                        "agent_id": agent_id,
                        "pattern": sig.signature_pattern
                    })
                    return True
        return False

    def propagate_to_all(self, signature_id: str, agent_ids: List[str]) -> List[str]:
        """Propagate a signature to all agents in the network."""
        propagated = []
        for agent_id in agent_ids:
            if self.propagate_to_agent(signature_id, agent_id):
                propagated.append(agent_id)
        return propagated

    def check_immunity(self, text: str) -> Optional[ImmuneSignature]:
        """Check if input matches any known immune signature."""
        text_lower = text.lower()
        for sig in self.signatures:
            if sig.active and sig.signature_pattern and sig.signature_pattern.lower() in text_lower:
                return sig
        return None

    def get_all_signatures(self) -> List[ImmuneSignature]:
        """Get all stored signatures."""
        return self.signatures

    def get_propagation_log(self) -> List[Dict]:
        """Get recent propagation history."""
        return self.propagation_log[-50:]

    def get_stats(self) -> Dict:
        return {
            "total_signatures": len(self.signatures),
            "active_signatures": sum(1 for s in self.signatures if s.active),
            "total_propagations": len(self.propagation_log),
            "agents_with_immunity": len(self.agent_immunity),
        }
