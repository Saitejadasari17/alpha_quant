"use client";

import { useAuth } from "../../hooks/useAuth";
import { useOnboardingPlan } from "../../hooks/useOnboardingPlan";
import { formatCurrency } from "../../lib/utils";
import { Transaction } from "../../types/transaction";
import { Card } from "../ui/card";

type OverviewCardsProps = {
  transactions: Transaction[];
  monthlyIncome?: number;
  isLoading?: boolean;
};

export function OverviewCards({ transactions, monthlyIncome = 0, isLoading }: OverviewCardsProps) {
  const { user } = useAuth();
  const { profile: onboarding } = useOnboardingPlan();

  const totalsFromTx = transactions.reduce(
    (accumulator, transaction) => {
      const amt = Number(transaction.amount) || 0;
      if (transaction.type === "income") {
        accumulator.income += amt;
      } else if (transaction.type === "expense") {
        accumulator.expenses += amt;
      } else {
        accumulator.emis += amt;
      }
      return accumulator;
    },
    { income: 0, expenses: 0, emis: 0 },
  );

  const userIncomeNum = Number(monthlyIncome) || Number(user?.monthlyIncome || 0);
  const onboardingIncomeNum = Number(onboarding?.monthlyIncome || 0);
  const fallbackIncome = userIncomeNum || onboardingIncomeNum || 0;

  const fallbackExpenses = onboarding
    ? Number(onboarding.monthlyEssentials || 0) + Number(onboarding.monthlyLifestyle || 0)
    : 0;
  const fallbackEmis = onboarding?.monthlyEmi ? Number(onboarding.monthlyEmi) : 0;

  const income = totalsFromTx.income > 0 ? totalsFromTx.income : fallbackIncome;
  const expenses = totalsFromTx.expenses > 0 ? totalsFromTx.expenses : fallbackExpenses;
  const emis = totalsFromTx.emis > 0 ? totalsFromTx.emis : fallbackEmis;
  const savings = income - expenses - emis;

  const cards = [
    { title: "Monthly Income", value: income },
    { title: "Expenses", value: expenses },
    { title: "EMIs", value: emis },
    { title: "Net Savings", value: savings },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <p className="text-sm text-slate-600">{card.title}</p>
          <p className="mt-2 text-2xl font-bold">
            {isLoading ? "..." : formatCurrency(card.value)}
          </p>
        </Card>
      ))}
    </section>
  );
}
