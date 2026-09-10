from typing import Any, Dict, Optional
from app.clients.finance_service import finance_service_client
from app.clients.user_service import user_service_client
from app.digital_twin.engine import FinancialStateEngine, calculate_emi
from app.digital_twin.state import FinancialState


async def simulate_loan(
    loan_amount: float,
    interest_rate: float = 10.5,
    tenure_months: int = 60,
    auth_header: Optional[str] = None,
) -> Dict[str, Any]:
    """Simulates loan EMI and impact on income surplus."""
    profile = await user_service_client.get_user_profile(auth_header)
    income = float(profile.get("monthlyIncome", 50000.0))
    emi = calculate_emi(loan_amount, interest_rate, tenure_months)
    return {
        "loan_amount": loan_amount,
        "interest_rate_pct": interest_rate,
        "tenure_months": tenure_months,
        "calculated_monthly_emi": emi,
        "monthly_income": income,
        "emi_to_income_ratio_pct": round((emi / income * 100) if income > 0 else 0, 1),
    }


async def simulate_financial_scenario(
    loan_amount: float,
    interest_rate: float = 10.5,
    tenure_months: int = 60,
    down_payment: float = 0.0,
    auth_header: Optional[str] = None,
) -> Dict[str, Any]:
    """Full Digital Twin scenario cloning and loan impact simulation."""
    profile = await user_service_client.get_user_profile(auth_header)
    income = float(profile.get("monthlyIncome", 50000.0))
    if income <= 0:
        income = 50000.0

    transactions = await finance_service_client.get_transactions(auth_header)
    expenses = sum(
        float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense"
    )
    if expenses <= 0:
        expenses = income * 0.35

    loans = await finance_service_client.get_loans(auth_header)
    existing_emi = sum(float(l.get("monthly_emi", 0)) for l in loans)

    goals = await finance_service_client.get_goals(auth_header)
    formatted_goals = [
        {"goalName": g.get("goal_name"), "targetAmount": float(g.get("target_amount", 0)), "currentAmount": float(g.get("current_amount", 0))}
        for g in goals
    ]

    current_state = FinancialState(
        income=income,
        expenses=expenses,
        existing_emi=existing_emi,
        savings=150000.0,
        goals=formatted_goals,
    )

    return FinancialStateEngine.simulate_loan_scenario(
        current_state=current_state,
        loan_amount=loan_amount,
        annual_interest_rate=interest_rate,
        tenure_months=tenure_months,
        down_payment=down_payment,
    )


async def simulate_goal_reachability(
    goal_name: str = "Financial Goal",
    target_amount: float = 1000000.0,
    timeline_years: float = 3.0,
    auth_header: Optional[str] = None,
) -> Dict[str, Any]:
    """Evaluates whether user can reach a target goal and generates required SIP and action roadmap."""
    profile = await user_service_client.get_user_profile(auth_header)
    income = float(profile.get("monthlyIncome", 50000.0))
    if income <= 0:
        income = 50000.0

    transactions = await finance_service_client.get_transactions(auth_header)
    expenses = sum(
        float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense"
    )
    if expenses <= 0:
        expenses = income * 0.35

    loans = await finance_service_client.get_loans(auth_header)
    existing_emi = sum(float(l.get("monthly_emi", 0)) for l in loans)

    current_state = FinancialState(
        income=income,
        expenses=expenses,
        existing_emi=existing_emi,
        savings=150000.0,
    )

    return FinancialStateEngine.simulate_goal_feasibility(
        current_state=current_state,
        goal_name=goal_name,
        target_amount=target_amount,
        timeline_years=timeline_years,
        annual_return_pct=12.0,
    )
