"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../components/ui/card";
import { useAuth } from "../../../hooks/useAuth";
import { api, Goal, InvestmentRecommendation, SpendingPrediction } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InvestmentRecommendation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthsAhead, setMonthsAhead] = useState(1);
  const [prediction, setPrediction] = useState<SpendingPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = user?.id || "user_default";
      try {
        await api.clusterUser(userId);
      } catch (cErr) {
        console.warn("Clustering skipped:", cErr);
      }

      const [recRes, goalsRes] = await Promise.allSettled([
        api.getInvestmentRecommendations(userId),
        api.getGoals(),
      ]);

      if (recRes.status === "fulfilled" && recRes.value?.data) {
        setItems(recRes.value.data);
      }
      if (goalsRes.status === "fulfilled" && goalsRes.value?.data) {
        setGoals(goalsRes.value.data);
      }

      // Auto predict spending 1 month ahead
      try {
        const predRes = await api.predictSpending(userId, monthsAhead);
        if (predRes?.data) {
          setPrediction(predRes.data);
        }
      } catch (predErr) {
        console.warn("Prediction skipped:", predErr);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener("finance:updated", handler);
    return () => window.removeEventListener("finance:updated", handler);
  }, [user?.id]);

  const onCreateGoal = async () => {
    if (!goalName.trim() || !targetAmount.trim()) {
      setError("Goal name and target amount are required.");
      return;
    }

    try {
      setError(null);
      const response = await api.createGoal({
        goalName: goalName.trim(),
        targetAmount: Number(targetAmount),
        targetDate: targetDate || undefined,
      });
      if (response?.data) {
        setGoals((previous) => [response.data, ...previous]);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("finance:updated"));
      }
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create goal");
    }
  };

  const onPredictSpending = async () => {
    const userId = user?.id || "user_default";
    try {
      setError(null);
      const response = await api.predictSpending(userId, monthsAhead);
      if (response?.data) {
        setPrediction(response.data);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to predict spending");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Investments</h1>
        <p className="text-sm text-slate-600">
          Personalized recommendations based on your financial cluster.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Personalized Recommendations</h2>

        {isLoading ? <p className="mt-2 text-sm text-slate-600">Loading recommendations...</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        {!isLoading && items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No investment recommendations yet. Complete onboarding or add finance data to improve suggestions.
          </p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.name} className="rounded-md border border-surface-muted p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-600">{item.reason}</p>
                <p className="text-xs text-slate-500">
                  Popularity in your cluster: {(item.popularity * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Goal-Based Planner</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create savings goals and track target allocations.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={goalName}
            onChange={(event) => setGoalName(event.target.value)}
            className="rounded-md border border-surface-muted px-3 py-2 text-sm"
            placeholder="Goal name (e.g. Car Purchase)"
          />
          <input
            type="number"
            min="1"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            className="rounded-md border border-surface-muted px-3 py-2 text-sm"
            placeholder="Target amount"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className="rounded-md border border-surface-muted px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={onCreateGoal}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          type="button"
        >
          Add Goal
        </button>

        <div className="mt-4 space-y-2">
          {goals.length === 0 ? (
            <p className="text-sm text-slate-600">No goals yet.</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="rounded-md border border-surface-muted p-3">
                <p className="font-medium">{goal.goal_name}</p>
                <p className="text-sm text-slate-600">
                  Target: {formatCurrency(Number(goal.target_amount))}
                  {goal.target_date ? ` by ${formatDate(goal.target_date)}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Spending Prediction</h2>
        <p className="mt-1 text-sm text-slate-600">
          Predict upcoming monthly spending using ML.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <select
            value={monthsAhead}
            onChange={(event) => setMonthsAhead(Number(event.target.value))}
            className="rounded-md border border-surface-muted px-3 py-2 text-sm"
          >
            <option value={1}>1 month ahead</option>
            <option value={2}>2 months ahead</option>
            <option value={3}>3 months ahead</option>
          </select>
          <button
            onClick={onPredictSpending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            type="button"
          >
            Predict
          </button>
        </div>
        {prediction ? (
          <p className="mt-3 text-sm text-slate-700">
            Predicted spending ({prediction.months_ahead} month ahead):{" "}
            <span className="font-semibold text-primary">
              {formatCurrency(Number(prediction.predicted_amount))}
            </span>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
