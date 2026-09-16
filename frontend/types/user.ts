export type User = {
  id: string;
  fullName: string;
  email: string;
  monthlyIncome: number;
  age?: number | null;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  monthlyIncome: number;
  age?: number;
  password: string;
};

export type AuthPayload = {
  user: User;
  token: string;
};
