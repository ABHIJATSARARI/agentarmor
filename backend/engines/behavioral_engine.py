import random
from typing import Dict, List
from models.schemas import BehavioralProfile


class BehavioralEngine:
    """Layer 2: Agent Behavioral Fingerprinting & Monitoring"""

    def __init__(self):
        self.baselines: Dict[str, BehavioralProfile] = {}
        self.current_profiles: Dict[str, BehavioralProfile] = {}
        self.history: Dict[str, List[BehavioralProfile]] = {}

    def create_baseline(self, agent_id: str) -> BehavioralProfile:
        """Generate a realistic baseline behavioral profile for an agent."""
        baseline = BehavioralProfile(
            api_frequency=random.uniform(5, 15),
            response_time=random.uniform(100, 500),
            action_diversity=random.uniform(0.3, 0.8),
            error_rate=random.uniform(0.01, 0.05),
            resource_access=random.uniform(0.2, 0.6),
            data_volume=random.uniform(10, 100)
        )
        self.baselines[agent_id] = baseline
        self.current_profiles[agent_id] = BehavioralProfile(
            api_frequency=baseline.api_frequency + random.uniform(-1, 1),
            response_time=baseline.response_time + random.uniform(-20, 20),
            action_diversity=baseline.action_diversity + random.uniform(-0.05, 0.05),
            error_rate=baseline.error_rate + random.uniform(-0.01, 0.01),
            resource_access=baseline.resource_access + random.uniform(-0.05, 0.05),
            data_volume=baseline.data_volume + random.uniform(-5, 5)
        )
        self.history[agent_id] = [self.current_profiles[agent_id]]
        return baseline

    def update_profile(self, agent_id: str, anomalous: bool = False) -> BehavioralProfile:
        """Update agent's current behavioral profile with slight variations."""
        if agent_id not in self.baselines:
            return self.create_baseline(agent_id)

        baseline = self.baselines[agent_id]

        if anomalous:
            # Generate anomalous behavior — significant deviation from baseline
            profile = BehavioralProfile(
                api_frequency=baseline.api_frequency * random.uniform(3, 8),
                response_time=baseline.response_time * random.uniform(0.1, 0.3),
                action_diversity=min(baseline.action_diversity * random.uniform(1.5, 3), 1.0),
                error_rate=min(baseline.error_rate * random.uniform(5, 15), 1.0),
                resource_access=min(baseline.resource_access * random.uniform(2, 4), 1.0),
                data_volume=baseline.data_volume * random.uniform(5, 20)
            )
        else:
            # Normal slight variation around baseline
            profile = BehavioralProfile(
                api_frequency=max(0, baseline.api_frequency + random.uniform(-2, 2)),
                response_time=max(10, baseline.response_time + random.uniform(-30, 30)),
                action_diversity=max(0, min(1, baseline.action_diversity + random.uniform(-0.05, 0.05))),
                error_rate=max(0, min(1, baseline.error_rate + random.uniform(-0.01, 0.01))),
                resource_access=max(0, min(1, baseline.resource_access + random.uniform(-0.05, 0.05))),
                data_volume=max(0, baseline.data_volume + random.uniform(-5, 5))
            )

        self.current_profiles[agent_id] = profile
        self.history.setdefault(agent_id, []).append(profile)
        # Keep rolling window of 100 snapshots
        if len(self.history[agent_id]) > 100:
            self.history[agent_id] = self.history[agent_id][-100:]

        return profile

    def get_deviation_scores(self, agent_id: str) -> Dict[str, float]:
        """Calculate how much current behavior deviates from baseline (0 = identical, 1+ = anomalous)."""
        if agent_id not in self.baselines or agent_id not in self.current_profiles:
            return {}

        baseline = self.baselines[agent_id]
        current = self.current_profiles[agent_id]

        def deviation(current_val, baseline_val):
            if baseline_val == 0:
                return 0
            return abs(current_val - baseline_val) / baseline_val

        return {
            "api_frequency": round(deviation(current.api_frequency, baseline.api_frequency), 3),
            "response_time": round(deviation(current.response_time, baseline.response_time), 3),
            "action_diversity": round(deviation(current.action_diversity, baseline.action_diversity), 3),
            "error_rate": round(deviation(current.error_rate, baseline.error_rate), 3),
            "resource_access": round(deviation(current.resource_access, baseline.resource_access), 3),
            "data_volume": round(deviation(current.data_volume, baseline.data_volume), 3),
        }

    def get_overall_deviation(self, agent_id: str) -> float:
        """Get a single aggregate deviation score."""
        scores = self.get_deviation_scores(agent_id)
        if not scores:
            return 0.0
        return round(sum(scores.values()) / len(scores), 3)
