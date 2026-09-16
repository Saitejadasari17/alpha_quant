"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const success = await register({
      fullName,
      email,
      monthlyIncome: Number(monthlyIncome),
      password,
    });

    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Start your financial wellness journey with personalized insights.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          required
          label="Full Name"
          value={fullName}
          placeholder="Aarav Sharma"
          onChange={(event) => setFullName(event.target.value)}
        />
        <Input
          required
          type="email"
          label="Email"
          value={email}
          placeholder="you@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          required
          min={0}
          type="number"
          label="Monthly Income (INR)"
          value={monthlyIncome}
          placeholder="50000"
          onChange={(event) => setMonthlyIncome(event.target.value)}
        />
        <Input
          required
          type="password"
          label="Password"
          value={password}
          placeholder="Create a strong password"
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </main>
  );
}
