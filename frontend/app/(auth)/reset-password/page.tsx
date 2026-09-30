"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../hooks/useAuth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setValidationError(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setValidationError("Reset token is required.");
      return;
    }

    if (newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    const result = await resetPassword({ token: token.trim(), newPassword });
    if (result && result.message) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    }
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Set New Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a new strong password for your account.
        </p>
      </div>

      {successMessage ? (
        <div className="space-y-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm">
          <p className="font-semibold">{successMessage}</p>
          <p className="text-xs text-slate-600">Redirecting to login page...</p>
          <Link href="/login" className="inline-block">
            <Button type="button" className="w-full mt-2">
              Go to Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            required
            label="Reset Token"
            value={token}
            placeholder="Paste your reset token here"
            onChange={(event) => setToken(event.target.value)}
          />
          <Input
            required
            type="password"
            label="New Password"
            value={newPassword}
            placeholder="Minimum 6 characters"
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Input
            required
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            placeholder="Re-enter your new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {validationError ? (
            <p className="text-sm text-red-600">{validationError}</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
