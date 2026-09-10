from typing import Any, Dict, List, Optional
from app.digital_twin.state import FinancialState


def calculate_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
    """Standard loan EMI calculation formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)"""
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate_pct <= 0:
        return principal / tenure_months

    r = (annual_rate_pct / 100.0) / 12.0
    n = tenure_months
    emi = principal * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
    return round(emi, 2)


def calculate_required_sip(target_amount: float, current_savings: float, timeline_months: int, annual_return_pct: float = 12.0) -> float:
    """Calculates monthly SIP needed to reach target_amount given current_savings and expected annual return."""
    if timeline_months <= 0:
        return target_amount

    r = (annual_return_pct / 100.0) / 12.0
    n = timeline_months

    # Future value of current savings
    fv_current = current_savings * ((1 + r) ** n)
    remaining_fv = max(0.0, target_amount - fv_current)

    if remaining_fv <= 0 or n <= 0:
        return 0.0

    # Monthly SIP formula: PMT = FV * r / ((1+r)^n - 1)
    sip = remaining_fv * r / (((1 + r) ** n) - 1)
    return round(sip, 2)


def calculate_health_score(income: float, expenses: float, total_emi: float, savings: float) -> float:
    """Deterministic score 0-100 based on cashflow surplus, DTI ratio, and emergency fund reserves."""
    if income <= 0:
        return 0.0

    net_surplus = income - (expenses + total_emi)
    surplus_ratio = max(0.0, net_surplus / income)
    dti_ratio = total_emi / income
    emergency_months = savings / (expenses + total_emi) if (expenses + total_emi) > 0 else 6.0

    cashflow_score = min(40.0, surplus_ratio * 100)
    debt_score = max(0.0, 30.0 - (dti_ratio * 50.0))
    reserve_score = min(30.0, (emergency_months / 6.0) * 30.0)

    score = cashflow_score + debt_score + reserve_score
    return round(max(0.0, min(100.0, score)), 1)


