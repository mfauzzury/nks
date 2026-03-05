<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  User,
  Building2,
  Briefcase,
  TrendingUp,
  Wallet,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Clock,
  FileText,
  CalendarDays,
  X,
  Download,
  ReceiptText,
  Eye,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import {
  addToBlacklist,
  changePayerStatus,
  getPayer,
  getPayerAudit,
  getPayerHistory,
  getPayerStats,
  removeFromBlacklist,
} from "@/api/cms";
import type { PayerProfile, PayerStatus } from "@/types";

const route = useRoute();
const payer = ref<PayerProfile | null>(null);
const history = ref<{ statusHistory: unknown[]; blacklistHistory: unknown[] } | null>(null);
const audits = ref<unknown[]>([]);
const status = ref<PayerStatus>("active");
const reason = ref("");

type PayerStats = {
  totalPaid: number;
  individualTotal: number;
  corporateTotal: number;
  transactionCount: number;
  monthlyBreakdown: Array<{ month: string; individual: number; corporate: number }>;
  zakatTypes: Array<{ type: string; amount: number }>;
  recentTransactions: Array<{
    id: number;
    date: string;
    amount: number;
    source: string;
    zakatType: string;
    status: string;
    receiptNo?: string;
    payerName?: string;
    identityNo?: string;
    paymentMethod?: string;
  }>;
};

type Transaction = PayerStats["recentTransactions"][number];

const stats = ref<PayerStats | null>(null);
const selectedYear = ref("all");

