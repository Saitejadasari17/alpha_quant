"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { CreateTransactionPayload, Transaction } from "../types/transaction";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getTransactions();
      setTransactions(response.data);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to fetch transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTransaction = async (payload: CreateTransactionPayload) => {
    try {
      const response = await api.createTransaction(payload);
      setTransactions((previous) => [response.data, ...previous]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("finance:updated"));
      }
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add transaction.");
      return false;
    }
  };

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const onFinanceUpdated = () => {
      void fetchTransactions();
    };

    window.addEventListener("finance:updated", onFinanceUpdated);
    return () => window.removeEventListener("finance:updated", onFinanceUpdated);
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
  };
}
