"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Budget, Goal, Loan } from "../lib/api";

export function useFinanceOverview() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [budgetsResponse, loansResponse, goalsResponse] = await Promise.all([
        api.getBudgets(),
        api.getLoans(),
        api.getGoals(),
      ]);
      setBudgets(budgetsResponse.data ?? []);
      setLoans(loansResponse.data ?? []);
      setGoals(goalsResponse.data ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to fetch finance overview.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFinanceOverview();
  }, [fetchFinanceOverview]);

  useEffect(() => {
    const onFinanceUpdated = () => {
      void fetchFinanceOverview();
    };

    window.addEventListener("finance:updated", onFinanceUpdated);
    return () => window.removeEventListener("finance:updated", onFinanceUpdated);
  }, [fetchFinanceOverview]);

  return {
    budgets,
    loans,
    goals,
    isLoading,
    error,
    fetchFinanceOverview,
  };
}
