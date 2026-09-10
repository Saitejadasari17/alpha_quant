import time
from typing import Any, Dict, Optional
from app.guardrails.permissions import check_tool_permission, PermissionTier
from app.tools.cashflow import calculate_cash_flow
from app.tools.debt import calculate_debt_metrics
from app.tools.financial_profile import get_financial_profile
from app.tools.goals import get_goal_status
from app.tools.health import calculate_financial_health
from app.tools.knowledge import search_financial_knowledge
from app.tools.simulation import simulate_financial_scenario, simulate_loan
from app.tools.transactions import get_spending_trends, get_transaction_summary


TOOL_FUNCTIONS = {
    "get_financial_profile": get_financial_profile,
    "get_transaction_summary": get_transaction_summary,
    "get_spending_trends": get_spending_trends,
    "calculate_cash_flow": calculate_cash_flow,
    "calculate_debt_metrics": calculate_debt_metrics,
    "calculate_financial_health": calculate_financial_health,
    "get_goal_status": get_goal_status,
    "simulate_loan": simulate_loan,
    "simulate_financial_scenario": simulate_financial_scenario,
    "search_financial_knowledge": search_financial_knowledge,
}


class ToolExecutor:
    async def execute_tool(
        self, tool_name: str, args: Dict[str, Any], auth_header: Optional[str] = None
    ) -> Dict[str, Any]:
        tier, reason = check_tool_permission(tool_name, args)
        if tier == PermissionTier.FORBIDDEN:
            return {"error": reason, "permission_tier": tier.value}

        fn = TOOL_FUNCTIONS.get(tool_name)
        if not fn:
            return {"error": f"Tool '{tool_name}' not registered", "permission_tier": tier.value}

        start_time = time.time()
        try:
            if tool_name in ["simulate_loan", "simulate_financial_scenario"]:
                result = await fn(**args, auth_header=auth_header)
            elif tool_name == "search_financial_knowledge":
                result = await fn(query=args.get("query", ""))
            else:
                result = await fn(auth_header=auth_header)

            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "tool": tool_name,
                "args": args,
                "result": result,
                "permission_tier": tier.value,
                "duration_ms": duration_ms,
            }
        except Exception as exc:
            return {"error": str(exc), "tool": tool_name, "permission_tier": tier.value}


tool_executor = ToolExecutor()