class FinancialStateEngine:
    @staticmethod
    def simulate_goal_feasibility(
        current_state: FinancialState,
        goal_name: str = "Financial Goal",
        target_amount: float = 1000000.0,
        timeline_years: float = 3.0,
        annual_return_pct: float = 12.0,
    ) -> Dict[str, Any]:
        """Evaluates whether user can reach a financial goal, calculates required SIP & provides an action roadmap."""
        timeline_months = max(1, int(timeline_years * 12))
        net_surplus = current_state.income - (current_state.expenses + current_state.existing_emi)
        
        required_sip = calculate_required_sip(
            target_amount=target_amount,
            current_savings=current_state.savings,
            timeline_months=timeline_months,
            annual_return_pct=annual_return_pct,
        )

        growth_sip = round(required_sip * 0.70, 2)
        emergency_sip = round(required_sip * 0.30, 2)

        surplus_gap = required_sip - net_surplus

        if net_surplus >= required_sip:
            verdict = "HIGHLY FEASIBLE"
            verdict_explanation = f"Your net monthly surplus (₹{net_surplus:,.0f}) fully covers the required monthly SIP of ₹{required_sip:,.0f}."
        elif net_surplus > (required_sip * 0.75):
            verdict = "FEASIBLE WITH MINOR ADJUSTMENT"
            verdict_explanation = f"Your current surplus is ₹{net_surplus:,.0f}. A small monthly cut of ₹{surplus_gap:,.0f} in discretionary spending makes this 100% achievable."
        else:
            verdict = "REQUIRES STEP-UP / EXTENSION"
            verdict_explanation = f"Required monthly SIP (₹{required_sip:,.0f}) exceeds current surplus (₹{net_surplus:,.0f}). Use a 10-15% annual step-up SIP strategy as income grows."

        roadmap_steps = [
            f"1. **Start Monthly SIP Immediately**: Allocate ₹{growth_sip:,.0f}/month to Equity/Nifty Index Mutual Funds + ₹{emergency_sip:,.0f}/month to Liquid Debt Funds.",
            f"2. **Automate Transfers**: Set up an auto-debit SIP on the 1st of every month right after salary credit.",
            f"3. **Annual Step-Up Strategy**: Increase total monthly SIP by 10% to 15% each year following annual appraisal increments.",
            f"4. **Rebalance Annually**: Shift 20% of accumulated equity into liquid/fixed-income debt 6 months prior to your target date to lock in capital.",
        ]

        if surplus_gap > 0 and net_surplus > 0:
            roadmap_steps.insert(1, f"**Targeted Expense Trim**: Reduce dining out & subscriptions by ₹{round(surplus_gap, 0):,.0f}/month to bridge the surplus gap.")

        return {
            "goal": {
                "goal_name": goal_name,
                "target_amount": target_amount,
                "timeline_years": timeline_years,
                "timeline_months": timeline_months,
                "current_savings": current_state.savings,
            },
            "financial_baseline": {
                "monthly_income": current_state.income,
                "monthly_expenses": current_state.expenses,
                "monthly_emi": current_state.existing_emi,
                "net_monthly_surplus": round(net_surplus, 2),
            },
            "feasibility": {
                "verdict": verdict,
                "verdict_explanation": verdict_explanation,
                "required_monthly_sip": required_sip,
                "growth_mutual_fund_sip": growth_sip,
                "liquid_emergency_sip": emergency_sip,
                "surplus_gap": round(max(0.0, surplus_gap), 2),
                "expected_annual_return_pct": annual_return_pct,
            },
            "action_roadmap": roadmap_steps,
        }

    @staticmethod
    def simulate_loan_scenario(
        current_state: FinancialState,
        loan_amount: float,
        annual_interest_rate: float = 10.5,
        tenure_months: int = 60,
        down_payment: float = 0.0,
    ) -> Dict[str, Any]:
        scenario = current_state.clone()

        effective_principal = max(0.0, loan_amount - down_payment)
        new_emi = calculate_emi(effective_principal, annual_interest_rate, tenure_months)

        baseline_total_emi = current_state.existing_emi
        baseline_outflow = current_state.expenses + baseline_total_emi
        baseline_surplus = current_state.income - baseline_outflow
        baseline_dti = (baseline_total_emi / current_state.income * 100.0) if current_state.income > 0 else 0.0
        baseline_health = calculate_health_score(
            current_state.income, current_state.expenses, baseline_total_emi, current_state.savings
        )

        scenario.savings = max(0.0, scenario.savings - down_payment)
        scenario.liabilities += effective_principal
        scenario.existing_emi += new_emi

        scenario_total_emi = scenario.existing_emi
        scenario_outflow = scenario.expenses + scenario_total_emi
        scenario_surplus = scenario.income - scenario_outflow
        scenario_dti = (scenario_total_emi / scenario.income * 100.0) if scenario.income > 0 else 0.0
        scenario_health = calculate_health_score(
            scenario.income, scenario.expenses, scenario_total_emi, scenario.savings
        )

        goal_delays = []
        for g in current_state.goals:
            target = float(g.get("targetAmount", 0))
            current = float(g.get("currentAmount", 0))
            remaining = target - current
            if remaining > 0:
                baseline_months = (remaining / baseline_surplus) if baseline_surplus > 0 else 999
                scenario_months = (remaining / scenario_surplus) if scenario_surplus > 0 else 999
                delay_months = round(max(0.0, scenario_months - baseline_months), 1)
                goal_delays.append({
                    "goalName": g.get("goalName"),
                    "delay_months": delay_months if scenario_surplus > 0 else "Indefinite (Negative Surplus)",
                })

        return {
            "baseline": {
                "income": current_state.income,
                "monthly_emi": baseline_total_emi,
                "monthly_surplus": round(baseline_surplus, 2),
                "dti_ratio_pct": round(baseline_dti, 1),
                "health_score": baseline_health,
                "savings": current_state.savings,
            },
            "scenario": {
                "loan_principal": loan_amount,
                "down_payment": down_payment,
                "added_monthly_emi": new_emi,
                "total_monthly_emi": scenario_total_emi,
                "new_monthly_surplus": round(scenario_surplus, 2),
                "new_dti_ratio_pct": round(scenario_dti, 1),
                "new_health_score": scenario_health,
                "health_score_delta": round(scenario_health - baseline_health, 1),
                "remaining_savings": scenario.savings,
                "affordability_verdict": (
                    "AFFORDABLE" if scenario_surplus > (current_state.income * 0.15) and scenario_dti <= 45
                    else ("STRETCHED" if scenario_surplus > 0 else "UNAFFORDABLE")
                ),
            },
            "goal_impacts": goal_delays,
        }
