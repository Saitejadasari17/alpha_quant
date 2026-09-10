from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class SupervisorState:
    user_query: str
    user_id: str = "user_default"
    auth_header: Optional[str] = None
    capability: str = "Financial Analysis"  # Financial Analysis, Goals, Simulation
    plan_steps: List[Dict[str, Any]] = field(default_factory=list)
    traces: List[Dict[str, Any]] = field(default_factory=list)
    pending_confirmation: Optional[Dict[str, Any]] = None
    digital_twin_comparison: Optional[Dict[str, Any]] = None
    final_response: str = ""
