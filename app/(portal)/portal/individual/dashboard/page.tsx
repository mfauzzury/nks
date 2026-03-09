"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  FileText,
  PieChart as PieChartIcon,
  UserRound,
  TrendingUp,
  Calendar,
  Zap,
  ArrowUpRight,
  Clock,
  Star,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PortalActionTiles } from "@/components/portal/PortalActionTiles";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { usePortalSession } from "@/lib/use-portal-session";
import {
  getTransactionsByIdentity,
  getSpgAgreementByIdentity,
  type IdentityTransactionsResult,
  type SpgAgreementResult,
} from "@/lib/payer-portal-api";

type Tx = IdentityTransactionsResult["data"]["transactions"][number];

const PIE_COLORS = [
  "#FFEC00",
  "#0F7FFF",
  "#3A63FF",
  "#8FB6FF",
  "#07137f",
  "#183DE4",
  "#2A4ED9",
  "#000957",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mac",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ogo",
  "Sep",
  "Okt",
  "Nov",
  "Dis",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function extractZakatType(method: string) {
  const parts = method
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[1] : "Lain-lain";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 18) return "Selamat Petang";
  return "Selamat Malam";
}

function getTodayString() {
  return new Intl.DateTimeFormat("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

/** Animated number counter */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

/** Build monthly aggregation from transactions */
function buildMonthlyData(rows: Tx[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.paidAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + Number(r.amount));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, amount]) => {
      const [y, m] = key.split("-");
      return {
        label: `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y.slice(2)}`,
        amount,
      };
    });
}

