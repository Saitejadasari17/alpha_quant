"use client";

import { useSyncExternalStore } from "react";
import { User } from "../types/user";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

let state: AuthStore = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  setUser: (user) => setState({ user }),
  setToken: (token) => setState({ token }),
  setLoading: (isLoading) => setState({ isLoading }),
  setError: (error) => setState({ error }),
  reset: () => setState({ user: null, token: null, isLoading: false, error: null }),
};

const listeners = new Set<() => void>();

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const authStore = {
  subscribe,
  getState: () => state,
};

export function useAuthStore<T>(selector: (value: AuthStore) => T): T {
  return useSyncExternalStore(
    authStore.subscribe,
    () => selector(authStore.getState()),
    () => selector(authStore.getState()),
  );
}
