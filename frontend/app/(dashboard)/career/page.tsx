"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../components/ui/card";
import { useAuth } from "../../../hooks/useAuth";
import { api, CareerRecommendation } from "../../../lib/api";

export default function CareerPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CareerRecommendation[]>([]);
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
      const response = await api.getCareerRecommendations(userId);
      if (response?.data) {
        setItems(response.data);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load career recommendations");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Career</h1>
        <p className="text-sm text-slate-600">
          AI suggestions for upskilling and salary growth based on your profile cluster.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Career Growth Planner</h2>

        {isLoading ? <p className="mt-2 text-sm text-slate-600">Loading career recommendations...</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        {!isLoading && items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No career recommendations available yet.
          </p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.title} className="rounded-md border border-surface-muted p-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-600">{item.reason}</p>
                <p className="text-xs text-slate-500">Expected salary band: {item.expected_salary_band}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
