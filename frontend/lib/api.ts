import axios, { AxiosError } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "./constants";
import { AuthPayload, LoginPayload, RegisterPayload, User } from "../types/user";
import { CreateTransactionPayload, Transaction } from "../types/transaction";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function mapAxiosError(error: unknown): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    throw new Error(status ? `Request failed with status ${status}` : "Request failed");
  }
  throw new Error("Unexpected request error");
}

async function unwrap<T>(requestPromise: Promise<{ data: ApiResponse<T> }>) {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    mapAxiosError(error);
  }
}

function normalizeTransaction(raw: any): Transaction {
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id,
    amount: Number(raw.amount),
    category: raw.category,
    type: raw.type,
    transactionDate: raw.transactionDate ?? raw.transaction_date ?? raw.date,
    createdAt: raw.createdAt ?? raw.created_at,
  };
}

export type InvestmentRecommendation = {
  name: string;
  popularity: number;
  reason: string;
};

export type CareerRecommendation = {
  title: string;
  reason: string;
  expected_salary_band: string;
};

export type FinancialHealthSummary = {
  score: number;
  savingsRate: number;
  emiRatio: number;
  expenseRatio: number;
  recommendations: string[];
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
};

export type Loan = {
  id: string;
  user_id: string;
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  monthly_emi: number;
  remaining_amount: number;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  target_date: string | null;
  current_amount: number;
  created_at: string;
};

export type CreateGoalPayload = {
  goalName: string;
  targetAmount: number;
  targetDate?: string;
  currentAmount?: number;
};

export type SpendingPrediction = {
  user_id: string;
  predicted_amount: number;
  currency: "INR";
  months_ahead: number;
};

export type UpdateProfilePayload = {
  fullName?: string;
  monthlyIncome?: number;
  age?: number;
};

export const api = {
  login: (payload: LoginPayload) =>
    unwrap<AuthPayload>(apiClient.post("/api/v1/users/auth/login", payload)),

  register: (payload: RegisterPayload) =>
    unwrap<AuthPayload>(apiClient.post("/api/v1/users/auth/register", payload)),

  getProfile: () => unwrap<User>(apiClient.get("/api/v1/users/profile")),

  updateProfile: (payload: UpdateProfilePayload) =>
    unwrap<User>(
      apiClient.put("/api/v1/users/me", {
        fullName: payload.fullName,
        monthlyIncome: payload.monthlyIncome,
        age: payload.age,
      }),
    ),

  getTransactions: async () => {
    const response = await unwrap<any[]>(apiClient.get("/api/v1/finance/transactions"));
    return {
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeTransaction)
        : [],
    };
  },

  createTransaction: async (payload: CreateTransactionPayload) => {
    const response = await unwrap<any>(
      apiClient.post("/api/v1/finance/transactions", payload),
    );
    return {
      ...response,
      data: normalizeTransaction(response.data),
    };
  },

  getInvestmentRecommendations: (userId: string) =>
    unwrap<InvestmentRecommendation[]>(
      apiClient.get(`/api/v1/ml/recommendations/investments?user_id=${encodeURIComponent(userId)}`),
    ),

  getCareerRecommendations: (userId: string) =>
    unwrap<CareerRecommendation[]>(
      apiClient.get(`/api/v1/ml/recommendations/career?user_id=${encodeURIComponent(userId)}`),
    ),

  clusterUser: (userId: string) =>
    unwrap<{ user_id: string; cluster_id: number; confidence_score: number; cluster_label: string }>(
      apiClient.post("/api/v1/ml/cluster-user", { user_id: userId }),
    ),

  getFinancialHealth: () =>
    unwrap<FinancialHealthSummary>(apiClient.get("/api/v1/finance/health-score")),

  getBudgets: () => unwrap<Budget[]>(apiClient.get("/api/v1/finance/budgets")),

  getLoans: () => unwrap<Loan[]>(apiClient.get("/api/v1/finance/loans")),

  getGoals: () => unwrap<Goal[]>(apiClient.get("/api/v1/finance/goals")),

  createGoal: (payload: CreateGoalPayload) =>
    unwrap<Goal>(apiClient.post("/api/v1/finance/goals", payload)),

  predictSpending: (userId: string, monthsAhead: number) =>
    unwrap<SpendingPrediction>(
      apiClient.post("/api/v1/ml/predict/spending", {
        user_id: userId,
        months_ahead: monthsAhead,
      }),
    ),
};
