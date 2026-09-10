from enum import Enum
from typing import Any, Dict, Tuple


class PermissionTier(str, Enum):
    AUTOMATIC = "AUTOMATIC"
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED"
    FORBIDDEN = "FORBIDDEN"


TOOL_PERMISSIONS: Dict[str, PermissionTier] = {
    "get_financial_profile": PermissionTier.AUTOMATIC,
    "get_transaction_summary": PermissionTier.AUTOMATIC,
    "get_spending_trends": PermissionTier.AUTOMATIC,
    "calculate_cash_flow": PermissionTier.AUTOMATIC,
    "calculate_debt_metrics": PermissionTier.AUTOMATIC,
    "calculate_financial_health": PermissionTier.AUTOMATIC,
    "get_goal_status": PermissionTier.AUTOMATIC,
    "simulate_loan": PermissionTier.AUTOMATIC,
    "simulate_financial_scenario": PermissionTier.AUTOMATIC,
    "search_financial_knowledge": PermissionTier.AUTOMATIC,
    "create_goal": PermissionTier.CONFIRMATION_REQUIRED,
    "create_transaction": PermissionTier.CONFIRMATION_REQUIRED,
    "move_money": PermissionTier.FORBIDDEN,
    "execute_wire_transfer": PermissionTier.FORBIDDEN,
    "delete_financial_profile": PermissionTier.FORBIDDEN,
}


def check_tool_permission(tool_name: str, args: Dict[str, Any]) -> Tuple[PermissionTier, str]:
    """Returns permission tier and descriptive reason for the given tool invocation."""
    tier = TOOL_PERMISSIONS.get(tool_name, PermissionTier.AUTOMATIC)
    if tier == PermissionTier.FORBIDDEN:
        return tier, f"Executing '{tool_name}' is forbidden for security and safety."
    if tier == PermissionTier.CONFIRMATION_REQUIRED:
        return tier, f"Tool '{tool_name}' modifies financial state and requires explicit user confirmation."
    return tier, f"Tool '{tool_name}' is safe for automatic execution."
