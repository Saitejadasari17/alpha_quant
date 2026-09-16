"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import {
  createFirstActionPlan,
  defaultOnboardingProfile,
  ONBOARDING_STORAGE_KEY,
  OnboardingProfile,
} from "../../../lib/onboarding";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function OnboardingPage() {
  const { user, loadProfile } = useAuth();
  const [form, setForm] = useState<OnboardingProfile>(defaultOnboardingProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stored profile on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setForm({ ...defaultOnboardingProfile, ...parsed });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Sync user income if stored profile has 0
useEffect(() => {
  const monthlyIncome = Number(user?.monthlyIncome || 0);

  if ((form.monthlyIncome || 0) <= 0 && monthlyIncome > 0) {
    setForm((prev) => ({
      ...prev,
      monthlyIncome,
    }));
  }
}, [user?.monthlyIncome, form.monthlyIncome]);

  const plan = useMemo(() => createFirstActionPlan(form), [form]);

  const onSave = async () => {
    try {
      setError(null);
      setMessage(null);
      setIsSaving(true);

      // 1. Save to local storage
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(form));

      // 2. Sync profile income to backend
      if (form.monthlyIncome > 0) {
        await api.updateProfile({
          monthlyIncome: form.monthlyIncome,
        });
        await loadProfile();
      }

      // 3. Create goal in backend if provided
      if (form.goalName.trim() && form.goalTargetAmount > 0) {
        const targetYears = form.goalYears || 3;
        const targetDateObj = new Date();
        targetDateObj.setFullYear(targetDateObj.getFullYear() + targetYears);
        const targetDateStr = targetDateObj.toISOString().split("T")[0];

        try {
          await api.createGoal({
            goalName: form.goalName.trim(),
            targetAmount: form.goalTargetAmount,
            currentAmount: form.currentSavings || 0,
            targetDate: targetDateStr,
          });
        } catch (goalErr) {
          console.warn("Goal creation skipped or existing:", goalErr);
        }
      }

      // 4. Create primary income transaction in backend if none exists
      // 4. Create primary income transaction in backend if none exists
try {
  const existingTx = await api.getTransactions();
  const hasIncomeTx = existingTx.data?.some(
    (t) => t.type === "income" && t.amount > 0
  );

  if (!hasIncomeTx && form.monthlyIncome > 0) {
    await api.createTransaction({
      amount: form.monthlyIncome,
      category: "Salary & Primary Income",
      type: "income",
      transactionDate: new Date().toISOString(),
    });
  }

  if (
    form.monthlyEmi > 0 &&
    !existingTx.data?.some((t) => t.type === "emi")
  ) {
    await api.createTransaction({
      amount: form.monthlyEmi,
      category: "Loan & EMI Outflow",
      type: "emi",
      transactionDate: new Date().toISOString(),
    });
  }
} catch (txErr) {
  console.warn("Transaction sync skipped:", txErr);
}

      // Broadcast events across frontend
      window.dispatchEvent(new Event("onboarding:updated"));
      window.dispatchEvent(new Event("finance:updated"));

      setMessage("Onboarding saved successfully! Dashboard, goals, and AI Agent recommendations updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save onboarding.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-slate-600">
          Complete this once to get your personalized first action plan.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Step 1: Income, EMI, Expenses</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            type="number"
            label="Monthly Income (INR)"
            value={String(form.monthlyIncome)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, monthlyIncome: toNumber(event.target.value) }))
            }
          />
          <Input
            type="number"
            label="Monthly EMI (INR)"
            value={String(form.monthlyEmi)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, monthlyEmi: toNumber(event.target.value) }))
            }
          />
          <Input
            type="number"
            label="Monthly Essentials (INR)"
            value={String(form.monthlyEssentials)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, monthlyEssentials: toNumber(event.target.value) }))
            }
          />
          <Input
            type="number"
            label="Monthly Lifestyle Spend (INR)"
            value={String(form.monthlyLifestyle)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, monthlyLifestyle: toNumber(event.target.value) }))
            }
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Step 2: Goal Planner</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            type="number"
            label="Current Savings (INR)"
            value={String(form.currentSavings)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currentSavings: toNumber(event.target.value) }))
            }
          />
          <Input
            label="Goal Name"
            value={form.goalName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, goalName: event.target.value }))
            }
          />
          <Input
            type="number"
            label="Goal Target Amount (INR)"
            value={String(form.goalTargetAmount)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, goalTargetAmount: toNumber(event.target.value) }))
            }
          />
          <Input
            type="number"
            label="Goal Timeline (Years)"
            value={String(form.goalYears)}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, goalYears: toNumber(event.target.value) }))
            }
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Your First Action Plan Preview</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>Suggested monthly cut: INR {plan.potentialCut.toLocaleString("en-IN")}</p>
          <p>Total SIP: INR {plan.suggestedSip.toLocaleString("en-IN")}</p>
          <p>Growth SIP (MF/Index): INR {plan.growthSip.toLocaleString("en-IN")}</p>
          <p>Emergency SIP (Liquid): INR {plan.emergencySip.toLocaleString("en-IN")}</p>
          <p>EMI Ratio: {(plan.emiRatio * 100).toFixed(1)}%</p>
          <p>Expense Ratio: {(plan.expenseRatio * 100).toFixed(1)}%</p>
        </div>
        <div className="mt-3 space-y-1 text-sm text-slate-700">
          {plan.recommendations.slice(0, 3).map((item) => (
            <p key={item}>- {item}</p>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} isLoading={isSaving}>
          Save Onboarding
        </Button>
        {message ? <p className="text-sm font-semibold text-green-700">{message}</p> : null}
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
