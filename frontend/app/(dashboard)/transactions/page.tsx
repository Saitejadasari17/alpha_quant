"use client";

import { TransactionForm } from "../../../components/transactions/transaction-form";
import { TransactionTable } from "../../../components/transactions/transaction-table";
import { useTransactions } from "../../../hooks/useTransactions";

export default function TransactionsPage() {
  const { transactions, isLoading, addTransaction } = useTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-slate-600">
          Add and manage all your monthly cashflows.
        </p>
      </div>

      <TransactionForm onSubmit={addTransaction} />
      {isLoading ? <p className="text-sm">Loading transactions...</p> : null}
      <TransactionTable transactions={transactions} />
    </div>
  );
}