const yearOptions = [
  { value: "all", label: "Semua Tahun" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const demoStatsByYear: Record<string, PayerStats> = {
  all: {
    totalPaid: 15800,
    individualTotal: 9200,
    corporateTotal: 6600,
    transactionCount: 24,
    monthlyBreakdown: [
      { month: "Okt", individual: 1200, corporate: 800 },
      { month: "Nov", individual: 1500, corporate: 1100 },
      { month: "Dis", individual: 1800, corporate: 900 },
      { month: "Jan", individual: 1400, corporate: 1200 },
      { month: "Feb", individual: 1600, corporate: 1400 },
      { month: "Mac", individual: 1700, corporate: 1200 },
    ],
    zakatTypes: [
      { type: "Zakat Pendapatan", amount: 6400 },
      { type: "Zakat Simpanan", amount: 3800 },
      { type: "Zakat Perniagaan", amount: 3200 },
      { type: "Zakat Fitrah", amount: 1400 },
      { type: "Lain-lain", amount: 1000 },
    ],
    recentTransactions: [
      { id: 1, date: "2026-03-01", amount: 500, source: "Individu", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2026-0041", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (Maybank)" },
      { id: 2, date: "2026-02-15", amount: 1200, source: "Korporat (SPG)", zakatType: "Zakat Perniagaan", status: "completed", receiptNo: "RZ-2026-0035", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
      { id: 3, date: "2026-02-01", amount: 300, source: "Individu", zakatType: "Zakat Fitrah", status: "completed", receiptNo: "RZ-2026-0028", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (CIMB)" },
      { id: 4, date: "2026-01-20", amount: 800, source: "Individu", zakatType: "Zakat Simpanan", status: "completed", receiptNo: "RZ-2026-0015", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Kad Kredit" },
      { id: 5, date: "2026-01-10", amount: 1400, source: "Korporat (SPG)", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2026-0008", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
    ],
  },
  "2024": {
    totalPaid: 4200,
    individualTotal: 2600,
    corporateTotal: 1600,
    transactionCount: 7,
    monthlyBreakdown: [
      { month: "Jul", individual: 400, corporate: 200 },
      { month: "Ogos", individual: 350, corporate: 300 },
      { month: "Sep", individual: 500, corporate: 250 },
      { month: "Okt", individual: 450, corporate: 280 },
      { month: "Nov", individual: 400, corporate: 320 },
      { month: "Dis", individual: 500, corporate: 250 },
    ],
    zakatTypes: [
      { type: "Zakat Pendapatan", amount: 1800 },
      { type: "Zakat Simpanan", amount: 1200 },
      { type: "Zakat Fitrah", amount: 700 },
      { type: "Lain-lain", amount: 500 },
    ],
    recentTransactions: [
      { id: 10, date: "2024-12-15", amount: 500, source: "Individu", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2024-0092", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (Maybank)" },
      { id: 11, date: "2024-11-20", amount: 320, source: "Korporat (SPG)", zakatType: "Zakat Simpanan", status: "completed", receiptNo: "RZ-2024-0078", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
      { id: 12, date: "2024-10-10", amount: 450, source: "Individu", zakatType: "Zakat Fitrah", status: "completed", receiptNo: "RZ-2024-0065", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (CIMB)" },
    ],
  },
  "2025": {
    totalPaid: 6800,
    individualTotal: 3900,
    corporateTotal: 2900,
    transactionCount: 10,
    monthlyBreakdown: [
      { month: "Jul", individual: 600, corporate: 400 },
      { month: "Ogos", individual: 650, corporate: 500 },
      { month: "Sep", individual: 700, corporate: 450 },
      { month: "Okt", individual: 600, corporate: 550 },
      { month: "Nov", individual: 700, corporate: 500 },
      { month: "Dis", individual: 650, corporate: 500 },
    ],
    zakatTypes: [
      { type: "Zakat Pendapatan", amount: 2800 },
      { type: "Zakat Simpanan", amount: 1600 },
      { type: "Zakat Perniagaan", amount: 1400 },
      { type: "Zakat Fitrah", amount: 600 },
      { type: "Lain-lain", amount: 400 },
    ],
    recentTransactions: [
      { id: 20, date: "2025-12-28", amount: 650, source: "Individu", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2025-0187", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (Bank Islam)" },
      { id: 21, date: "2025-12-10", amount: 500, source: "Korporat (SPG)", zakatType: "Zakat Perniagaan", status: "completed", receiptNo: "RZ-2025-0172", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
      { id: 22, date: "2025-11-15", amount: 700, source: "Individu", zakatType: "Zakat Simpanan", status: "completed", receiptNo: "RZ-2025-0155", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Kad Kredit" },
      { id: 23, date: "2025-10-20", amount: 550, source: "Korporat (SPG)", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2025-0140", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
    ],
  },
  "2026": {
    totalPaid: 4800,
    individualTotal: 2700,
    corporateTotal: 2100,
    transactionCount: 7,
    monthlyBreakdown: [
      { month: "Jan", individual: 1400, corporate: 1200 },
      { month: "Feb", individual: 1600, corporate: 1400 },
      { month: "Mac", individual: 1700, corporate: 1200 },
    ],
    zakatTypes: [
      { type: "Zakat Pendapatan", amount: 1800 },
      { type: "Zakat Simpanan", amount: 1000 },
      { type: "Zakat Perniagaan", amount: 1200 },
      { type: "Zakat Fitrah", amount: 500 },
      { type: "Lain-lain", amount: 300 },
    ],
    recentTransactions: [
      { id: 1, date: "2026-03-01", amount: 500, source: "Individu", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2026-0041", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (Maybank)" },
      { id: 2, date: "2026-02-15", amount: 1200, source: "Korporat (SPG)", zakatType: "Zakat Perniagaan", status: "completed", receiptNo: "RZ-2026-0035", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
      { id: 3, date: "2026-02-01", amount: 300, source: "Individu", zakatType: "Zakat Fitrah", status: "completed", receiptNo: "RZ-2026-0028", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "FPX (CIMB)" },
      { id: 4, date: "2026-01-20", amount: 800, source: "Individu", zakatType: "Zakat Simpanan", status: "completed", receiptNo: "RZ-2026-0015", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Kad Kredit" },
      { id: 5, date: "2026-01-10", amount: 1400, source: "Korporat (SPG)", zakatType: "Zakat Pendapatan", status: "completed", receiptNo: "RZ-2026-0008", payerName: "Ahmad bin Ali", identityNo: "901234567890", paymentMethod: "Potongan Gaji (SPG)" },
    ],
  },
};

const payerId = computed(() => Number(route.params.id));

const payerTypeIcon = computed(() => {
  if (!payer.value) return User;
  if (payer.value.payerType === "korporat") return Building2;
  if (payer.value.payerType === "majikan_spg") return Briefcase;
  return User;
});

const payerTypeLabel = computed(() => {
  if (!payer.value) return "";
  const map: Record<string, string> = { individu: "Individu", korporat: "Korporat", majikan_spg: "Majikan SPG" };
  return map[payer.value.payerType] || payer.value.payerType;
});

const statusColor = computed(() => {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-100 text-slate-600",
    suspended: "bg-amber-100 text-amber-700",
    merged: "bg-blue-100 text-blue-700",
  };
  return map[payer.value?.status || ""] || "bg-slate-100 text-slate-600";
});

const currentStats = computed(() => stats.value || demoStatsByYear[selectedYear.value] || demoStatsByYear.all);

const individualPct = computed(() => {
  const t = currentStats.value.totalPaid;
  return t > 0 ? Math.round((currentStats.value.individualTotal / t) * 100) : 0;
});

const corporatePct = computed(() => 100 - individualPct.value);

const maxMonthly = computed(() => {
  return Math.max(...currentStats.value.monthlyBreakdown.map((m) => m.individual + m.corporate), 1);
});

const maxZakat = computed(() => {
  return Math.max(...currentStats.value.zakatTypes.map((z) => z.amount), 1);
});

const donutGradient = computed(() => {
  const ind = individualPct.value;
  return `conic-gradient(#7c3aed 0% ${ind}%, #c4b5fd ${ind}% 100%)`;
});

function fmt(n: number) {
  return n.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
}

const selectedTx = ref<Transaction | null>(null);

function openTxModal(tx: Transaction) {
  selectedTx.value = tx;
}

function closeTxModal() {
  selectedTx.value = null;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadReceipt(tx: Transaction) {
  const lines = [
    "RESIT BAYARAN ZAKAT - NKS",
    "",
    `No. Resit: ${tx.receiptNo}`,
    `Nama: ${tx.payerName}`,
    `IC / Passport: ${tx.identityNo}`,
    `Jenis Zakat: ${tx.zakatType}`,
    `Sumber: ${tx.source}`,
    `Jumlah: RM ${fmt(tx.amount)}`,
    `Kaedah Bayaran: ${tx.paymentMethod}`,
    `Tarikh: ${fmtDate(tx.date)}`,
    `Status: ${tx.status === "completed" ? "Selesai" : tx.status}`,
    "",
    "Terima kasih atas sumbangan zakat anda.",
  ];

  const content = lines
    .map((line, index) => {
      const y = 800 - index * 24;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new TextEncoder().encode(pdf);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tx.receiptNo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

async function load() {
  const [payerRes, historyRes, auditRes] = await Promise.all([
    getPayer(payerId.value),
    getPayerHistory(payerId.value),
    getPayerAudit(payerId.value),
  ]);
  payer.value = payerRes.data;
  status.value = payerRes.data.status;
  history.value = historyRes.data;
  audits.value = auditRes.data;

  try {
    const statsRes = await getPayerStats(payerId.value);
    stats.value = statsRes.data;
  } catch {
    stats.value = null;
  }
}

async function saveStatus() {
  await changePayerStatus(payerId.value, status.value, reason.value || undefined);
  await load();
}

async function blacklist() {
  await addToBlacklist(payerId.value, { reason: reason.value || undefined });
  await load();
}

async function unblacklist() {
  await removeFromBlacklist(payerId.value);
  await load();
}

watch(selectedYear, async () => {
  try {
    const statsRes = await getPayerStats(payerId.value);
    stats.value = statsRes.data;
  } catch {
    stats.value = null;
  }
});

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="page-title">Profil & Penilaian Pembayar</h1>
        <div class="flex items-center gap-3">
          <!-- Year Filter -->
          <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <CalendarDays class="h-4 w-4 text-slate-400" />
            <select
              v-model="selectedYear"
              class="appearance-none border-none bg-transparent pr-6 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option v-for="opt in yearOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <template v-if="payer">
            <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', statusColor]">
              <span class="h-1.5 w-1.5 rounded-full" :class="payer.status === 'active' ? 'bg-emerald-500' : 'bg-current'"></span>
              {{ payer.status.toUpperCase() }}
            </span>
            <span v-if="payer.isBlacklisted" class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              <ShieldAlert class="h-3 w-3" />
              SENARAI HITAM
            </span>
          </template>
        </div>
      </div>

      <div v-if="payer" class="space-y-6">
        <!-- Profile Card -->
        <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="flex items-start gap-5 p-6">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <component :is="payerTypeIcon" class="h-7 w-7" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-xl font-semibold text-slate-900">{{ payer.displayName }}</h2>
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{{ payerTypeLabel }}</span>
              </div>
              <p class="mt-0.5 text-sm text-slate-500">{{ payer.payerCode }}</p>
              <div class="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><span class="text-slate-400">IC / SSM:</span> <span class="font-medium text-slate-700">{{ payer.identityNo || "-" }}</span></div>
                <div><span class="text-slate-400">Jenis ID:</span> <span class="font-medium text-slate-700">{{ payer.identityType || "-" }}</span></div>
                <div><span class="text-slate-400">Email:</span> <span class="font-medium text-slate-700">{{ payer.email || "-" }}</span></div>
                <div><span class="text-slate-400">Telefon:</span> <span class="font-medium text-slate-700">{{ payer.phone || "-" }}</span></div>
              </div>
            </div>
          </div>
        </article>

        <!-- Stats Overview Cards -->
        <div v-if="selectedYear !== 'all'" class="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-4 py-2.5">
          <CalendarDays class="h-4 w-4 text-violet-500" />
          <span class="text-sm font-medium text-violet-700">Menunjukkan data untuk tahun {{ selectedYear }}</span>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Jumlah Sumbangan</span>
              <Wallet class="h-5 w-5 text-violet-500" />
            </div>
            <p class="mt-2 text-2xl font-bold text-slate-900">RM {{ fmt(currentStats.totalPaid) }}</p>
            <div class="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp class="h-3 w-3" />
              {{ currentStats.transactionCount }} transaksi
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Bayaran Individu</span>
              <User class="h-5 w-5 text-violet-600" />
            </div>
            <p class="mt-2 text-2xl font-bold text-slate-900">RM {{ fmt(currentStats.individualTotal) }}</p>
            <div class="mt-1 text-xs text-slate-500">{{ individualPct }}% daripada jumlah</div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Bayaran Korporat / SPG</span>
              <Building2 class="h-5 w-5 text-violet-400" />
            </div>
            <p class="mt-2 text-2xl font-bold text-slate-900">RM {{ fmt(currentStats.corporateTotal) }}</p>
            <div class="mt-1 text-xs text-slate-500">{{ corporatePct }}% daripada jumlah</div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Bil. Transaksi</span>
              <Activity class="h-5 w-5 text-violet-500" />
            </div>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ currentStats.transactionCount }}</p>
            <div class="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp class="h-3 w-3" />
              Aktif
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Monthly Stacked Bar Chart -->
          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 class="text-sm font-semibold text-slate-900">
              Sumbangan Bulanan
              <span class="font-normal text-slate-500">{{ selectedYear === 'all' ? '(6 bulan terkini)' : `(${selectedYear})` }}</span>
            </h3>
            <p class="mt-0.5 text-xs text-slate-500">Perbandingan sumbangan individu vs korporat/SPG</p>

            <div class="mt-6 flex items-end gap-3" style="height: 200px;">
              <div
                v-for="(m, idx) in currentStats.monthlyBreakdown"
                :key="idx"
                class="flex flex-1 flex-col items-center gap-1"
              >
                <div class="relative flex w-full flex-col items-center" style="height: 180px;">
                  <div
                    class="absolute bottom-0 w-full max-w-10 rounded-t bg-violet-300 transition-all duration-500"
                    :style="{ height: ((m.individual + m.corporate) / maxMonthly * 170) + 'px' }"
                  ></div>
                  <div
                    class="absolute bottom-0 w-full max-w-10 rounded-t bg-violet-600 transition-all duration-500"
                    :style="{ height: (m.individual / maxMonthly * 170) + 'px' }"
                  ></div>
                </div>
                <span class="text-[11px] text-slate-500">{{ m.month }}</span>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-6 text-xs text-slate-500">
              <span class="flex items-center gap-1.5">
                <span class="inline-block h-2.5 w-2.5 rounded-sm bg-violet-600"></span>
                Individu
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block h-2.5 w-2.5 rounded-sm bg-violet-300"></span>
                Korporat / SPG
              </span>
            </div>
          </article>

          <!-- Donut Chart -->
          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">Nisbah Sumbangan</h3>
            <p class="mt-0.5 text-xs text-slate-500">Individu vs Korporat</p>

            <div class="mt-6 flex justify-center">
              <div class="relative h-40 w-40">
                <div class="h-full w-full rounded-full" :style="{ background: donutGradient }"></div>
                <div class="absolute inset-0 m-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <span class="text-lg font-bold text-slate-900">{{ individualPct }}%</span>
                  <span class="text-[10px] text-slate-500">Individu</span>
                </div>
              </div>
            </div>

            <div class="mt-5 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-sm bg-violet-600"></span> Individu</span>
                <span class="font-medium text-slate-700">RM {{ fmt(currentStats.individualTotal) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-sm bg-violet-300"></span> Korporat</span>
                <span class="font-medium text-slate-700">RM {{ fmt(currentStats.corporateTotal) }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Zakat Breakdown + Recent Transactions -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Horizontal Bar - Zakat Types -->
          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">Pecahan Mengikut Jenis Zakat</h3>
            <p class="mt-0.5 text-xs text-slate-500">Jumlah sumbangan mengikut kategori zakat</p>

            <div class="mt-5 space-y-3">
              <div v-for="(z, idx) in currentStats.zakatTypes" :key="idx">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-700">{{ z.type }}</span>
                  <span class="font-medium text-slate-900">RM {{ fmt(z.amount) }}</span>
                </div>
                <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                    :style="{ width: (z.amount / maxZakat * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </article>

          <!-- Recent Transactions -->
          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">Transaksi Terkini</h3>
            <p class="mt-0.5 text-xs text-slate-500">Klik pada transaksi untuk melihat butiran & muat turun resit</p>

            <div class="mt-4 overflow-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th class="pb-2 font-medium">Tarikh</th>
                    <th class="pb-2 font-medium">Sumber</th>
                    <th class="pb-2 font-medium">Jenis</th>
                    <th class="pb-2 text-right font-medium">Jumlah</th>
                    <th class="pb-2 text-center font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tx in currentStats.recentTransactions"
                    :key="tx.id"
                    class="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                    @click="openTxModal(tx)"
                  >
                    <td class="py-2.5 text-slate-600">{{ fmtDate(tx.date) }}</td>
                    <td class="py-2.5">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                          tx.source.includes('Korporat') ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600',
                        ]"
                      >
                        {{ tx.source }}
                      </span>
                    </td>
                    <td class="py-2.5 text-slate-600">{{ tx.zakatType }}</td>
                    <td class="py-2.5 text-right font-medium text-slate-900">RM {{ fmt(tx.amount) }}</td>
                    <td class="py-2.5 text-center">
                      <Eye class="inline h-4 w-4 text-slate-400 hover:text-violet-600" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <!-- Status & Admin -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <ShieldCheck class="h-4 w-4 text-slate-400" />
              <h3 class="text-sm font-semibold text-slate-900">Pengurusan Status & Senarai Hitam</h3>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">Status</label>
                <select v-model="status" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="suspended">Digantung</option>
                  <option value="merged">Digabung</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">Sebab</label>
                <input v-model="reason" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" placeholder="Sebab perubahan (optional)" />
              </div>
              <div class="flex items-end">
                <button class="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors" @click="saveStatus">Tukar Status</button>
              </div>
            </div>
            <div class="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors" @click="blacklist">
                <ShieldAlert class="mr-1 inline h-3.5 w-3.5" />
                Senarai Hitam
              </button>
              <button class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" @click="unblacklist">Buang Senarai Hitam</button>
            </div>
          </article>

          <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <Clock class="h-4 w-4 text-slate-400" />
              <h3 class="text-sm font-semibold text-slate-900">Sejarah Status</h3>
            </div>
            <div class="max-h-52 space-y-2 overflow-auto">
              <template v-if="(history?.statusHistory || []).length > 0">
                <div v-for="(item, idx) in history?.statusHistory || []" :key="idx" class="flex items-start gap-2 rounded-lg border border-slate-100 p-3 text-xs">
                  <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-violet-400"></div>
                  <div class="min-w-0">
                    <div class="font-medium text-slate-700">{{ (item as Record<string, unknown>).oldStatus || "-" }} &rarr; {{ (item as Record<string, unknown>).newStatus }}</div>
                    <div class="mt-0.5 text-slate-400">{{ (item as Record<string, unknown>).changedAt ? fmtDate(String((item as Record<string, unknown>).changedAt)) : "-" }}</div>
                  </div>
                </div>
              </template>
              <p v-else class="text-xs text-slate-400">Tiada sejarah status.</p>
            </div>
          </article>
        </div>

        <!-- Audit Log -->
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <FileText class="h-4 w-4 text-slate-400" />
            <h3 class="text-sm font-semibold text-slate-900">Log Audit</h3>
          </div>
          <div class="max-h-64 space-y-2 overflow-auto">
            <template v-if="audits.length > 0">
              <div v-for="(item, idx) in audits" :key="idx" class="flex items-start gap-3 rounded-lg border border-slate-100 p-3 text-xs">
                <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-slate-300"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-medium text-slate-700">{{ (item as Record<string, unknown>).action }}</span>
                    <span class="text-slate-400">{{ (item as Record<string, unknown>).entityName }}</span>
                  </div>
                  <div class="mt-0.5 text-slate-400">{{ (item as Record<string, unknown>).performedAt ? fmtDate(String((item as Record<string, unknown>).performedAt)) : "-" }}</div>
                </div>
              </div>
            </template>
            <p v-else class="text-xs text-slate-400">Tiada log audit.</p>
          </div>
        </article>
      </div>

      <!-- Loading -->
      <div v-else class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
          <p class="text-sm text-slate-500">Memuatkan profil pembayar...</p>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedTx" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeTxModal">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeTxModal"></div>

          <!-- Modal Content -->
          <div class="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <ReceiptText class="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Butiran Transaksi</h3>
                  <p class="text-xs text-slate-500">{{ selectedTx.receiptNo }}</p>
                </div>
              </div>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                @click="closeTxModal"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="space-y-4 px-6 py-5">
              <!-- Status Badge -->
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    selectedTx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="selectedTx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ selectedTx.status === 'completed' ? 'Selesai' : selectedTx.status }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    selectedTx.source.includes('Korporat') ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600',
                  ]"
                >
                  {{ selectedTx.source }}
                </span>
              </div>

              <!-- Amount Highlight -->
              <div class="rounded-xl bg-slate-50 p-4 text-center">
                <p class="text-xs text-slate-500">Jumlah Bayaran</p>
                <p class="mt-1 text-3xl font-bold text-slate-900">RM {{ fmt(selectedTx.amount) }}</p>
              </div>

              <!-- Detail Grid -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">No. Resit</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ selectedTx.receiptNo }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Tarikh</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ fmtDate(selectedTx.date) }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Nama Pembayar</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ selectedTx.payerName }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">IC / Passport</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ selectedTx.identityNo }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Jenis Zakat</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ selectedTx.zakatType }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Kaedah Bayaran</p>
                  <p class="mt-0.5 font-medium text-slate-700">{{ selectedTx.paymentMethod }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                @click="closeTxModal"
              >
                Tutup
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                @click="downloadReceipt(selectedTx)"
              >
                <Download class="h-4 w-4" />
                Muat Turun Resit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
