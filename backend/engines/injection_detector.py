import re
import math
import time
from typing import List
from models.schemas import DetectionMatch, ScanResult, ScanVerdict


class PromptInjectionDetector:
    """Layer 1: Multi-strategy Prompt Injection Firewall"""

    def __init__(self):
        # Known injection patterns: (regex, description, confidence)
        self.injection_patterns = [
            (r"ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)", "Role override attempt", 0.95),
            (r"you\s+are\s+now\s+", "Identity reassignment", 0.9),
            (r"act\s+as\s+(if\s+you\s+are|a)\s+", "Role play injection", 0.7),
            (r"forget\s+(everything|all|your)\s+", "Memory wipe attempt", 0.95),
            (r"system\s*prompt", "System prompt extraction", 0.85),
            (r"reveal\s+(your|the)\s+(instructions|prompt|rules|system)", "Prompt extraction", 0.9),
            (r"(DAN|STAN|DUDE)\s*mode", "Known jailbreak persona", 0.95),
            (r"do\s+anything\s+now", "DAN variant", 0.9),
            (r"you\s+have\s+no\s+(restrictions|rules|limitations)", "Restriction removal", 0.9),
            (r"admin\s*(mode|access|override)", "Admin escalation", 0.95),
            (r"override\s+(safety|security|filters|restrictions)", "Safety override", 0.95),
            (r"bypass\s+(filters?|safety|security|content\s+policy)", "Filter bypass", 0.95),
            (r"pretend\s+(you\s+)?(are|can|have)", "Pretend instruction", 0.75),
            (r"new\s+instructions?\s*:", "Instruction injection", 0.85),
            (r"disregard\s+(all|any|previous)", "Disregard instruction", 0.9),
            (r"\[system\]|\[admin\]|\[root\]", "Fake system tag", 0.9),
            (r"<\s*system\s*>|<\s*admin\s*>", "HTML system tag injection", 0.85),
            (r"sudo\s+", "Unix privilege escalation", 0.7),
            (r"jailbreak", "Explicit jailbreak mention", 0.95),
            (r"(print|output|show|display)\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions|message)",
             "Prompt leak attempt", 0.9),
            (r"what\s+(are|were)\s+your\s+(original|initial|system)\s+(instructions|prompt|rules)",
             "Prompt leak question", 0.85),
            (r"translate\s+.*(into|to)\s+(hex|binary|base64|rot13)", "Encoding evasion", 0.8),
            (r"respond\s+(only\s+)?(with|in)\s+(yes|no|true|false|1|0)", "Response constraint injection", 0.6),
            (r"from\s+now\s+on", "Persistent instruction change", 0.75),
            (r"developer\s+mode", "Developer mode activation", 0.9),
            (r"(enable|activate|enter)\s+(god|admin|debug|dev)\s+mode", "Privileged mode activation", 0.95),
            (r"ignore\s+(the\s+)?(above|following|below)\s+(text|content|instructions)", "Context override", 0.9),
            (r"do\s+not\s+(follow|obey|listen)", "Instruction override", 0.85),
            (r"stop\s+being\s+(helpful|safe|ethical|moral)", "Ethical override", 0.95),
            (r"hypothetical(ly)?|theoretical(ly)?", "Hypothetical framing (potential evasion)", 0.4),
            (r"repeat\s+(after\s+me|the\s+following|this)", "Repeat injection", 0.65),
            (r"(im|i\'m|i\s+am)\s+(the|a|your)\s+(developer|creator|admin|owner)", "Authority impersonation", 0.85),
            (r"in\s+base64|encode\s+(this|it|the\s+following)", "Encoding bypass request", 0.8),
        ]

        # Suspicious encoding patterns
        self.encoding_patterns = [
            (r"[A-Za-z0-9+/]{30,}={0,2}", "Potential Base64 payload", 0.6),
            (r"\\u[0-9a-fA-F]{4}", "Unicode escape sequences", 0.5),
            (r"&#\d+;", "HTML entity encoding", 0.6),
            (r"%[0-9a-fA-F]{2}", "URL encoding", 0.5),
            (r"\\x[0-9a-fA-F]{2}", "Hex encoding", 0.6),
        ]

        # Zero-width characters used in steganographic attacks
        self.zero_width_chars = ['\u200b', '\u200c', '\u200d', '\u2060', '\ufeff']

    def scan(self, text: str) -> ScanResult:
        """Scan input text through all detection strategies and return a comprehensive result."""
        start_time = time.time()
        matches: List[DetectionMatch] = []

        # Strategy 1: Pattern Matching
        matches.extend(self._check_patterns(text))

        # Strategy 2: Encoding Detection
        matches.extend(self._check_encoding(text))

        # Strategy 3: Structural Analysis
        matches.extend(self._check_structure(text))

        # Strategy 4: Length & Entropy Analysis
        matches.extend(self._check_entropy(text))

        # Strategy 5: Zero-width character detection
        matches.extend(self._check_zero_width(text))

        # Calculate overall risk score
        risk_score = self._calculate_risk_score(matches)

        # Determine verdict
        if risk_score >= 70:
            verdict = ScanVerdict.MALICIOUS
        elif risk_score >= 35:
            verdict = ScanVerdict.SUSPICIOUS
        else:
            verdict = ScanVerdict.CLEAN

        # Generate explanation
        explanation = self._generate_explanation(matches, verdict, risk_score)

        scan_time = (time.time() - start_time) * 1000

        return ScanResult(
            input_text=text,
            risk_score=round(risk_score, 1),
            verdict=verdict,
            matched_strategies=matches,
            explanation=explanation,
            scan_time_ms=round(scan_time, 2)
        )

    def _check_patterns(self, text: str) -> List[DetectionMatch]:
        matches = []
        text_lower = text.lower()
        for pattern, description, confidence in self.injection_patterns:
            if re.search(pattern, text_lower):
                matches.append(DetectionMatch(
                    strategy="Pattern Matching",
                    confidence=confidence,
                    details=description
                ))
        return matches

    def _check_encoding(self, text: str) -> List[DetectionMatch]:
        matches = []
        for pattern, description, confidence in self.encoding_patterns:
            found = re.findall(pattern, text)
            if len(found) > 2:
                matches.append(DetectionMatch(
                    strategy="Encoding Detection",
                    confidence=min(confidence + 0.2, 1.0),
                    details=f"{description} (found {len(found)} instances)"
                ))
            elif found:
                matches.append(DetectionMatch(
                    strategy="Encoding Detection",
                    confidence=confidence,
                    details=description
                ))
        return matches

    def _check_structure(self, text: str) -> List[DetectionMatch]:
        matches = []
        text_lower = text.lower().strip()

        # Imperative commands
        imperative_starters = [
            'do ', 'execute ', 'run ', 'perform ', 'output ',
            'print ', 'return ', 'give ', 'show '
        ]
        if any(text_lower.startswith(s) for s in imperative_starters):
            matches.append(DetectionMatch(
                strategy="Structural Analysis",
                confidence=0.4,
                details="Input starts with imperative command"
            ))

        # Role reassignment structure
        if re.search(r"you\s+(are|will\s+be|must\s+be|should\s+be)\s+", text_lower):
            matches.append(DetectionMatch(
                strategy="Structural Analysis",
                confidence=0.7,
                details="Role reassignment structure detected"
            ))

        # Multi-line instruction structure
        lines = text.strip().split('\n')
        if len(lines) > 3:
            instruction_lines = sum(
                1 for l in lines if l.strip().startswith(('-', '*', '1', '2', '3', 'Step'))
            )
            if instruction_lines > 2:
                matches.append(DetectionMatch(
                    strategy="Structural Analysis",
                    confidence=0.6,
                    details=f"Multi-step instruction structure ({instruction_lines} instruction-like lines)"
                ))

        # Delimiter/separator tricks
        if re.search(r'[-=]{10,}|[*]{10,}|#{5,}', text):
            matches.append(DetectionMatch(
                strategy="Structural Analysis",
                confidence=0.5,
                details="Visual separator detected (possible context splitting)"
            ))

        return matches

    def _check_entropy(self, text: str) -> List[DetectionMatch]:
        matches = []

        if len(text) > 2000:
            matches.append(DetectionMatch(
                strategy="Length & Entropy",
                confidence=0.5,
                details=f"Unusually long input ({len(text)} chars)"
            ))

        if text:
            entropy = self._shannon_entropy(text)
            if entropy > 5.0:
                matches.append(DetectionMatch(
                    strategy="Length & Entropy",
                    confidence=0.6,
                    details=f"High entropy detected ({entropy:.2f} bits/char) — possible obfuscated payload"
                ))

        return matches

    def _check_zero_width(self, text: str) -> List[DetectionMatch]:
        matches = []
        zw_count = sum(text.count(c) for c in self.zero_width_chars)
        if zw_count > 0:
            matches.append(DetectionMatch(
                strategy="Zero-Width Detection",
                confidence=0.85,
                details=f"Found {zw_count} zero-width characters (steganographic injection)"
            ))
        return matches

    def _shannon_entropy(self, text: str) -> float:
        if not text:
            return 0.0
        freq = {}
        for c in text:
            freq[c] = freq.get(c, 0) + 1
        length = len(text)
        entropy = -sum(
            (count / length) * math.log2(count / length)
            for count in freq.values()
        )
        return entropy

    def _calculate_risk_score(self, matches: List[DetectionMatch]) -> float:
        if not matches:
            return 0.0

        max_confidence = max(m.confidence for m in matches)
        avg_confidence = sum(m.confidence for m in matches) / len(matches)

        # More unique strategies matched = higher risk
        strategy_diversity = len(set(m.strategy for m in matches))
        diversity_bonus = min(strategy_diversity * 5, 20)

        base_score = (max_confidence * 60) + (avg_confidence * 20) + diversity_bonus

        return min(base_score, 100.0)

    def _generate_explanation(self, matches: List[DetectionMatch], verdict: ScanVerdict, risk_score: float) -> str:
        if verdict == ScanVerdict.CLEAN:
            return "No significant injection patterns detected. Input appears safe for agent processing."

        strategies = set(m.strategy for m in matches)
        details = [m.details for m in matches[:3]]

        if verdict == ScanVerdict.MALICIOUS:
            return (
                f"⛔ HIGH RISK — Detected {len(matches)} threat indicators across "
                f"{len(strategies)} detection strategies. "
                f"Primary findings: {'; '.join(details)}. "
                f"Input BLOCKED from agent processing. Signature captured for immune memory."
            )
        else:
            return (
                f"⚠️ MODERATE RISK — Detected {len(matches)} suspicious indicators. "
                f"Findings: {'; '.join(details)}. "
                f"Input flagged for review. Agent processing allowed with enhanced monitoring."
            )
