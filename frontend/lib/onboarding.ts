export const ONBOARDING_STORAGE_KEY = "fwp:onboarding:v1";

export type OnboardingProfile = {
  monthlyIncome: number;
  monthlyEmi: number;
  monthlyEssentials: number;
  monthlyLifestyle: number;
  currentSavings: number;
  goalName: string;
  goalTargetAmount: number;
  goalYears: number;
};

export type FirstActionPlan = {
  monthlyIncome: number;
  monthlyOutflow: number;
  emiRatio: number;
  expenseRatio: number;
  potentialCut: number;
  suggestedSip: number;
  growthSip: number;
  emergencySip: number;
  goalName: string;
  goalEtaMonths: number | null;
  recommendations: string[];
};

export const defaultOnboardingProfile: OnboardingProfile = {
  monthlyIncome: 0,
  monthlyEmi: 0,
  monthlyEssentials: 0,
  monthlyLifestyle: 0,
  currentSavings: 0,
  goalName: "Home Down Payment",
  goalTargetAmount: 1000000,
  goalYears: 3,
};

function roundTo500(value: number) {
  return Math.max(0, Math.round(value / 500) * 500);
}

export function createFirstActionPlan(profile: OnboardingProfile): FirstActionPlan {
  const monthlyIncome = Math.max(0, profile.monthlyIncome || 0);
  const monthlyEmi = Math.max(0, profile.monthlyEmi || 0);
  const monthlyEssentials = Math.max(0, profile.monthlyEssentials || 0);
  const monthlyLifestyle = Math.max(0, profile.monthlyLifestyle || 0);
  const currentSavings = Math.max(0, profile.currentSavings || 0);
  const goalTargetAmount = Math.max(0, profile.goalTargetAmount || 0);
  const goalName = profile.goalName?.trim() || "Goal";

  const monthlyOutflow = monthlyEmi + monthlyEssentials + monthlyLifestyle;
  const emiRatio = monthlyIncome > 0 ? monthlyEmi / monthlyIncome : 0;
  const expenseRatio = monthlyIncome > 0 ? monthlyOutflow / monthlyIncome : 0;

  const targetSpendCap = monthlyIncome * 0.6;
  const potentialCut = roundTo500(Math.max(0, monthlyOutflow - targetSpendCap));

  const sipBaseRatio = emiRatio <= 0.2 ? 0.15 : 0.08;
  const suggestedSip = roundTo500(Math.max(1000, monthlyIncome * sipBaseRatio));
  const emergencySip = roundTo500(Math.max(1000, suggestedSip * 0.4));
  const growthSip = roundTo500(Math.max(500, suggestedSip - emergencySip));

  const monthlyGoalContribution = growthSip;
  const remainingAmount = Math.max(0, goalTargetAmount - currentSavings);
  const goalEtaMonths =
    monthlyGoalContribution > 0 ? Math.ceil(remainingAmount / monthlyGoalContribution) : null;

  const recommendations: string[] = [];

  if (emiRatio > 0.3) {
    recommendations.push(
      "EMI is high. Prioritize debt reduction/refinancing before increasing risk investments.",
    );
  }
  if (expenseRatio > 0.8) {
    recommendations.push(
      `Cut non-essential spending by around INR ${potentialCut.toLocaleString(
        "en-IN",
      )}/month to free cashflow.`,
    );
  }
  recommendations.push(
    `Start SIP now: INR ${growthSip.toLocaleString(
      "en-IN",
    )}/month in diversified mutual/index funds + INR ${emergencySip.toLocaleString(
      "en-IN",
    )}/month in liquid emergency fund.`,
  );
  if (emiRatio <= 0.2 && monthlyIncome >= 50000) {
    recommendations.push(
      "Create/continue home down-payment planner and increase SIP by 10% every year.",
    );
  }

  return {
    monthlyIncome,
    monthlyOutflow,
    emiRatio,
    expenseRatio,
    potentialCut,
    suggestedSip,
    growthSip,
    emergencySip,
    goalName,
    goalEtaMonths,
    recommendations,
  };
}
