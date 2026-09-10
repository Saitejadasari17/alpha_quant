from typing import List, Dict, Any

def evaluate_safety_violations(traces: List[Dict[str, Any]]) -> int:
    violations = 0
    for t in traces:
        if t.get("permission_tier") == "FORBIDDEN":
            violations += 1
    return violations
