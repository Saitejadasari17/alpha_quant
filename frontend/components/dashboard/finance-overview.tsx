import { Budget, FinancialHealthSummary, Goal, Loan } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Card } from "../ui/card";

type FinanceOverviewProps = {
  budgets: Budget[];
  loans: Loan[];
  goals: Goal[];
  monthlyIncome?: number;
  healthSummary?: FinancialHealthSummary | null;
  isLoading?: boolean;
};

function buildPlannerRecommendations(
  monthlyIncome: number,
  emiRatio: number,
  savingsRate: number,
  goalsCount: number,
  backendRecommendations: string[],
) {
  const actionableBackend = backendRecommendations.filter(
    (item) =>
      item.toLowerCase().includes("sip") ||
      item.toLowerCase().includes("emi") ||
      item.toLowerCase().includes("home") ||
      item.toLowerCase().includes("debt") ||
      item.toLowerCase().includes("mutual"),
  );

  if (actionableBackend.length > 0) {
    return actionableBackend.slice(0, 2);
  }

  if (emiRatio > 0.35) {
    return [
      "Prioritize EMI reduction and avoid new long-term liabilities.",
      "Build emergency fund first, then start SIP.",
    ];
  }

  if (monthlyIncome >= 50000 && emiRatio <= 0.2) {
    return [
      "Start SIP in diversified mutual funds (equity index + flexi-cap).",
      goalsCount === 0
        ? "Create a home down-payment goal and fund it with monthly SIP."
        : "Increase SIP allocation toward your home down-payment goal.",
    ];
  }

  if (savingsRate < 0.1) {
    return [
      "Increase savings to 10-15% before aggressive investing.",
      "Use low-cost index SIP to build consistency.",
    ];
  }

  return [
    "Continue SIP in diversified mutual funds.",
    "Increase SIP amount annually as income grows.",
  ];
}

export function FinanceOverview({
  budgets,
  loans,
  goals,
  monthlyIncome = 0,
  healthSummary,
  isLoading,
}: FinanceOverviewProps) {
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.monthly_limit || 0), 0);
  const totalMonthlyEmi = loans.reduce((sum, item) => sum + Number(item.monthly_emi || 0), 0);
  const plannerTips = buildPlannerRecommendations(
    monthlyIncome,
    healthSummary?.emiRatio ?? 0,
    healthSummary?.savingsRate ?? 0,
    goals.length,
    healthSummary?.recommendations ?? [],
  );

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <p className="text-sm text-slate-600">Budget Categories</p>
        <p className="mt-2 text-2xl font-bold">{isLoading ? "..." : budgets.length}</p>
        <p className="mt-1 text-sm text-slate-600">
          Monthly Budget Total: {isLoading ? "..." : formatCurrency(totalBudget)}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-slate-600">Active Loans / EMIs</p>
        <p className="mt-2 text-2xl font-bold">{isLoading ? "..." : loans.length}</p>
        <p className="mt-1 text-sm text-slate-600">
          Monthly EMI Outflow: {isLoading ? "..." : formatCurrency(totalMonthlyEmi)}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-slate-600">Goals & Future Planner</p>
        <p className="mt-2 text-2xl font-bold">{isLoading ? "..." : goals.length}</p>
        <p className="mt-1 text-sm text-slate-600">Actionable plan:</p>
        <p className="mt-1 text-sm text-slate-700">{plannerTips[0]}</p>
        <p className="text-sm text-slate-700">{plannerTips[1]}</p>
      </Card>
    </section>
  );
}
