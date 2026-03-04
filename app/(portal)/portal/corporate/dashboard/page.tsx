"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, FileText, PieChart as PieChartIcon, Settings, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PortalActionTiles } from "@/components/portal/PortalActionTiles";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { usePortalSession } from "@/lib/use-portal-session";
import { getTransactionsByIdentity, type IdentityTransactionsResult } from "@/lib/payer-portal-api";

type Tx = IdentityTransactionsResult["data"]["transactions"][number];

const PIE_COLORS = ["#7E30E1", "#E26EE5", "#49108B", "#a855f7", "#c084fc", "#d8b4fe", "#9333ea", "#7c3aed"];

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

export default function CorporateDashboardPage() {
  const session = usePortalSession();
  const identityNo = session?.identityNo || "";

  const [loading, setLoading] = useState(Boolean(identityNo));
  const [rows, setRows] = useState<Tx[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!identityNo) return;
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
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}

          <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {session?.companyName || session?.displayName || "Dashboard Syarikat"}
                  </h1>
                  <p className="text-sm text-purple-100">
                    SSM: {session?.identityNo || "-"} &middot; Kod: {session?.payerCode || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-100">Jumlah Transaksi</p>
                <FileText className="h-4 w-4 text-purple-200" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-[#1CEC72]">{loading ? "..." : rows.length}</p>
              <p className="mt-1 text-sm text-purple-200/70">Semua pembayaran zakat syarikat</p>
            </article>
            <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-100">Jumlah Sumbangan</p>
                <CreditCard className="h-4 w-4 text-purple-200" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-[#1CEC72]">{loading ? "..." : formatCurrency(totalAmount)}</p>
              <p className="mt-1 text-sm text-purple-200/70">Keseluruhan bayaran</p>
            </article>
            <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-100">Status Syarikat</p>
                <Building2 className="h-4 w-4 text-purple-200" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-[#1CEC72]">Aktif</p>
              <p className="mt-1 text-sm text-purple-200/70">Profil lengkap dan sah</p>
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-purple-200" />
                <h2 className="text-sm font-semibold text-white">Pecahan Sumbangan</h2>
              </div>
              {loading ? (
                <p className="py-8 text-center text-sm text-purple-200/60">Memuatkan...</p>
              ) : chartData.length === 0 ? (
                <p className="py-8 text-center text-sm text-purple-200/60">Tiada data untuk dipaparkan</p>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-[180px] w-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2} dataKey="value" strokeWidth={0}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.8125rem", background: "rgba(73,16,139,0.9)", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-1.5">
                    {chartData.map((item, i) => {
                      const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : "0";
                      return (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="flex-1 text-purple-100">{item.name}</span>
                          <span className="font-medium text-[#1CEC72]">{formatCurrency(item.value)}</span>
                          <span className="w-10 text-right text-purple-200/60">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-200" />
                <h2 className="text-sm font-semibold text-white">Transaksi Terkini</h2>
              </div>
              {loading ? (
                <p className="py-8 text-center text-sm text-purple-200/60">Memuatkan...</p>
              ) : recentRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-purple-200/60">Tiada transaksi ditemui</p>
              ) : (
                <div className="space-y-2">
                  {recentRows.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-white">{extractZakatType(tx.paymentMethod)}</p>
                        <p className="text-xs text-purple-200/70">{tx.receiptNo} &middot; {formatDate(tx.paidAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1CEC72]">{formatCurrency(Number(tx.amount))}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">Akses Pantas</h2>
            <PortalActionTiles
              variant="onDark"
              actions={[
                {
                  title: "Bayar Zakat Korporat",
                  desc: "Laksanakan bayaran zakat syarikat terus dari portal.",
                  href: "/payer/corporate/zakat",
                  icon: CreditCard,
                },
                {
                  title: "Urus SPG",
                  desc: "Tambahkan data pekerja dan semak potongan gaji.",
                  href: "/payer/corporate/spg",
                  icon: Users,
                },
                {
                  title: "Kemaskini Syarikat",
                  desc: "Semak dan kemas kini maklumat pendaftaran syarikat.",
                  href: "/payer/corporate/register",
                  icon: Settings,
                },
              ]}
            />
          </section>
        </div>

      </div>
    </PortalAuthGuard>
  );
}
