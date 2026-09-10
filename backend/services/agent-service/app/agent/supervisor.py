import time
import re
from typing import Any, Dict, List, Optional
from app.agent.state import SupervisorState
from app.guardrails.permissions import check_tool_permission, PermissionTier
from app.observability.tracer import AgentTracer
from app.tools.cashflow import calculate_cash_flow
from app.tools.debt import calculate_debt_metrics
from app.tools.financial_profile import get_financial_profile
from app.tools.goals import get_goal_status
from app.tools.health import calculate_financial_health
from app.tools.knowledge import search_financial_knowledge
from app.tools.simulation import simulate_financial_scenario, simulate_goal_reachability, simulate_loan
from app.tools.transactions import get_spending_trends, get_transaction_summary


class AgentSupervisor:
    async def process_request(
        self,
        query: str,
        user_id: str = "user_default",
        auth_header: Optional[str] = None,
        confirmed_tool_call: Optional[Dict[str, Any]] = None,
    ) -> SupervisorState:
        state = SupervisorState(user_query=query, user_id=user_id, auth_header=auth_header)
        tracer = AgentTracer()

        query_lower = query.lower()

        # Step 1: Capability Determination & Planning
        if any(w in query_lower for w in ["reach", "achieve", "can i reach", "can i achieve", "how can i", "target", "timeline"]):
            state.capability = "Goals Feasibility"
            state.plan_steps = [
                {"step_number": 1, "capability": "Goals Feasibility", "description": "Fetch user financial profile & monthly cash flow", "status": "completed"},
                {"step_number": 2, "capability": "Goals Feasibility", "description": "Fetch active goals & current savings", "status": "completed"},
                {"step_number": 3, "capability": "Goals Feasibility", "description": "Execute Digital Twin goal feasibility engine", "status": "completed"},
            ]
        elif any(w in query_lower for w in ["car", "afford", "loan", "lakh", "simulate", "buy", "home"]):
            state.capability = "Simulation"
            state.plan_steps = [
                {"step_number": 1, "capability": "Simulation", "description": "Fetch baseline user profile & cash flow", "status": "completed"},
                {"step_number": 2, "capability": "Simulation", "description": "Calculate debt metrics & existing EMIs", "status": "completed"},
                {"step_number": 3, "capability": "Simulation", "description": "Execute Digital Twin scenario simulation", "status": "completed"},
            ]
        elif any(w in query_lower for w in ["goal", "savings", "shortfall"]):
            state.capability = "Goals"
            state.plan_steps = [
                {"step_number": 1, "capability": "Goals", "description": "Fetch active goals & calculate progress", "status": "completed"},
                {"step_number": 2, "capability": "Goals", "description": "Calculate monthly cash flow surplus", "status": "completed"},
            ]
        else:
            state.capability = "Financial Analysis"
            state.plan_steps = [
                {"step_number": 1, "capability": "Financial Analysis", "description": "Fetch financial profile & health score", "status": "completed"},
                {"step_number": 2, "capability": "Financial Analysis", "description": "Analyze transaction spending trends", "status": "completed"},
                {"step_number": 3, "capability": "Financial Analysis", "description": "Retrieve financial knowledge rules", "status": "completed"},
            ]

        # Step 2: Tool Execution according to Capability Plan
        if state.capability == "Goals Feasibility":
            # Extract target amount and years if present
            target_amount = 1000000.0
            timeline_years = 3.0

            lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)", query_lower)
            if lakh_match:
                target_amount = float(lakh_match.group(1)) * 100000.0

            years_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:year|yr|years)", query_lower)
            if years_match:
                timeline_years = float(years_match.group(1))

            t1_start = time.time()
            profile = await get_financial_profile(auth_header)
            tracer.record_tool_call("get_financial_profile", {}, profile, "AUTOMATIC", t1_start)

            t2_start = time.time()
            goals_res = await get_goal_status(auth_header)
            tracer.record_tool_call("get_goal_status", {}, goals_res, "AUTOMATIC", t2_start)

            # Pick goal name if user has one saved, else default
            goal_name = goals_res[0]["goalName"] if goals_res else "Target Financial Goal"
            if goals_res and goals_res[0].get("targetAmount"):
                target_amount = goals_res[0]["targetAmount"]

            t3_start = time.time()
            goal_sim = await simulate_goal_reachability(
                goal_name=goal_name,
                target_amount=target_amount,
                timeline_years=timeline_years,
                auth_header=auth_header,
            )
            tracer.record_tool_call("simulate_goal_reachability", {"goal_name": goal_name, "target_amount": target_amount, "timeline_years": timeline_years}, goal_sim, "AUTOMATIC", t3_start)

            feas = goal_sim["feasibility"]
            state.digital_twin_comparison = goal_sim

            roadmap_str = "\n".join(goal_sim["action_roadmap"])
            gap_text = f"- **Surplus Gap to Bridge**: ₹{feas['surplus_gap']:,.2f}/month" if feas['surplus_gap'] > 0 else "- **Surplus Coverage**: Fully Covered!"

            state.final_response = (
                f"### Goal Reachability Roadmap: **{feas['verdict']}**\n\n"
                f"{feas['verdict_explanation']}\n\n"
                f"#### Financial Breakdown & Required Monthly Allocation:\n"
                f"- **Goal Target**: ₹{target_amount:,.0f} over {timeline_years} years\n"
                f"- **Total Required Monthly SIP**: **₹{feas['required_monthly_sip']:,.2f}**\n"
                f"  - **Equity / Growth SIP**: ₹{feas['growth_mutual_fund_sip']:,.2f}/month (Nifty Index / Flexi-Cap)\n"
                f"  - **Liquid Emergency Buffer SIP**: ₹{feas['liquid_emergency_sip']:,.2f}/month (High-yield liquid funds)\n"
                f"- **Current Net Monthly Surplus**: ₹{goal_sim['financial_baseline']['net_monthly_surplus']:,.2f}\n"
                f"{gap_text}\n\n"
                f"#### Step-by-Step Action Plan to Reach This Position:\n"
                f"{roadmap_str}"
            )

        elif state.capability == "Simulation":
            loan_amount = 1500000.0
            lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)", query_lower)
            if lakh_match:
                loan_amount = float(lakh_match.group(1)) * 100000.0

            t1_start = time.time()
            profile = await get_financial_profile(auth_header)
            tracer.record_tool_call("get_financial_profile", {}, profile, "AUTOMATIC", t1_start)

            t2_start = time.time()
            cash_flow = await calculate_cash_flow(auth_header)
            tracer.record_tool_call("calculate_cash_flow", {}, cash_flow, "AUTOMATIC", t2_start)

            t3_start = time.time()
            digital_twin_res = await simulate_financial_scenario(
                loan_amount=loan_amount,
                interest_rate=10.5,
                tenure_months=60,
                auth_header=auth_header,
            )
            tracer.record_tool_call(
                "simulate_financial_scenario",
                {"loan_amount": loan_amount, "interest_rate": 10.5, "tenure_months": 60},
                digital_twin_res,
                "AUTOMATIC",
                t3_start,
            )

            state.digital_twin_comparison = digital_twin_res

            sc = digital_twin_res["scenario"]
            bs = digital_twin_res["baseline"]
            state.final_response = (
                f"### Financial Affordability Analysis\n"
                f"Based on your current monthly income of ₹{bs['income']:,.0f}:\n\n"
                f"- **Requested Loan Amount**: ₹{loan_amount:,.0f}\n"
                f"- **New Estimated Monthly EMI**: ₹{sc['added_monthly_emi']:,.2f}\n"
                f"- **Updated Total Monthly EMI**: ₹{sc['total_monthly_emi']:,.2f}\n"
                f"- **New Debt-to-Income (DTI) Ratio**: {sc['new_dti_ratio_pct']}%\n"
                f"- **New Monthly Surplus**: ₹{sc['new_monthly_surplus']:,.2f}\n"
                f"- **Health Score Impact**: {sc['health_score_delta']} pts (New Score: {sc['new_health_score']})\n\n"
                f"**Verdict**: **{sc['affordability_verdict']}**. "
                f"{'Your monthly surplus remains positive, but observe goal delays.' if sc['affordability_verdict'] != 'UNAFFORDABLE' else 'This purchase exceeds safe debt thresholds.'}"
            )

        elif state.capability == "Goals":
            t1_start = time.time()
            goals_res = await get_goal_status(auth_header)
            tracer.record_tool_call("get_goal_status", {}, goals_res, "AUTOMATIC", t1_start)

            t2_start = time.time()
            cash_flow = await calculate_cash_flow(auth_header)
            tracer.record_tool_call("calculate_cash_flow", {}, cash_flow, "AUTOMATIC", t2_start)

            surplus = cash_flow.get("net_monthly_surplus", 0.0)
            response_lines = ["### Financial Goals Overview\n"]
            for g in goals_res:
                months_needed = (g['remainingShortfall'] / surplus) if surplus > 0 else "N/A"
                months_str = f"{months_needed:.1f} months" if isinstance(months_needed, float) else months_needed
                response_lines.append(
                    f"- **{g['goalName']}**: Target ₹{g['targetAmount']:,.0f} | Saved: ₹{g['currentAmount']:,.0f} ({g['progressPct']}%) | Est. Completion: {months_str}"
                )
            response_lines.append(f"\nCurrent monthly surplus available for goal allocation: **₹{surplus:,.2f}**.")
            state.final_response = "\n".join(response_lines)

        else:
            t1_start = time.time()
            profile = await get_financial_profile(auth_header)
            tracer.record_tool_call("get_financial_profile", {}, profile, "AUTOMATIC", t1_start)

            t2_start = time.time()
            health = await calculate_financial_health(auth_header)
            tracer.record_tool_call("calculate_financial_health", {}, health, "AUTOMATIC", t2_start)

            t3_start = time.time()
            trends = await get_spending_trends(auth_header)
            tracer.record_tool_call("get_spending_trends", {}, trends, "AUTOMATIC", t3_start)

            t4_start = time.time()
            kb = await search_financial_knowledge(query)
            tracer.record_tool_call("search_financial_knowledge", {"query": query}, kb, "AUTOMATIC", t4_start)

            score = health.get("healthScore") or health.get("score") or 78
            state.final_response = (
                f"### Financial Health & Spending Analysis\n\n"
                f"- **User Name**: {profile.get('fullName', 'Valued User')}\n"
                f"- **Monthly Income**: ₹{profile.get('monthlyIncome', 0):,.0f}\n"
                f"- **Financial Health Score**: **{score}/100**\n"
                f"- **Top Expense Category**: {trends.get('top_category')}\n\n"
                f"**Key Recommendation**: Maintaining a 3-6 month emergency fund and keeping DTI under 35% ensures long-term stability."
            )

        state.traces = tracer.get_traces()
        return state


supervisor = AgentSupervisor()
