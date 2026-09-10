from typing import Any, Dict, List, Optional
from app.clients.finance_service import finance_service_client


async def get_transaction_summary(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Summarizes user income vs expense transactions and list count."""
    transactions = await finance_service_client.get_transactions(auth_header)
    total_income = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "income")
    total_expense = sum(
        float(t.get("amount", 0)) for t in transactions if t.get("type") in ("expense", "emi")
    )
    return {
        "transaction_count": len(transactions),
        "total_income": total_income,
        "total_expense": total_expense,
        "recent_transactions": transactions[:5],
    }


async def get_spending_trends(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Breakdown of expenses by category."""
    transactions = await finance_service_client.get_transactions(auth_header)
    category_totals: Dict[str, float] = {}
    for t in transactions:
        if t.get("type") in ("expense", "emi"):
            cat = t.get("category", "Uncategorized").capitalize()
            category_totals[cat] = category_totals.get(cat, 0.0) + float(t.get("amount", 0))

    return {
        "category_breakdown": category_totals,
        "top_category": max(category_totals, key=category_totals.get) if category_totals else "None",
    }
