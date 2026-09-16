import { Transaction } from "../../types/transaction";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Card } from "../ui/card";

type TransactionTableProps = {
  transactions: Transaction[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                No transactions yet.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-surface-muted">
                <td className="px-4 py-3">{formatDate(transaction.transactionDate)}</td>
                <td className="px-4 py-3">{transaction.category}</td>
                <td className="px-4 py-3 uppercase">{transaction.type}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
