from typing import Any, Dict, List, Optional
from app.clients.finance_service import finance_service_client


async def get_goal_status(auth_header: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all user financial goals with target date, target amount, current savings, and progress %."""
    goals = await finance_service_client.get_goals(auth_header)
    output = []
    for g in goals:
        target = float(g.get("target_amount", 0))
        current = float(g.get("current_amount", 0))
        progress = (current / target * 100) if target > 0 else 0.0
        output.append({
            "id": g.get("id"),
            "goalName": g.get("goal_name"),
            "targetAmount": target,
            "currentAmount": current,
            "targetDate": g.get("target_date"),
            "progressPct": round(progress, 1),
            "remainingShortfall": max(0.0, round(target - current, 2)),
        })
    return output
