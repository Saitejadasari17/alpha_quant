"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createFirstActionPlan,
  defaultOnboardingProfile,
  FirstActionPlan,
  ONBOARDING_STORAGE_KEY,
  OnboardingProfile,
} from "../lib/onboarding";

function readStoredProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingProfile>;
    return { ...defaultOnboardingProfile, ...parsed };
  } catch {
    return null;
  }
}

export function useOnboardingPlan() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  const refresh = useCallback(() => {
    setProfile(readStoredProfile());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("onboarding:updated", handler);
    return () => window.removeEventListener("onboarding:updated", handler);
  }, [refresh]);

  const plan: FirstActionPlan | null = useMemo(() => {
    if (!profile) {
      return null;
    }
    return createFirstActionPlan(profile);
  }, [profile]);

  return {
    profile,
    plan,
    refresh,
  };
}
