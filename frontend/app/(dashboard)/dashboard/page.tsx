"use client";

import { FinanceOverview } from "../../../components/dashboard/finance-overview";
import { FirstActionPlan } from "../../../components/dashboard/first-action-plan";
import { OverviewCards } from "../../../components/dashboard/overview-cards";
import { WellnessScore } from "../../../components/dashboard/wellness-score";
import { TransactionTable } from "../../../components/transactions/transaction-table";
import { useAuth } from "../../../hooks/useAuth";
import { useFinanceOverview } from "../../../hooks/useFinanceOverview";
import { useFinancialHealth } from "../../../hooks/useFinancialHealth";
import { useTransactions } from "../../../hooks/useTransactions";

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, isLoading } = useTransactions();
  const { summary, isLoading: isHealthLoading } = useFinancialHealth();
  const { budgets, loans, goals, isLoading: isFinanceLoading } = useFinanceOverview();

  const userMonthlyIncome = Number(user?.monthlyIncome || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Track income, expenses, and financial health in one place.
        </p>
      </div>

      <OverviewCards
        transactions={transactions}
        monthlyIncome={userMonthlyIncome}
        isLoading={isLoading}
      />
      <FirstActionPlan />
      <FinanceOverview
        budgets={budgets}
        loans={loans}
        goals={goals}
        monthlyIncome={userMonthlyIncome}
        healthSummary={summary}
        isLoading={isFinanceLoading}
      />
      <WellnessScore summary={summary} isLoading={isHealthLoading} />
      <TransactionTable transactions={transactions.slice(0, 5)} />
    </div>
  );
}
