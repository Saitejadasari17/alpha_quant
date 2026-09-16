export type TransactionType = "income" | "expense" | "emi";

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  category: string;
  type: TransactionType;
  transactionDate: string;
  createdAt: string;
};

export type CreateTransactionPayload = {
  amount: number;
  category: string;
  type: TransactionType;
  transactionDate: string;
};
