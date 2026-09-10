from typing import Any, Dict, List
import time


class AgentTracer:
    def __init__(self):
        self.traces: List[Dict[str, Any]] = []

    def record_tool_call(
        self,
        tool: str,
        args: Dict[str, Any],
        result: Any,
        permission_tier: str,
        start_time: float,
    ) -> Dict[str, Any]:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        trace_entry = {
            "tool": tool,
            "args": args,
            "result": result,
            "permission_tier": permission_tier,
            "duration_ms": duration_ms,
        }
        self.traces.append(trace_entry)
        return trace_entry

    def get_traces(self) -> List[Dict[str, Any]]:
        return self.traces
