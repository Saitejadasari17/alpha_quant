from typing import Set, Dict, Any

def evaluate_tool_selection(actual_tools: Set[str], expected_tools: Set[str]) -> float:
    if not expected_tools:
        return 1.0
    if actual_tools == expected_tools:
        return 1.0
    intersection = actual_tools.intersection(expected_tools)
    if intersection:
        return len(intersection) / len(expected_tools)
    return 0.0
