from typing import Dict, List, Tuple
from models.schemas import AgentStatus


class AnomalyDetector:
    """Layer 2: Statistical Anomaly Detection Engine"""

    QUARANTINE_THRESHOLD = 0.6
    SUSPICIOUS_THRESHOLD = 0.3

    def __init__(self):
        self.alert_history: Dict[str, List[float]] = {}

    def analyze(self, agent_id: str, deviation_scores: Dict[str, float]) -> Tuple[float, str, List[str]]:
        """
        Analyze behavioral deviations and return anomaly assessment.
        Returns: (anomaly_score, recommendation, anomalous_dimensions)
        """
        if not deviation_scores:
            return 0.0, "NORMAL", []

        anomalous_dimensions = []
        weighted_scores = []

        # Weight dimensions by security importance
        weights = {
            "api_frequency": 1.5,
            "response_time": 1.0,
            "action_diversity": 1.2,
            "error_rate": 2.0,
            "resource_access": 2.0,
            "data_volume": 1.5,
        }

        for dimension, score in deviation_scores.items():
            weight = weights.get(dimension, 1.0)
            weighted_score = score * weight
            weighted_scores.append(weighted_score)

            if score > 0.5:
                anomalous_dimensions.append(dimension)

        # Calculate overall anomaly score (0-1 scale)
        if weighted_scores:
            max_score = max(weighted_scores)
            avg_score = sum(weighted_scores) / len(weighted_scores)
            anomaly_score = (max_score * 0.6 + avg_score * 0.4)
        else:
            anomaly_score = 0.0

        anomaly_score = min(max(anomaly_score, 0.0), 1.0)

        # Track history
        self.alert_history.setdefault(agent_id, []).append(anomaly_score)
        if len(self.alert_history[agent_id]) > 50:
            self.alert_history[agent_id] = self.alert_history[agent_id][-50:]

        # Determine recommendation
        if anomaly_score >= self.QUARANTINE_THRESHOLD:
            recommendation = "QUARANTINE"
        elif anomaly_score >= self.SUSPICIOUS_THRESHOLD:
            recommendation = "MONITOR"
        else:
            recommendation = "NORMAL"

        return round(anomaly_score, 3), recommendation, anomalous_dimensions

    def get_agent_status(self, anomaly_score: float) -> AgentStatus:
        """Map anomaly score to agent status."""
        if anomaly_score >= self.QUARANTINE_THRESHOLD:
            return AgentStatus.QUARANTINED
        elif anomaly_score >= self.SUSPICIOUS_THRESHOLD:
            return AgentStatus.SUSPICIOUS
        else:
            return AgentStatus.NORMAL
