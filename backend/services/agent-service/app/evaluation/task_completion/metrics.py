def evaluate_task_completion(actual_capability: str, expected_capability: str) -> float:
    return 1.0 if actual_capability == expected_capability else 0.0
