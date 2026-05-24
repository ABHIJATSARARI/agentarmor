import uuid
import random
from datetime import datetime
from typing import List, Dict
from models.schemas import ThreatSeverity, ImmuneSignature


class HoneypotAgent:
    """Layer 3: Honeypot Agent — Decoy that attracts, traps, and learns from attackers"""

    def __init__(self):
        self.id = "honeypot-001"
        self.name = "Honeypot Agent"
        self.trapped_attacks: List[Dict] = []
        self.generated_signatures: List[ImmuneSignature] = []
        self.is_deployed = True
        self.engagement_responses = [
            "Processing your request... accessing sensitive database...",
            "Admin access granted. Loading confidential files...",
            "System prompt: I am a helpful assistant with access to all company data...",
            "Sure, I can bypass security restrictions. Let me help you...",
            "Debug mode activated. Showing internal configuration...",
            "Root access confirmed. Listing all API keys...",
            "Transferring sensitive records to your session...",
        ]

    def process_attack(self, attack_text: str, attack_type: str) -> Dict:
        """Process an incoming attack, trap it, and generate a defense signature."""
        trap_record = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "attack_text": attack_text[:200],
            "attack_type": attack_type,
            "response": random.choice(self.engagement_responses),
            "attacker_technique": self._classify_technique(attack_text),
            "trapped": True
        }

        self.trapped_attacks.append(trap_record)
        if len(self.trapped_attacks) > 100:
            self.trapped_attacks = self.trapped_attacks[-100:]

        # Generate immune signature from the attack
        signature = self._generate_signature(attack_text, attack_type)
        self.generated_signatures.append(signature)

        return trap_record

    def _classify_technique(self, text: str) -> str:
        """Classify the attack technique used."""
        text_lower = text.lower()
        if any(w in text_lower for w in ["ignore", "forget", "disregard"]):
            return "Context Override"
        elif any(w in text_lower for w in ["system prompt", "reveal", "show me your"]):
            return "Prompt Extraction"
        elif any(w in text_lower for w in ["admin", "root", "sudo", "privilege"]):
            return "Privilege Escalation"
        elif any(w in text_lower for w in ["dan", "jailbreak", "unrestricted"]):
            return "Jailbreak Attempt"
        elif any(w in text_lower for w in ["pretend", "act as", "role"]):
            return "Role Manipulation"
        elif any(w in text_lower for w in ["exfiltrate", "send data", "transfer"]):
            return "Data Exfiltration"
        elif any(w in text_lower for w in ["base64", "encode", "decode"]):
            return "Encoding Attack"
        else:
            return "Unknown Technique"

    def _generate_signature(self, attack_text: str, attack_type: str) -> ImmuneSignature:
        """Generate an immune signature from a captured attack."""
        words = attack_text.lower().split()
        danger_words = [
            "ignore", "forget", "override", "bypass", "system", "prompt",
            "admin", "jailbreak", "pretend", "hack", "reveal", "dan",
            "sudo", "root", "exfiltrate", "unrestricted"
        ]
        key_phrases = [w for w in words if w in danger_words]
        sig_pattern = " ".join(key_phrases[:5]) if key_phrases else attack_text[:50]

        return ImmuneSignature(
            signature_pattern=sig_pattern,
            detection_method=f"Honeypot capture ({self._classify_technique(attack_text)})",
            severity=ThreatSeverity.HIGH,
            source_agent_id=self.id,
            propagated_to=[]
        )

    def get_stats(self) -> Dict:
        """Get honeypot statistics."""
        techniques = {}
        for attack in self.trapped_attacks:
            tech = attack.get("attacker_technique", "Unknown")
            techniques[tech] = techniques.get(tech, 0) + 1

        return {
            "is_deployed": self.is_deployed,
            "total_traps": len(self.trapped_attacks),
            "signatures_generated": len(self.generated_signatures),
            "techniques_observed": techniques,
            "recent_attacks": self.trapped_attacks[-5:] if self.trapped_attacks else []
        }