export default function IndividualDashboardPage() {
  const session = usePortalSession();
  const identityNo = session?.identityNo || "";

  const [loading, setLoading] = useState(Boolean(identityNo));
  const [rows, setRows] = useState<Tx[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [spgData, setSpgData] = useState<SpgAgreementResult["data"] | null>(
    null,
  );

  useEffect(() => {
    if (!identityNo) return;
    getTransactionsByIdentity(identityNo)
      .then((res) => {
        setRows(res.data.transactions);
        setTotalAmount(res.data.totalAmount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    getSpgAgreementByIdentity(identityNo)
      .then((res) => setSpgData(res.data))
      .catch(() => {});
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

  const monthlyData = useMemo(() => buildMonthlyData(rows), [rows]);

  const recentRows = rows.slice(0, 5);

  const avgAmount = rows.length > 0 ? totalAmount / rows.length : 0;
  const topType =
    chartData.length > 0 ? chartData[0].name : "-";
  const latestDate =
    rows.length > 0 ? formatDate(rows[0].paidAt) : "-";

  const animatedTotal = useCountUp(loading ? 0 : totalAmount);
  const animatedCount = useCountUp(loading ? 0 : rows.length);

  return (
    <PortalAuthGuard expected="individu">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        {/* Animated orbs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session ? (
            <PortalSubnav role="individu" session={session} variant="onDark" />
          ) : null}

          {/* ── Welcome Header ── */}
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-white/15 to-white/5 p-6 shadow-lg backdrop-blur-md">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-400/10 text-white ring-1 ring-white/20">
                  <UserRound className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-200/80">
                    {getGreeting()} 👋
                  </p>
                  <h1 className="text-2xl font-bold text-white">
                    {session?.displayName || "Dashboard Pembayar"}
                  </h1>
                  <p className="mt-0.5 text-sm text-purple-200/70">
                    IC: {session?.identityNo || "-"} &middot; Kod:{" "}
                    {session?.payerCode || "-"}
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-purple-100 sm:flex">
                <Calendar className="h-4 w-4 text-yellow-300/80" />
                {getTodayString()}
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Transactions Count */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/15">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-400/15 blur-xl transition-all group-hover:scale-125" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100">
                    Jumlah Transaksi
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/20 text-blue-300">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {loading ? "..." : animatedCount}
                </p>
                <p className="mt-1 text-sm text-purple-200/60">
                  Semua pembayaran zakat anda
                </p>
              </div>
            </article>

            {/* Total Contribution */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/15">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-yellow-400/15 blur-xl transition-all group-hover:scale-125" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100">
                    Jumlah Sumbangan
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/20 text-yellow-300">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {loading ? "..." : formatCurrency(animatedTotal)}
                </p>
                <p className="mt-1 text-sm text-purple-200/60">
                  Keseluruhan bayaran
                </p>
              </div>
            </article>

            {/* Account Status */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/15">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-400/15 blur-xl transition-all group-hover:scale-125" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100">
                    Status Akaun
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-400/20 text-green-300">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                  </span>
                  <p className="text-3xl font-bold text-white">Aktif</p>
                </div>
                <p className="mt-1 text-sm text-purple-200/60">
                  Akaun boleh digunakan
                </p>
              </div>
            </article>
          </section>

          {/* ── Quick Insights Row ── */}
          {!loading && rows.length > 0 && (
            <section className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 shrink-0 text-yellow-300/70" />
                <div className="min-w-0">
                  <p className="truncate text-xs text-purple-200/60">
                    Purata Transaksi
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    {formatCurrency(avgAmount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <Clock className="h-4 w-4 shrink-0 text-blue-300/70" />
                <div className="min-w-0">
                  <p className="truncate text-xs text-purple-200/60">
                    Bayaran Terakhir
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    {latestDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                <Star className="h-4 w-4 shrink-0 text-purple-300/70" />
                <div className="min-w-0">
                  <p className="truncate text-xs text-purple-200/60">
                    Jenis Utama
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    {topType}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── Monthly Trend Chart ── */}
          {!loading && monthlyData.length > 1 && (
            <section className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-300" />
                <h2 className="text-sm font-semibold text-white">
                  Trend Sumbangan Bulanan
                </h2>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="areaGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FFEC00"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#FFEC00"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(196,181,253,0.6)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(196,181,253,0.6)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : String(v)
                      }
                      width={45}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Sumbangan",
                      ]}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "0.8125rem",
                        background: "rgba(0, 9, 87, 0.95)",
                        color: "#fff",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#FFEC00"
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{
                        fill: "#FFEC00",
                        stroke: "#000957",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        fill: "#FFEC00",
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: 6,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ── SPG Section ── */}
          {spgData && spgData.agreements.length > 0 && (
            <section className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-purple-200" />
                <h2 className="text-sm font-semibold text-white">
                  Potongan Gaji (SPG)
                </h2>
              </div>
              {spgData.agreements.map((a, i) => (
                <div key={i} className="rounded-xl bg-white/10 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {a.employerName}
                    </p>
                    {a.employmentStatus && (
                      <span className="rounded-full bg-green-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-green-300 ring-1 ring-green-400/30">
                        {a.employmentStatus}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="text-purple-200/70">
                      Amaun Potongan Bulanan
                    </div>
                    <div className="font-semibold text-yellow-300 text-base">
                      {a.deductionAmount != null
                        ? formatCurrency(a.deductionAmount)
                        : "Belum ditetapkan"}
                    </div>
                    <div className="text-purple-200/70">No. Perjanjian</div>
                    <div className="text-white">{a.agreementNo || "-"}</div>
                    <div className="text-purple-200/70">Berkuatkuasa</div>
                    <div className="text-white">
                      {a.agreementEffectiveDate
                        ? formatDate(a.agreementEffectiveDate)
                        : "-"}
                    </div>
                    <div className="text-purple-200/70">Tarikh Tamat</div>
                    <div className="text-white">
                      {a.agreementExpiryDate
                        ? formatDate(a.agreementExpiryDate)
                        : "-"}
                    </div>
                  </div>
                </div>
              ))}
              {spgData.deductionHistory.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-semibold text-purple-200">
                    Sejarah Potongan Gaji
                  </h3>
                  {spgData.deductionHistory.slice(0, 10).map((d, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between rounded-xl bg-white/8 px-4 py-3 transition-colors hover:bg-white/12"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/15 text-xs font-bold text-blue-300">
                          {MONTH_NAMES[d.periodMonth - 1] || d.periodMonth}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {d.employerName}
                          </p>
                          <p className="text-xs text-purple-200/60">
                            {d.batchReferenceNo} &middot;{" "}
                            {MONTH_NAMES[d.periodMonth - 1] || d.periodMonth}{" "}
                            {d.periodYear}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(d.amount)}
                        </p>
                        {d.paidAt && (
                          <p className="text-[10px] text-purple-200/50">
                            {formatDate(d.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Pie Chart + Recent Transactions ── */}
          <section className="grid gap-4 md:grid-cols-2">
            {/* Pie Chart */}
            <article className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-yellow-300" />
                <h2 className="text-sm font-semibold text-white">
                  Pecahan Sumbangan
                </h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
                </div>
              ) : chartData.length === 0 ? (
                <p className="py-12 text-center text-sm text-purple-200/60">
                  Tiada data untuk dipaparkan
                </p>
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <div className="relative h-52 w-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(255,255,255,0.2)",
                            fontSize: "0.8125rem",
                            background: "rgba(0, 9, 87, 0.95)",
                            color: "#fff",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[10px] uppercase tracking-wider text-purple-200/60">
                        Jumlah
                      </p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    {chartData.map((item, i) => {
                      const pct =
                        totalAmount > 0
                          ? ((item.value / totalAmount) * 100).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={item.name}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/8"
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-md"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="flex-1 text-purple-100">
                            {item.name}
                          </span>
                          <span className="font-semibold text-white">
                            {formatCurrency(item.value)}
                          </span>
                          <span className="w-12 text-right text-purple-200/50">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* Recent Transactions */}
            <article className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-300" />
                  <h2 className="text-sm font-semibold text-white">
                    Transaksi Terkini
                  </h2>
                </div>
                <Link
                  href="/payer/individual/records"
                  className="flex items-center gap-1 text-xs font-medium text-yellow-300/80 transition-colors hover:text-yellow-200"
                >
                  Lihat Semua
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
                </div>
              ) : recentRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-2 h-8 w-8 text-purple-200/30" />
                  <p className="text-sm text-purple-200/60">
                    Tiada transaksi ditemui
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRows.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between rounded-xl bg-white/8 px-4 py-3 transition-all hover:bg-white/12"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 text-sm font-bold text-blue-300">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {extractZakatType(tx.paymentMethod)}
                          </p>
                          <p className="text-xs text-purple-200/60">
                            {tx.receiptNo} &middot; {formatDate(tx.paidAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(Number(tx.amount))}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-400/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                          {tx.status === "paid" ? "Berjaya" : tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          {/* ── Quick Access ── */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Akses Pantas
            </h2>
            <PortalActionTiles
              variant="onDark"
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
      </div>
    </PortalAuthGuard>
  );
}
