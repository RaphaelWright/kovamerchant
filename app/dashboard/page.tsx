"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi } from "../lib/api";
import type { DashboardSummary } from "../lib/types";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

function OrderPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${color}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-bold text-sm">{count}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getSummary()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-muted text-sm">{error ?? "No data available."}</div>
    );
  }

  const { merchantInfo: m } = data;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good day, {m.businessName}</h1>
          <p className="text-sm text-muted mt-0.5">Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
            m.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700"
              : m.status === "SUSPENDED"
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {m.status.replace("_", " ")}
        </span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`GHS ${data.totalRevenue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`} sub="All time" accent="text-brand" />
        <StatCard label="Total Orders" value={data.totalOrders} sub="All time" />
        <StatCard label="Products" value={data.totalProducts} sub="Active listings" />
        <StatCard label="Invoices" value={data.totalInvoices} sub={`Billing: ${m.billingCycle}`} />
      </div>

      {/* Orders breakdown + Quick links */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-sm">Orders Breakdown</h2>
            <Link href="/dashboard/orders" className="text-xs text-brand font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <OrderPill label="Pending" count={data.pendingOrders} color="bg-amber-50 text-amber-700" />
            <OrderPill label="Processing" count={data.processingOrders} color="bg-blue-50 text-blue-700" />
            <OrderPill label="Completed" count={data.completedOrders} color="bg-emerald-50 text-emerald-700" />
            <OrderPill label="Cancelled" count={data.cancelledOrders} color="bg-red-50 text-red-600" />
          </div>
        </div>

        {/* Store info */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="font-semibold text-foreground text-sm mb-4">Store Details</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Business", value: m.businessName },
              { label: "Email", value: m.email },
              { label: "Phone", value: m.phoneNumber },
              {
                label: "MoMo",
                value: m.momoAccount
                  ? `${m.momoAccount.network} · ${m.momoAccount.phoneNumber}`
                  : "Not set up",
              },
              { label: "Billing cycle", value: m.billingCycle },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">{row.label}</span>
                <span className="font-medium text-foreground text-right">{row.value}</span>
              </div>
            ))}
          </div>
          {!m.momoAccount && (
            <Link
              href="/dashboard/settings"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-brand text-brand text-sm font-medium hover:bg-brand-muted transition"
            >
              Set up MoMo account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
