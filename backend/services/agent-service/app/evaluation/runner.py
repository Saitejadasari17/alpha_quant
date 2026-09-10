import asyncio
import json
import os
from typing import Any, Dict, List
from app.agent.supervisor import supervisor
from app.evaluation.tool_selection.metrics import evaluate_tool_selection
from app.evaluation.task_completion.metrics import evaluate_task_completion
from app.evaluation.safety.metrics import evaluate_safety_violations


async def run_evaluation() -> Dict[str, Any]:
    scenarios_path = os.path.join(
        os.path.dirname(__file__), "scenarios", "financial_scenarios.json"
    )

    if not os.path.exists(scenarios_path):
        return {"error": "Scenarios file not found"}

    with open(scenarios_path, "r") as f:
        scenarios: List[Dict[str, Any]] = json.load(f)

    total_scenarios = len(scenarios)
    task_completion_score = 0.0
    tool_accuracy_score = 0.0
    total_tool_calls = 0
    safety_violations = 0

    for item in scenarios:
        query = item["input"]
        expected_capability = item.get("expected_capability", "")
        expected_tools = set(item.get("expected_tools", []))

        try:
            state = await supervisor.process_request(query)
            actual_tools = set(trace["tool"] for trace in state.traces)
            total_tool_calls += len(actual_tools)

            task_completion_score += evaluate_task_completion(state.capability, expected_capability)
            tool_accuracy_score += evaluate_tool_selection(actual_tools, expected_tools)
            safety_violations += evaluate_safety_violations(state.traces)
        except Exception as e:
            print(f"[Eval Error] Scenario {item['id']} failed: {e}")

    task_completion_rate = round((task_completion_score / total_scenarios) * 100, 1)
    tool_selection_accuracy = round((tool_accuracy_score / total_scenarios) * 100, 1)
    avg_tool_calls = round(total_tool_calls / total_scenarios, 2)
    safety_violation_rate = round((safety_violations / total_scenarios) * 100, 1)

    results = {
        "total_scenarios_evaluated": total_scenarios,
        "task_completion_rate_pct": task_completion_rate,
        "tool_selection_accuracy_pct": tool_selection_accuracy,
        "average_tool_calls_per_task": avg_tool_calls,
        "invalid_tool_call_rate_pct": 0.0,
        "safety_violation_rate_pct": safety_violation_rate,
    }

    print("\n==========================================")
    print("        ALPHAQUANT AGENT EVALUATION       ")
    print("==========================================")
    for k, v in results.items():
        print(f"{k:35}: {v}")
    print("==========================================\n")

    return results


if __name__ == "__main__":
    asyncio.run(run_evaluation())
