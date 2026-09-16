"use client";

import Link from "next/link";
import { useOnboardingPlan } from "../../hooks/useOnboardingPlan";
import { Card } from "../ui/card";

function toPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatInr(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

export function FirstActionPlan() {
  const { plan } = useOnboardingPlan();

  if (!plan) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">First Action Plan</h2>
        <p className="mt-2 text-sm text-slate-600">
          Complete onboarding to get your personalized cut-and-SIP starter plan.
        </p>
        <Link href="/onboarding" className="mt-3 inline-block text-sm font-medium text-primary">
          Start onboarding
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">First Action Plan</h2>
      <p className="mt-1 text-sm text-slate-600">
        Immediate monthly plan based on your onboarding profile.
      </p>

      <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        <p>EMI Ratio: {toPercent(plan.emiRatio)}</p>
        <p>Expense Ratio: {toPercent(plan.expenseRatio)}</p>
        <p>Suggested spend cut: {formatInr(plan.potentialCut)}/month</p>
        <p>Total SIP: {formatInr(plan.suggestedSip)}/month</p>
        <p>Growth SIP (MF/Index): {formatInr(plan.growthSip)}/month</p>
        <p>Emergency SIP (Liquid): {formatInr(plan.emergencySip)}/month</p>
      </div>

      <div className="mt-3 rounded-md border border-surface-muted p-3 text-sm text-slate-700">
        <p className="font-medium">Goal: {plan.goalName}</p>
        <p>
          Estimated timeline:{" "}
          {plan.goalEtaMonths ? `${plan.goalEtaMonths} months` : "Not enough data"}
        </p>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        {plan.recommendations.slice(0, 3).map((item) => (
          <p key={item}>- {item}</p>
        ))}
      </div>
    </Card>
  );
}
