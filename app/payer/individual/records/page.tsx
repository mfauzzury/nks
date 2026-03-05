"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, FileText, PieChart as PieChartIcon, ReceiptText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getTransactionsByIdentity, type IdentityTransactionsResult } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";

type Tx = IdentityTransactionsResult["data"]["transactions"][number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const PIE_COLORS = ["#7E30E1", "#E26EE5", "#49108B", "#a855f7", "#c084fc", "#d8b4fe", "#9333ea", "#7c3aed", "#a78bfa", "#8b5cf6"];

function extractZakatType(method: string) {
  const parts = method.split("|").map((v) => v.trim()).filter(Boolean);
  return parts.length > 1 ? parts[1] : "-";
}

export default function IndividualRecordsPage() {
  const session = usePortalSession();
  const identityNo = session?.identityNo || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Tx[]>([]);
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [latestPaidAt, setLatestPaidAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!identityNo) {
        setLoading(false);
        setRows([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await getTransactionsByIdentity(identityNo);
        setRows(res.data.transactions);
        setTotalAmount(res.data.totalAmount || 0);
        setLatestPaidAt(res.data.latestPaidAt || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuatkan rekod transaksi");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [identityNo]);

  const [filterZakat, setFilterZakat] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const yearOptions = useMemo(() => {
    const set = new Set(rows.map((r) => new Date(r.paidAt).getFullYear().toString()));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [rows]);

  const zakatOptions = useMemo(() => {
    const set = new Set(rows.map((r) => extractZakatType(r.paymentMethod)).filter((v) => v !== "-"));
    return Array.from(set).sort();
  }, [rows]);

  const methodOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.paymentMethod.split("|").map((p) => p.trim()).filter(Boolean)[0] || "").filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  // Year-filtered rows (used by stats, chart, and table)
  const yearRows = useMemo(() => {
    if (!filterYear) return rows;
    return rows.filter((r) => new Date(r.paidAt).getFullYear().toString() === filterYear);
  }, [rows, filterYear]);

  const filteredRows = useMemo(() => {
    return yearRows.filter((r) => {
      if (filterZakat && extractZakatType(r.paymentMethod) !== filterZakat) return false;
      const method = r.paymentMethod.split("|").map((p) => p.trim()).filter(Boolean)[0] || "";
      if (filterMethod && method !== filterMethod) return false;
      return true;
    });
  }, [yearRows, filterZakat, filterMethod]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * perPage, page * perPage), [filteredRows, page]);

  // Reset page when filters change
  const resetPage = useCallback(() => setPage(1), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { resetPage(); }, [filterZakat, filterMethod, filterYear]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of yearRows) {
      const type = extractZakatType(r.paymentMethod);
      map.set(type, (map.get(type) || 0) + Number(r.amount));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [yearRows]);

  const filteredTotalAmount = useMemo(() => yearRows.reduce((sum, r) => sum + Number(r.amount), 0), [yearRows]);
  const totalTransactions = yearRows.length;
  const latestReceipt = useMemo(() => (yearRows[0]?.receiptNo ? yearRows[0].receiptNo : "-"), [yearRows]);
  const filteredLatestPaidAt = useMemo(() => (yearRows[0]?.paidAt ? yearRows[0].paidAt : null), [yearRows]);
  const selectedMethod = selectedTx?.paymentMethod.split("|").map((p) => p.trim()).filter(Boolean)[0] || "-";
  const selectedZakatType = selectedTx ? extractZakatType(selectedTx.paymentMethod) : "-";

  function openReceipt(tx: Tx) {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  }

  if (!identityNo) {
    return (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl" />
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session?.payerType === "individu" ? <PortalSubnav role="individu" session={session} variant="onDark" /> : null}
          <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Rekod Sumbangan</h1>
                <p className="text-sm text-purple-100">Sila log masuk untuk melihat rekod anda.</p>
              </div>
            </div>
          </div>
          <section className="rounded-2xl border border-white/20 bg-white/12 p-6 backdrop-blur-md">
            <p className="text-sm text-purple-100">Akses rekod memerlukan sesi portal individu yang sah.</p>
            <div className="mt-4">
              <Link href="/portal/login" className="rounded-xl bg-gradient-to-r from-[#E26EE5] to-[#7E30E1] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-[#d45ed5] hover:to-[#6b28c0]">
                Log Masuk
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session?.payerType === "individu" ? <PortalSubnav role="individu" session={session} variant="onDark" /> : null}

        <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Rekod Sumbangan</h1>
              <p className="text-sm text-purple-100">Semak transaksi berdasarkan IC log masuk: {identityNo}</p>
            </div>
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border-2 border-white/30 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="" className="text-slate-900">Semua Tahun</option>
            {yearOptions.map((opt) => (
              <option key={opt} value={opt} className="text-slate-900">{opt}</option>
            ))}
          </select>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <p className="text-sm text-purple-100">Jumlah Transaksi</p>
            <p className="mt-2 text-2xl font-semibold text-[#1CEC72]">{loading ? "..." : totalTransactions}</p>
          </article>
          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <p className="text-sm text-purple-100">Jumlah Sumbangan</p>
            <p className="mt-2 text-2xl font-semibold text-[#1CEC72]">{loading ? "..." : formatCurrency(filteredTotalAmount)}</p>
          </article>
          <article className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <p className="text-sm text-purple-100">Resit Terkini</p>
            <p className="mt-2 text-base font-semibold text-[#1CEC72]">{loading ? "..." : latestReceipt}</p>
            <p className="mt-1 text-xs text-purple-200/70">{filteredLatestPaidAt ? formatDate(filteredLatestPaidAt) : "-"}</p>
          </article>
        </section>

        {!loading && chartData.length > 0 && (
          <section className="rounded-2xl border border-white/20 bg-white/12 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-200" />
              <h2 className="text-base font-semibold text-white">Pecahan Jenis Sumbangan</h2>
            </div>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="h-[220px] w-[220px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.8125rem", background: "rgba(73,16,139,0.9)", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {chartData.map((item, i) => {
                  const pct = filteredTotalAmount > 0 ? ((item.value / filteredTotalAmount) * 100).toFixed(1) : "0";
                  return (
                    <div key={item.name} className="flex items-center gap-3 text-sm">
                      <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 text-purple-100">{item.name}</span>
                      <span className="font-medium text-[#1CEC72]">{formatCurrency(item.value)}</span>
                      <span className="w-12 text-right text-xs text-purple-200/60">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-white/20 portal-card p-6 shadow-md">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-[#7E30E1]" />
              <h2 className="text-base font-semibold text-slate-900">Senarai Transaksi</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterZakat}
                onChange={(e) => setFilterZakat(e.target.value)}
                className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm text-slate-700 focus:border-[#7E30E1] focus:outline-none focus:ring-1 focus:ring-[#7E30E1]"
              >
                <option value="">Semua Jenis Zakat</option>
                {zakatOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm text-slate-700 focus:border-[#7E30E1] focus:outline-none focus:ring-1 focus:ring-[#7E30E1]"
              >
                <option value="">Semua Kaedah</option>
                {methodOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Resit</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tarikh</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Jenis Zakat</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Kaedah</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-400">Memuatkan...</td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                      {rows.length === 0 ? "Tiada transaksi ditemui." : "Tiada transaksi sepadan dengan penapis."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => {
                    const methodParts = row.paymentMethod.split("|").map((p) => p.trim()).filter(Boolean);
                    const method = methodParts[0] || "-";
                    return (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{row.receiptNo}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(row.paidAt)}</td>
                        <td className="px-3 py-2 text-slate-700">{extractZakatType(row.paymentMethod)}</td>
                        <td className="px-3 py-2 text-slate-600">{method}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(Number(row.amount))}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            title="Lihat Resit"
                            onClick={() => openReceipt(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#7E30E1]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredRows.length > perPage && (
            <div className="flex items-center justify-between border-t border-slate-100 px-3 pt-4">
              <p className="text-xs text-slate-500">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredRows.length)} daripada {filteredRows.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-medium text-slate-700">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

      <Dialog
        open={isReceiptOpen}
        onOpenChange={(open) => {
          setIsReceiptOpen(open);
          if (!open) setSelectedTx(null);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-lg overflow-hidden rounded-2xl border border-slate-200 p-0">
          {selectedTx ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-[#7E30E1]">
                    <ReceiptText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Butiran Transaksi</h3>
                    <p className="text-xs text-slate-500">{selectedTx.receiptNo}</p>
                  </div>
                </div>
                <DialogClose className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <span className="text-base leading-none">&times;</span>
                  <span className="sr-only">Tutup</span>
                </DialogClose>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {selectedTx.status === "completed" ? "Selesai" : selectedTx.status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Bayaran Terus
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Jumlah Bayaran</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{formatCurrency(Number(selectedTx.amount))}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">No. Resit</p>
                    <p className="mt-0.5 font-medium text-slate-700">{selectedTx.receiptNo}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Tarikh</p>
                    <p className="mt-0.5 font-medium text-slate-700">{formatDate(selectedTx.paidAt)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Nama Pembayar</p>
                    <p className="mt-0.5 font-medium text-slate-700">{selectedTx.guestName}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">IC / Passport</p>
                    <p className="mt-0.5 font-medium text-slate-700">{selectedTx.identityNo}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Jenis Zakat</p>
                    <p className="mt-0.5 font-medium text-slate-700">{selectedZakatType}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Kaedah Bayaran</p>
                    <p className="mt-0.5 font-medium text-slate-700">{selectedMethod}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <DialogClose className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Tutup
                </DialogClose>
                <button
                  type="button"
                  onClick={() =>
                    downloadReceiptPdf({
                      receiptNo: selectedTx.receiptNo,
                      guestName: selectedTx.guestName,
                      identityNo: selectedTx.identityNo,
                      amount: selectedTx.amount,
                      paymentMethod: selectedTx.paymentMethod,
                      paidAt: selectedTx.paidAt,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#7E30E1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6b28c0]"
                >
                  <Download className="h-4 w-4" />
                  Muat Turun PDF
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
}
