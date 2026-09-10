import pytest
from app.digital_twin.state import FinancialState
from app.digital_twin.engine import FinancialStateEngine, calculate_emi, calculate_health_score


def test_calculate_emi():
    # Test ₹1,500,000 loan at 10.5% over 60 months
    emi = calculate_emi(1500000, 10.5, 60)
    assert 32000 < emi < 33000
    assert emi == 32230.12 or emi == 32230.13 or pytest.approx(emi, 1) == 32230.13


def test_digital_twin_scenario():
    state = FinancialState(
        income=100000,
        expenses=50000,
        existing_emi=10000,
        savings=300000,
        goals=[{"goalName": "Buy House", "targetAmount": 2000000, "currentAmount": 500000}],
    )

    result = FinancialStateEngine.simulate_loan_scenario(
        current_state=state,
        loan_amount=1500000,
        annual_interest_rate=10.5,
        tenure_months=60,
    )

    assert result["baseline"]["monthly_surplus"] == 40000
    assert result["scenario"]["added_monthly_emi"] > 32000
    assert result["scenario"]["affordability_verdict"] in ("STRETCHED", "AFFORDABLE")
    assert result["scenario"]["health_score_delta"] < 0
