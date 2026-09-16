import { FinancialHealthSummary } from "../../lib/api";
import { Card } from "../ui/card";

type WellnessScoreProps = {
  summary: FinancialHealthSummary | null;
  isLoading?: boolean;
};

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function WellnessScore({ summary, isLoading }: WellnessScoreProps) {
  const score = summary?.score ?? 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Financial Health Score</h2>
          <p className="text-sm text-slate-600">
            Computed by backend rules (savings, EMI ratio, expense ratio).
          </p>
          {isLoading ? <p className="mt-2 text-sm text-slate-500">Loading score...</p> : null}
          {summary ? (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>Savings Rate: {formatPercent(summary.savingsRate)}</p>
              <p>EMI Ratio: {formatPercent(summary.emiRatio)}</p>
              <p>Expense Ratio: {formatPercent(summary.expenseRatio)}</p>
              {summary.recommendations?.length ? (
                <div className="pt-1 text-slate-600">
                  {summary.recommendations.slice(0, 3).map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary text-2xl font-bold text-primary">
          {isLoading ? "..." : score}
        </div>
      </div>
    </Card>
  );
}
