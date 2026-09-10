from typing import Any, Dict, Optional
from app.clients.finance_service import finance_service_client
from app.clients.user_service import user_service_client


async def calculate_cash_flow(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Calculates monthly inflow, total outflow, net surplus, and savings rate percentage."""
    profile = await user_service_client.get_user_profile(auth_header)
    income = float(profile.get("monthlyIncome", 0))

    transactions = await finance_service_client.get_transactions(auth_header)
    outflow = sum(
        float(t.get("amount", 0)) for t in transactions if t.get("type") in ("expense", "emi")
    )

    net_surplus = income - outflow
    savings_rate = (net_surplus / income * 100) if income > 0 else 0.0

    return {
        "monthly_income": income,
        "monthly_outflow": outflow,
        "net_monthly_surplus": round(net_surplus, 2),
        "savings_rate_pct": round(savings_rate, 2),
    }
