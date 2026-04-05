"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, saveToken } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(email, password);
      saveToken(res.token);
      localStorage.setItem("kova_merchant", JSON.stringify(res.merchant));
      router.replace("/dashboard");
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 401) setError("Invalid email or password.");
      else if (e.status === 403) setError("Your account is suspended or pending approval.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Kova Marketplace" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-foreground tracking-tight">Kova Marketplace</span>
          </div>
          <h1 className="text-base font-semibold text-foreground">Merchant Portal</h1>
          <p className="text-muted text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand hover:bg-brand-light text-white font-semibold py-3 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Kova Marketplace &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
