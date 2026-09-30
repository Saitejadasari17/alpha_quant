"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../hooks/useAuth";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setSuccessMessage(null);
    setResetToken(null);

    const result = await forgotPassword(email);
    if (result) {
      const msg = result.data?.message || result.message || "Password reset instructions have been generated.";
      const token = result.data?.resetToken || (result as any).resetToken;
      setSuccessMessage(msg);
      if (token) {
        setResetToken(token);
      }
    }
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {successMessage ? (
        <div className="space-y-4 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm">
          <p className="font-semibold">{successMessage}</p>
          {resetToken ? (
            <div className="space-y-2 pt-2 border-t border-emerald-200">
              <p className="text-xs text-slate-600 font-mono break-all">
                Reset Token: <span className="font-bold text-slate-900">{resetToken}</span>
              </p>
              <Link
                href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="inline-block"
              >
                <Button type="button" className="w-full">
                  Proceed to Reset Password
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            required
            type="email"
            label="Email Address"
            value={email}
            placeholder="you@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Instructions
          </Button>
        </form>
      )}

      <p className="text-sm text-slate-600">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Back to Sign In
        </Link>
      </p>
    </main>
  );
}
