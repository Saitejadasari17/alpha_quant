"use client";

import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CreateTransactionPayload, TransactionType } from "../../types/transaction";

type TransactionFormProps = {
  onSubmit: (payload: CreateTransactionPayload) => Promise<boolean>;
};

const types: TransactionType[] = ["income", "expense", "emi"];

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await onSubmit({
      amount: Number(amount),
      category,
      type,
      transactionDate: new Date().toISOString(),
    });

    setIsLoading(false);

    if (!success) {
      setError("Unable to save transaction.");
      return;
    }

    setAmount("");
    setCategory("");
    setType("expense");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-surface-muted bg-surface p-5 md:grid-cols-4"
    >
      <Input
        required
        min={0}
        type="number"
        label="Amount"
        placeholder="500"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />

      <Input
        required
        label="Category"
        placeholder="Food, Rent, Salary"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />

      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        <span>Type</span>
        <select
          className="h-10 w-full rounded-lg border border-surface-muted bg-white px-3 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
        >
          {types.map((item) => (
            <option key={item} value={item}>
              {item.toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Add Transaction
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 md:col-span-4">{error}</p>
      ) : null}
    </form>
  );
}
