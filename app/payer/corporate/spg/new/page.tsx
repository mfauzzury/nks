"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Coins,
  CreditCard,
  Download,
  FileCheck,
  Landmark,
  Plus,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createSpgBatch,
  downloadSpgTemplate,
  initiateSpgOnlinePayment,
  previewSpgBatchUpload,
  revalidateSpgBatch,
  type SpgPreviewRow,
} from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableRow = {
  id: string;
  employeeName: string;
  employeeIdentityNo: string;
  amount: string;
  agreedAmount: number | null;
  duplicateInFile: boolean;
  duplicateInMonthBatch: boolean;
  errors: string[];
};

const CHANNELS = [
  { code: "FPX_B2B", label: "FPX Online", online: true, icon: Landmark },
  { code: "CARD", label: "Debit/Credit Card", online: true, icon: CreditCard },
  { code: "CHEQUE", label: "Cek", online: false, icon: FileCheck },
  { code: "COUNTER_CASH", label: "Tunai / Kaunter", online: false, icon: Coins },
] as const;

const STEPS = [
  { num: 1, label: "Bulan & Tahun", icon: CalendarDays },
  { num: 2, label: "Muat Naik", icon: Upload },
  { num: 3, label: "Semak Data", icon: ClipboardList },
  { num: 4, label: "Bayaran", icon: Banknote },
  { num: 5, label: "Hantar", icon: Send },
] as const;

const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

