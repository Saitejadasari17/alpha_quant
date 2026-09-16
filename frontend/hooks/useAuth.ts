"use client";

import { useEffect, useMemo } from "react";
import { api } from "../lib/api";
import { AUTH_TOKEN_KEY } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import { LoginPayload, RegisterPayload } from "../types/user";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const reset = useAuthStore((state) => state.reset);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile();
      setUser(response.data);
    } catch {
      reset();
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload) => {
    try {
      setLoading(true);
      const response = await api.login(payload);
      setUser(response.data.user);
      setToken(response.data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      }
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      setLoading(true);
      const response = await api.register(payload);
      setUser(response.data.user);
      setToken(response.data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      }
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    reset();
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = "/login";
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      return;
    }

    if (!token) {
      setToken(storedToken);
      void loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user && token), [token, user]);

  return {
    user,
    token,
    error,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    loadProfile,
  };
}
