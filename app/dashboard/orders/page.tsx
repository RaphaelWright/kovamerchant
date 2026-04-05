"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "../../lib/api";
import type { MerchantOrder, OrderStatus } from "../../lib/types";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function statusBadge(s: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-600",
  };
  return map[s] ?? "bg-gray-100 text-gray-600";
}

function paymentBadge(s: string) {
  return s === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  function load(status: OrderStatus | "ALL", p: number) {
    setLoading(true);
    ordersApi
      .list(status === "ALL" ? undefined : status, p, 20, "orderDate,desc")
      .then((res) => {
        setOrders(res.content);
        setTotal(res.totalElements);
        setTotalPages(res.totalPages);
        setPage(res.number);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(activeTab, 0); }, [activeTab]);

  function switchTab(tab: OrderStatus | "ALL") {
    setActiveTab(tab);
    setPage(0);
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted mt-0.5">{total} order{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto mb-6 -mx-1 px-1">
        <div className="flex gap-1 bg-background rounded-xl p-1 w-fit border border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => switchTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 ${
                activeTab === tab.value
                  ? "bg-surface text-brand shadow-sm border border-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">No orders found.</div>
      ) : (
        <>
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Buyer</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Product</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Total</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-background transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{o.orderId}</p>
                      <p className="text-xs text-muted mt-0.5">{new Date(o.orderDate).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="font-medium text-foreground">{o.buyerName}</p>
                      <p className="text-xs text-muted">{o.buyerPhone}</p>
                    </td>
                    <td className="px-5 py-4 text-muted hidden lg:table-cell">
                      <p className="line-clamp-1">{o.productName}</p>
                      <p className="text-xs">Qty: {o.quantity}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">
                      GHS {o.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadge(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/orders/${o.orderId}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand-muted transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 text-sm">
              <span className="text-muted">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => load(activeTab, page - 1)} disabled={page === 0}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-medium hover:bg-background disabled:opacity-40 transition">
                  Previous
                </button>
                <button onClick={() => load(activeTab, page + 1)} disabled={page + 1 >= totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-medium hover:bg-background disabled:opacity-40 transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
