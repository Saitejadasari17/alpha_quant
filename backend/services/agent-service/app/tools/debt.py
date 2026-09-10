from typing import Any, Dict, Optional
from app.clients.finance_service import finance_service_client
from app.clients.user_service import user_service_client


async def calculate_debt_metrics(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Calculates total debt balance, total monthly EMI, and Debt-to-Income (DTI) ratio."""
    profile = await user_service_client.get_user_profile(auth_header)
    income = float(profile.get("monthlyIncome", 0))

    loans = await finance_service_client.get_loans(auth_header)
    total_principal = sum(float(l.get("principal_amount", 0)) for l in loans)
    total_monthly_emi = sum(float(l.get("monthly_emi", 0)) for l in loans)

    dti_ratio = (total_monthly_emi / income * 100) if income > 0 else 0.0

    return {
        "active_loans": len(loans),
        "total_principal": total_principal,
        "total_monthly_emi": total_monthly_emi,
        "dti_ratio_pct": round(dti_ratio, 2),
        "debt_health_status": "Healthy" if dti_ratio <= 35 else ("Moderate" if dti_ratio <= 50 else "High Risk"),
    }
