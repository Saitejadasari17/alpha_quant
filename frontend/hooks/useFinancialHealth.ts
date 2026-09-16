"use client";

import { useCallback, useEffect, useState } from "react";
import { api, FinancialHealthSummary } from "../lib/api";

export function useFinancialHealth() {
  const [summary, setSummary] = useState<FinancialHealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getFinancialHealth();
      setSummary(response.data);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to fetch financial health.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFinancialHealth();
  }, [fetchFinancialHealth]);

  useEffect(() => {
    const onFinanceUpdated = () => {
      void fetchFinancialHealth();
    };

    window.addEventListener("finance:updated", onFinanceUpdated);
    return () => window.removeEventListener("finance:updated", onFinanceUpdated);
  }, [fetchFinancialHealth]);

  return {
    summary,
    isLoading,
    error,
    fetchFinancialHealth,
  };
}
