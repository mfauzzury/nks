"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, FileText, PieChart as PieChartIcon, UserRound } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PortalActionTiles } from "@/components/portal/PortalActionTiles";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { getPortalSession } from "@/lib/portal-session";
import { getTransactionsByIdentity, type IdentityTransactionsResult } from "@/lib/payer-portal-api";

type Tx = IdentityTransactionsResult["data"]["transactions"][number];

const PIE_COLORS = ["#1f4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#6366f1", "#818cf8", "#a5b4fc"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

function extractZakatType(method: string) {
  const parts = method.split("|").map((v) => v.trim()).filter(Boolean);
  return parts.length > 1 ? parts[1] : "Lain-lain";
}

export default function IndividualDashboardPage() {
  const session = getPortalSession();
  const identityNo = session?.identityNo || "";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Tx[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!identityNo) { setLoading(false); return; }
    getTransactionsByIdentity(identityNo)
      .then((res) => {
        setRows(res.data.transactions);
        setTotalAmount(res.data.totalAmount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [identityNo]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const type = extractZakatType(r.paymentMethod);
      map.set(type, (map.get(type) || 0) + Number(r.amount));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const recentRows = rows.slice(0, 5);

  return (
    <PortalAuthGuard expected="individu">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#1f4ed8]">Portal Individu</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">
            {session?.displayName || "Dashboard Pembayar"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            IC: {session?.identityNo || "-"} &middot; Kod: {session?.payerCode || "-"}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Jumlah Transaksi</p>
              <FileText className="h-4 w-4 text-[#1f4ed8]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? "..." : rows.length}</p>
            <p className="mt-1 text-sm text-slate-500">Semua pembayaran zakat anda</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Jumlah Sumbangan</p>
              <CreditCard className="h-4 w-4 text-[#1f4ed8]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? "..." : formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-sm text-slate-500">Keseluruhan bayaran</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Status Akaun</p>
              <UserRound className="h-4 w-4 text-[#1f4ed8]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">Aktif</p>
            <p className="mt-1 text-sm text-slate-500">Akaun boleh digunakan</p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[#1f4ed8]" />
              <h2 className="text-sm font-semibold text-slate-900">Pecahan Sumbangan</h2>
            </div>
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Memuatkan...</p>
            ) : chartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Tiada data untuk dipaparkan</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-45 w-45">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2} dataKey="value" strokeWidth={0}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.8125rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-1.5">
                  {chartData.map((item, i) => {
                    const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : "0";
                    return (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="flex-1 text-slate-600">{item.name}</span>
                        <span className="font-medium text-slate-800">{formatCurrency(item.value)}</span>
                        <span className="w-10 text-right text-slate-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1f4ed8]" />
              <h2 className="text-sm font-semibold text-slate-900">Transaksi Terkini</h2>
            </div>
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Memuatkan...</p>
            ) : recentRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Tiada transaksi ditemui</p>
            ) : (
              <div className="space-y-2">
                {recentRows.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{extractZakatType(tx.paymentMethod)}</p>
                      <p className="text-xs text-slate-500">{tx.receiptNo} &middot; {formatDate(tx.paidAt)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(Number(tx.amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Akses Pantas</h2>
          <PortalActionTiles
            actions={[
              {
                title: "Bayar Zakat",
                desc: "Buat pembayaran zakat dengan aliran yang ringkas.",
                href: "/payer/individual/pay",
                icon: CreditCard,
              },
              {
                title: "Kemaskini Profil",
                desc: "Hantar kemas kini maklumat asas akaun anda.",
                href: "/payer/individual/register",
                icon: UserRound,
              },
              {
                title: "Semak Rekod",
                desc: "Lihat rekod sumbangan terkini dan resit digital.",
                href: "/payer/individual/records",
                icon: FileText,
              },
            ]}
          />
        </section>
      </div>
    </PortalAuthGuard>
  );
}