function normalizeIdentity(input: string) {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function moneyFormat(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

function mapPreviewRow(row: SpgPreviewRow): EditableRow {
  return {
    id: `${row.rowNo}-${Math.random().toString(36).slice(2, 8)}`,
    employeeName: row.employeeName,
    employeeIdentityNo: row.employeeIdentityNo,
    amount: row.amount != null ? String(row.amount) : "",
    agreedAmount: row.agreedAmount ?? null,
    duplicateInFile: row.duplicateInFile,
    duplicateInMonthBatch: row.duplicateInMonthBatch,
    errors: row.errors,
  };
}

function validateRows(rows: EditableRow[]) {
  const identityCount = new Map<string, number>();
  for (const row of rows) {
    const key = normalizeIdentity(row.employeeIdentityNo);
    if (!key) continue;
    identityCount.set(key, (identityCount.get(key) || 0) + 1);
  }
  return rows.map((row) => {
    const errors: string[] = [];
    const normalizedIc = normalizeIdentity(row.employeeIdentityNo);
    const amount = Number(row.amount);
    if (!row.employeeName.trim()) errors.push("Nama wajib");
    if (!normalizedIc || normalizedIc.length < 3) errors.push("No. IC wajib");
    if (!Number.isFinite(amount) || amount <= 0) errors.push("Amaun mesti > 0");
    if (Number.isFinite(amount) && !Number.isInteger(amount * 100)) errors.push("Maks 2 perpuluhan");
    if (row.agreedAmount != null && Number.isFinite(amount) && amount > 0 && amount !== row.agreedAmount) {
      errors.push(`Amaun tidak sepadan perjanjian (RM ${row.agreedAmount.toFixed(2)})`);
    }
    return {
      ...row,
      employeeIdentityNo: normalizedIc,
      duplicateInFile: normalizedIc ? (identityCount.get(normalizedIc) || 0) > 1 : false,
      errors,
    };
  });
}

function StepIndicator({ current }: { current: number }) {
  return (
    <nav className="relative flex items-center justify-between">
      <div className="absolute left-0 right-0 top-5 z-0 mx-10 h-0.5 bg-slate-200" />
      <div
        className="absolute left-0 top-5 z-0 mx-10 h-0.5 bg-blue-600 transition-all duration-300"
        style={{ width: `${((Math.min(current, 5) - 1) / 4) * 100}%` }}
      />
      {STEPS.map((s) => {
        const done = current > s.num;
        const active = current === s.num;
        const Icon = s.icon;
        return (
          <div key={s.num} className="z-10 flex flex-col items-center gap-1.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                done
                  ? "border-blue-600 bg-blue-600 text-white"
                  : active
                    ? "border-blue-600 bg-white text-blue-600 shadow-sm shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {done ? <Check className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
            </div>
            <span className={`text-xs font-medium ${done || active ? "text-blue-600" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

export default function SpgNewSubmissionPage() {
  const session = usePortalSession();
  const employerPayerId = session?.payerId || 0;
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [paymentChannel, setPaymentChannel] = useState<(typeof CHANNELS)[number]["code"]>("FPX_B2B");
  const [supportingSlip, setSupportingSlip] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatedRows = useMemo(() => validateRows(rows), [rows]);
  const totalAmount = useMemo(
    () => validatedRows.reduce((sum, row) => sum + (Number(row.amount) > 0 ? Number(row.amount) : 0), 0),
    [validatedRows],
  );
  const hasRowIssues = useMemo(
    () => validatedRows.some((row) => row.errors.length > 0 || row.duplicateInFile || row.duplicateInMonthBatch),
    [validatedRows],
  );
  const selectedChannel = CHANNELS.find((x) => x.code === paymentChannel) || CHANNELS[0];
  const validCount = validatedRows.filter((r) => r.errors.length === 0 && !r.duplicateInFile && !r.duplicateInMonthBatch).length;
  const invalidCount = validatedRows.length - validCount;

  async function onPreviewUpload() {
    if (!uploadFile) {
      setError("Sila pilih fail XLSX/CSV");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await previewSpgBatchUpload({
        employerPayerId,
        month: Number(month),
        year: Number(year),
        file: uploadFile,
      });
      setRows(res.data.rows.map(mapPreviewRow));
      setMessage(`Preview berjaya. ${res.data.totals.rowCount} baris diproses.`);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal preview fail");
    } finally {
      setLoading(false);
    }
  }

  function updateRow(id: string, patch: Partial<EditableRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        employeeName: "",
        employeeIdentityNo: "",
        amount: "",
        agreedAmount: null,
        duplicateInFile: false,
        duplicateInMonthBatch: false,
        errors: [],
      },
    ]);
  }

  async function onRevalidateAndProceed() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payloadRows = rows.map((row) => ({
        employeeName: row.employeeName.trim(),
        employeeIdentityNo: normalizeIdentity(row.employeeIdentityNo),
        amount: Number(row.amount) || 0,
      }));
      const res = await revalidateSpgBatch({
        employerPayerId,
        month: Number(month),
        year: Number(year),
        rows: payloadRows,
      });
      setRows(res.data.rows.map(mapPreviewRow));
      const hasIssues = res.data.rows.some(
        (r) => r.errors.length > 0 || r.duplicateInFile || r.duplicateInMonthBatch,
      );
      if (hasIssues) {
        setError(`Masih ada ${res.data.totals.invalidRowCount + res.data.totals.duplicateRowCount} baris bermasalah. Sila betulkan sebelum meneruskan.`);
      } else {
        setMessage(`Semua ${res.data.totals.validRowCount} baris disahkan. Meneruskan...`);
        setStep(4);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengesahkan data");
    } finally {
      setLoading(false);
    }
  }

  async function submitBatch() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payloadRows = validateRows(rows).map((row) => ({
        employeeName: row.employeeName.trim(),
        employeeIdentityNo: normalizeIdentity(row.employeeIdentityNo),
        amount: Number(row.amount),
      }));
      const created = await createSpgBatch({
        employerPayerId,
        month: Number(month),
        year: Number(year),
        paymentChannel,
        rows: payloadRows,
        supportingSlip,
      });
      const batchId = created.data.batchId;
      if (selectedChannel.online) {
        await initiateSpgOnlinePayment(batchId);
      }
      setMessage(`Batch berjaya dihantar. Reference: ${created.data.referenceNo}`);
      window.location.href = `/payer/corporate/spg/${batchId}/summary`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghantar batch SPG");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}
        {/* Back link + header */}
        <div>
          <Link
            href="/payer/corporate/spg"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 transition portal-hover-text-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard SPG
          </Link>
          <h1 className="text-xl font-semibold text-white">Bayaran SPG Baharu</h1>
          <p className="text-sm text-purple-100">
            Muat naik senarai potongan gaji pekerja, semak data, dan buat bayaran.
          </p>
        </div>

        {/* Step indicator */}
        <div className="rounded-2xl border border-white/20 portal-card shadow-md px-6 py-5">
          <StepIndicator current={step} />
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Step 1: Month & Year ── */}
        {step === 1 && (
          <div className="rounded-2xl border border-white/20 portal-card shadow-md">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Pilih Tempoh Potongan</h2>
              <p className="text-sm text-slate-500">Tentukan bulan dan tahun bagi potongan gaji ini.</p>
            </div>
            <div className="px-6 py-5">
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bulan</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 text-base portal-focus"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {MONTHS.map((name, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 text-base portal-focus"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400">Tempoh dipilih</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {MONTHS[Number(month) - 1]} {year}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
              <Button onClick={() => setStep(2)} className="gap-2">
                Seterusnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Upload ── */}
        {step === 2 && (
          <div className="rounded-2xl border border-white/20 portal-card shadow-md">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Muat Naik Senarai Pekerja</h2>
              <p className="text-sm text-slate-500">
                Muat turun template, isi maklumat pekerja, dan muat naik semula.
              </p>
            </div>
            <div className="space-y-5 px-6 py-5">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="mb-3 text-sm font-medium text-slate-700">1. Muat turun template</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => downloadSpgTemplate("xlsx")}>
                    <Download className="h-3.5 w-3.5" />
                    Template XLSX
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => downloadSpgTemplate("csv")}>
                    <Download className="h-3.5 w-3.5" />
                    Template CSV
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="mb-3 text-sm font-medium text-slate-700">2. Muat naik fail yang telah diisi</p>
                <Input
                  type="file"
                  accept=".xlsx,.csv"
                  className="max-w-sm"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUploadFile(e.target.files?.[0] || null)}
                />
                {uploadFile && (
                  <p className="mt-2 text-xs text-slate-500">
                    Fail dipilih: <span className="font-medium text-slate-700">{uploadFile.name}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="ghost" className="gap-2 text-slate-600" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Button type="button" className="gap-2" onClick={onPreviewUpload} disabled={loading || !uploadFile}>
                <Upload className="h-4 w-4" />
                {loading ? "Memproses..." : "Preview & Semak"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview / Edit ── */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Semak & Edit Senarai Pekerja</h2>
                <p className="text-sm text-slate-500">Betulkan baris yang ada isu sebelum meneruskan.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
                <Plus className="h-3.5 w-3.5" />
                Tambah Baris
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Jumlah Baris</p>
                <p className="mt-0.5 text-lg font-semibold text-slate-900">{validatedRows.length}</p>
              </div>
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Valid</p>
                <p className="mt-0.5 text-lg font-semibold text-emerald-600">{validCount}</p>
              </div>
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Isu</p>
                <p className="mt-0.5 text-lg font-semibold text-red-600">{invalidCount}</p>
              </div>
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-xs text-slate-400">Jumlah (RM)</p>
                <p className="mt-0.5 text-lg font-semibold text-slate-900">{moneyFormat(totalAmount)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-100 px-6 py-2.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Petunjuk:</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-3 w-3 text-emerald-600" /></span>
                Sah
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-3 w-3 text-red-600" /></span>
                Ralat (data tidak lengkap / amaun tidak sepadan)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100"><AlertCircle className="h-3 w-3 text-amber-600" /></span>
                Duplikat (IC sama dalam fail / batch)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="inline-block h-3.5 w-6 rounded border-2 border-red-400 bg-red-50" />
                Amaun tak sepadan perjanjian
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="inline-block h-3.5 w-6 rounded border-2 border-amber-400 bg-amber-50" />
                IC duplikat
              </span>
            </div>
            <div className="overflow-x-auto px-4 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="w-8 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                    <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Pekerja</th>
                    <th className="w-36 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">No. IC</th>
                    <th className="w-28 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Amaun (RM)</th>
                    <th className="w-28 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Perjanjian</th>
                    <th className="w-16 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan</th>
                    <th className="w-8 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validatedRows.map((row, idx) => {
                    const hasErrors = row.errors.length > 0;
                    const isDuplicate = row.duplicateInFile || row.duplicateInMonthBatch;
                    const amountMismatch = row.agreedAmount != null && Number(row.amount) > 0 && Number(row.amount) !== row.agreedAmount;
                    const hasIssue = hasErrors || isDuplicate;
                    const duplicateRows = isDuplicate
                      ? validatedRows
                          .map((r, i) => ({ idx: i + 1, ic: normalizeIdentity(r.employeeIdentityNo) }))
                          .filter((r) => r.ic === normalizeIdentity(row.employeeIdentityNo) && r.idx !== idx + 1)
                          .map((r) => r.idx)
                      : [];
                    return (
                      <tr key={row.id} className={`group ${hasIssue ? "bg-red-50/50" : ""}`}>
                        <td className="px-2 py-2 text-xs text-slate-400">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <Input className="h-8 text-sm" value={row.employeeName} onChange={(e) => updateRow(row.id, { employeeName: e.target.value })} placeholder="Nama pekerja" />
                        </td>
                        <td className="px-2 py-2">
                          <Input className={`h-8 w-36 text-sm ${isDuplicate ? "border-amber-400 bg-amber-50" : ""}`} value={row.employeeIdentityNo} onChange={(e) => updateRow(row.id, { employeeIdentityNo: e.target.value })} placeholder="No. IC" />
                        </td>
                        <td className="px-2 py-2">
                          <Input className={`h-8 w-28 text-sm text-right ${amountMismatch ? "border-red-400 bg-red-50" : ""}`} type="number" step="0.01" min="0" value={row.amount} onChange={(e) => updateRow(row.id, { amount: e.target.value })} placeholder="0.00" />
                        </td>
                        <td className="px-2 py-2">
                          {row.agreedAmount != null ? (
                            <span className={`block text-right text-xs font-medium ${amountMismatch ? "text-red-600" : "text-slate-500"}`}>
                              {row.agreedAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {hasErrors ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100" title={row.errors.join("; ")}>
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                            </span>
                          ) : isDuplicate ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100" title="Duplikat">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <p key={i} className="text-xs leading-snug text-red-600">{err}</p>
                            ))}
                            {row.duplicateInFile && (
                              <p className="text-xs leading-snug text-amber-700">
                                Duplikat dalam fail {duplicateRows.length > 0 ? `(sama dgn baris ${duplicateRows.join(", ")})` : ""}
                              </p>
                            )}
                            {row.duplicateInMonthBatch && (
                              <p className="text-xs leading-snug text-amber-700">Sudah ada dalam batch bulan ini</p>
                            )}
                            {!hasErrors && !isDuplicate && (
                              <span className="text-xs text-slate-300">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button type="button" onClick={() => removeRow(row.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" title="Buang baris">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {validatedRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-2 py-8 text-center text-sm text-slate-400">
                        Tiada data. Sila muat naik fail atau tambah baris secara manual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="ghost" className="gap-2 text-slate-600" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Button type="button" className="gap-2" onClick={onRevalidateAndProceed} disabled={loading || validatedRows.length === 0}>
                {loading ? "Mengesahkan..." : "Semak & Teruskan"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Payment Setup ── */}
        {step === 4 && (
          <div className="rounded-2xl border border-white/20 portal-card shadow-md">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Tetapan Bayaran</h2>
              <p className="text-sm text-slate-500">Pilih kaedah bayaran dan muat naik dokumen sokongan jika perlu.</p>
            </div>
            <div className="space-y-5 px-6 py-5">
              <div>
                <Label className="mb-3 block">Kaedah Bayaran</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => {
                    const active = paymentChannel === ch.code;
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setPaymentChannel(ch.code)}
                        className={`inline-flex items-center gap-2 rounded-lg border-2 px-3.5 py-2.5 text-sm font-medium transition ${
                          active
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Slip / Bukti Bayaran{" "}
                  <span className={paymentChannel === "CHEQUE" ? "text-red-500" : "text-slate-400"}>
                    ({paymentChannel === "CHEQUE" ? "Wajib" : "Pilihan"})
                  </span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="max-w-sm"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSupportingSlip(e.target.files?.[0] || null)}
                />
                {paymentChannel === "CHEQUE" && !supportingSlip && (
                  <p className="text-xs text-amber-600">Sila muat naik salinan cek sebelum meneruskan.</p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Tempoh</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{MONTHS[Number(month) - 1]} {year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pekerja</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{validatedRows.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Jumlah</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{moneyFormat(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="ghost" className="gap-2 text-slate-600" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Button type="button" className="gap-2" onClick={() => setStep(5)} disabled={paymentChannel === "CHEQUE" && !supportingSlip}>
                Seterusnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Confirmation & Submit ── */}
        {step === 5 && (
          <div className="rounded-2xl border border-white/20 portal-card shadow-md">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Pengesahan & Hantar</h2>
              <p className="text-sm text-slate-500">Semak ringkasan sebelum menghantar batch SPG.</p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Tempoh</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{MONTHS[Number(month) - 1]} {year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Kaedah Bayaran</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{selectedChannel.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Bil. Pekerja</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{validatedRows.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Jumlah Bayaran</p>
                    <p className="mt-0.5 text-sm font-semibold portal-text-accent">{moneyFormat(totalAmount)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-yellow-50 px-4 py-3 text-sm portal-text-accent">
                {selectedChannel.online
                  ? "Selepas hantar, anda akan diarahkan ke gateway pembayaran dalam talian."
                  : "Batch akan disimpan sebagai 'Menunggu Bayaran'. Sila buat bayaran melalui kaedah yang dipilih."}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="ghost" className="gap-2 text-slate-600" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Button type="button" className="gap-2" onClick={submitBatch} disabled={loading || hasRowIssues}>
                <Send className="h-4 w-4" />
                {loading ? "Menghantar..." : "Hantar & Bayar"}
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </PortalAuthGuard>
  );
}
