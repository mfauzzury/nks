"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Plus,
  Users,
} from "lucide-react";
import { getSpgBatchList, type SpgBatchListItem } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";

const CHANNELS = [
  { code: "FPX_B2B", label: "FPX B2B" },
  { code: "CARD", label: "Kad Kredit" },
  { code: "CHEQUE", label: "Cek" },
  { code: "COUNTER_CASH", label: "Kaunter Tunai" },
] as const;

const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "paid_success", label: "Berjaya" },
  { value: "pending_payment", label: "Menunggu Bayaran" },
  { value: "awaiting_online_payment", label: "Menunggu Online" },
  { value: "draft_preview", label: "Draf" },
  { value: "paid_failed", label: "Gagal" },
  { value: "cancelled", label: "Dibatalkan" },
];

function moneyFormat(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

function statusLabel(status: string) {
  switch (status) {
    case "draft_preview": return "Draf";
    case "awaiting_online_payment": return "Menunggu Online";
    case "pending_payment": return "Menunggu Bayaran";
    case "paid_success": return "Berjaya";
    case "paid_failed": return "Gagal";
    case "cancelled": return "Dibatalkan";
    default: return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "paid_success": return "bg-emerald-100 text-emerald-700";
    case "paid_failed":
    case "cancelled": return "bg-red-100 text-red-700";
    case "awaiting_online_payment":
    case "pending_payment": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

export default function CorporateSpgDashboardPage() {
  const session = usePortalSession();
  const employerPayerId = session?.payerId || 0;
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<SpgBatchListItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const loadBatches = useCallback(async () => {
    if (!employerPayerId) return;
    setLoading(true);
    try {
      const res = await getSpgBatchList({ employerPayerId });
      setBatches(res.data);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [employerPayerId]);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  // Stats
  const totalPaid = useMemo(
    () => batches.filter((b) => b.status === "paid_success").reduce((sum, b) => sum + Number(b.totalAmount), 0),
    [batches],
  );
  const totalEmployees = useMemo(
    () => batches.filter((b) => b.status === "paid_success").reduce((sum, b) => sum + b.rowCount, 0),
    [batches],
  );
  const pendingCount = useMemo(
    () => batches.filter((b) => b.status === "pending_payment" || b.status === "awaiting_online_payment").length,
    [batches],
  );

  // Year options from data
  const yearOptions = useMemo(() => {
    const set = new Set(batches.map((b) => String(b.year)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [batches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterYear && String(b.year) !== filterYear) return false;
      return true;
    });
  }, [batches, filterStatus, filterYear]);

  return (
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}
          {/* Header */}
          <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Skim Potongan Gaji (SPG)</h1>
                  <p className="text-sm text-purple-100">
                {session?.companyName || session?.displayName || "Syarikat"} &middot; {session?.identityNo || "-"}
                </p>
              </div>
            </div>
            <Link href="/payer/corporate/spg/new">
              <Button className="h-12 rounded-xl portal-btn-primary px-8 text-base font-semibold shadow-lg  gap-2">
                <Plus className="h-4 w-4" />
                Tambah Bayaran
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-100">Jumlah Dibayar</p>
              <Banknote className="h-4.5 w-4.5 text-purple-200" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {loading ? "..." : moneyFormat(totalPaid)}
            </p>
            <p className="mt-1 text-xs text-purple-200/70">Keseluruhan batch berjaya</p>
          </article>

          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-100">Jumlah Pekerja</p>
              <Users className="h-4.5 w-4.5 text-purple-200" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {loading ? "..." : totalEmployees.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-purple-200/70">Pekerja dalam batch berjaya</p>
          </article>

          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-100">Menunggu Bayaran</p>
              <Clock className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {loading ? "..." : pendingCount}
            </p>
            <p className="mt-1 text-xs text-purple-200/70">Batch belum selesai</p>
          </article>
        </section>

        {/* Batch history table */}
          <div className="rounded-2xl border border-white/20 portal-card p-0 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Senarai Batch SPG</h2>
              <p className="text-sm text-slate-500">Semua batch potongan gaji yang telah dihantar.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 portal-focus"
              >
                <option value="">Semua Tahun</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 portal-focus"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Rujukan</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tempoh</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Kaedah</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Pekerja</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">Memuatkan...</td>
                  </tr>
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                      {batches.length === 0 ? (
                        <div className="space-y-2">
                          <p>Tiada batch SPG lagi.</p>
                          <Link href="/payer/corporate/spg/new">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="h-3.5 w-3.5" />
                              Buat Bayaran Pertama
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        "Tiada batch sepadan dengan penapis."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{row.referenceNo}</p>
                        {row.paidAt && (
                          <p className="text-xs text-slate-400">{formatDate(row.paidAt)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {MONTHS[row.month - 1]} {row.year}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {CHANNELS.find((c) => c.code === row.paymentChannel)?.label || row.paymentChannel}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.rowCount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(row.status)}`}>
                          {row.status === "paid_success" && <CheckCircle2 className="h-3 w-3" />}
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {moneyFormat(Number(row.totalAmount))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/payer/corporate/spg/${row.id}/summary`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </PortalAuthGuard>
  );
}
