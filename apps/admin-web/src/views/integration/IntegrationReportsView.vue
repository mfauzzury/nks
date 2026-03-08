<script setup lang="ts">
import { ref } from "vue";
import { BarChart3, FileText, Loader2, RefreshCw, TrendingUp, Users } from "lucide-vue-next";

import { getProcessingReport, getPayerReport, getReconciliationReport, getTrendsReport } from "@/api/integration";
import type { ProcessingReport, PayerReport, ReconciliationReport, TrendsReport } from "@/api/integration";
import AdminLayout from "@/layouts/AdminLayout.vue";

const reportTypes = [
  { id: "payer", label: "Payer Report", desc: "Payer summary, contributions, and payment history from integration sources.", icon: Users },
  { id: "processing", label: "Processing Report", desc: "File intake, validation, and batch processing summary.", icon: FileText },
  { id: "reconciliation", label: "Reconciliation Report", desc: "Match status, unmatched items, and exception summary.", icon: BarChart3 },
  { id: "trends", label: "Trends & Analytics", desc: "Volume trends, source breakdown, and performance metrics.", icon: TrendingUp },
];

const processingReport = ref<ProcessingReport | null>(null);
const processingLoading = ref(false);
const processingError = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const payerReport = ref<PayerReport | null>(null);
const payerLoading = ref(false);
const payerError = ref("");
const payerDateFrom = ref("");
const payerDateTo = ref("");

const reconciliationReport = ref<ReconciliationReport | null>(null);
const reconciliationLoading = ref(false);
const reconciliationError = ref("");
const reconciliationDateFrom = ref("");
const reconciliationDateTo = ref("");

const trendsReport = ref<TrendsReport | null>(null);
const trendsLoading = ref(false);
const trendsError = ref("");
const trendsDateFrom = ref("");
const trendsDateTo = ref("");
const trendsGroupBy = ref<"day" | "week" | "month">("day");

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ms-MY", { dateStyle: "short", timeStyle: "short" });
}

function formatAmount(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR", minimumFractionDigits: 2 }).format(n);
}

async function generateProcessingReport() {
  processingLoading.value = true;
  processingError.value = "";
  processingReport.value = null;
  try {
    const res = await getProcessingReport({
      from: dateFrom.value || undefined,
      to: dateTo.value || undefined,
    });
    const payload = res as { data: ProcessingReport };
    processingReport.value = payload.data;
  } catch (e) {
    processingError.value = e instanceof Error ? e.message : "Failed to generate report";
  } finally {
    processingLoading.value = false;
  }
}

async function generatePayerReport() {
  payerLoading.value = true;
  payerError.value = "";
  payerReport.value = null;
  try {
    const res = await getPayerReport({
      from: payerDateFrom.value || undefined,
      to: payerDateTo.value || undefined,
    });
    const payload = res as { data: PayerReport };
    payerReport.value = payload.data;
  } catch (e) {
    payerError.value = e instanceof Error ? e.message : "Failed to generate report";
  } finally {
    payerLoading.value = false;
  }
}

async function generateReconciliationReport() {
  reconciliationLoading.value = true;
  reconciliationError.value = "";
  reconciliationReport.value = null;
  try {
    const res = await getReconciliationReport({
      from: reconciliationDateFrom.value || undefined,
      to: reconciliationDateTo.value || undefined,
    });
    const payload = res as { data: ReconciliationReport };
    reconciliationReport.value = payload.data;
  } catch (e) {
    reconciliationError.value = e instanceof Error ? e.message : "Failed to generate report";
  } finally {
    reconciliationLoading.value = false;
  }
}

async function generateTrendsReport() {
  trendsLoading.value = true;
  trendsError.value = "";
  trendsReport.value = null;
  try {
    const res = await getTrendsReport({
      from: trendsDateFrom.value || undefined,
      to: trendsDateTo.value || undefined,
      groupBy: trendsGroupBy.value,
    });
    const payload = res as { data: TrendsReport };
    trendsReport.value = payload.data;
  } catch (e) {
    trendsError.value = e instanceof Error ? e.message : "Failed to generate report";
  } finally {
    trendsLoading.value = false;
  }
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "SUCCESS" || s === "PASSED") return "bg-emerald-100 text-emerald-800";
  if (s === "FAILED" || s === "INVALID") return "bg-red-100 text-red-800";
  if (s === "IN_PROGRESS" || s === "PENDING") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function maxVolumeAmount(periods: Array<{ amount: number }>): number {
  if (!periods.length) return 1;
  return Math.max(1, ...periods.map((p) => p.amount));
}

function matchStatusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "MATCHED") return "bg-emerald-100 text-emerald-800";
  if (s === "UNMATCHED") return "bg-amber-100 text-amber-800";
  if (s === "MISMATCH") return "bg-red-100 text-red-800";
  if (s === "DUPLICATE") return "bg-slate-200 text-slate-700";
  return "bg-slate-100 text-slate-700";
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Reports</h1>
        <p class="mt-1 text-sm text-slate-600">View processing and reconciliation reports.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="r in reportTypes"
          :key="r.id"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <component :is="r.icon" class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 class="font-semibold text-slate-900">{{ r.label }}</h2>
              <p class="mt-1 text-xs text-slate-500">{{ r.desc }}</p>
              <button
                v-if="r.id === 'payer'"
                class="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                :disabled="payerLoading"
                @click="generatePayerReport"
              >
                <Loader2 v-if="payerLoading" class="h-3.5 w-3.5 animate-spin" />
                <RefreshCw v-else class="h-3.5 w-3.5" />
                {{ payerLoading ? "Generating..." : "Generate report" }} →
              </button>
              <button
                v-else-if="r.id === 'processing'"
                class="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                :disabled="processingLoading"
                @click="generateProcessingReport"
              >
                <Loader2 v-if="processingLoading" class="h-3.5 w-3.5 animate-spin" />
                <RefreshCw v-else class="h-3.5 w-3.5" />
                {{ processingLoading ? "Generating..." : "Generate report" }} →
              </button>
              <button
                v-else-if="r.id === 'reconciliation'"
                class="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                :disabled="reconciliationLoading"
                @click="generateReconciliationReport"
              >
                <Loader2 v-if="reconciliationLoading" class="h-3.5 w-3.5 animate-spin" />
                <RefreshCw v-else class="h-3.5 w-3.5" />
                {{ reconciliationLoading ? "Generating..." : "Generate report" }} →
              </button>
              <button
                v-else-if="r.id === 'trends'"
                class="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                :disabled="trendsLoading"
                @click="generateTrendsReport"
              >
                <Loader2 v-if="trendsLoading" class="h-3.5 w-3.5 animate-spin" />
                <RefreshCw v-else class="h-3.5 w-3.5" />
                {{ trendsLoading ? "Generating..." : "Generate report" }} →
              </button>
              <button
                v-else
                class="mt-3 text-xs font-medium text-slate-400 cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                Generate report →
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Payer Report: Date filter -->
      <div v-if="payerReport || payerLoading" class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-slate-600">Payer Report — Date range:</label>
        <input
          v-model="payerDateFrom"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span class="text-slate-400">to</span>
        <input
          v-model="payerDateTo"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          class="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="payerLoading"
          @click="generatePayerReport"
        >
          Apply
        </button>
      </div>

      <!-- Processing Report: Date filter -->
      <div v-if="processingReport || processingLoading" class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-slate-600">Processing Report — Date range:</label>
        <input
          v-model="dateFrom"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span class="text-slate-400">to</span>
        <input
          v-model="dateTo"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          class="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="processingLoading"
          @click="generateProcessingReport"
        >
          Apply
        </button>
      </div>

      <!-- Reconciliation Report: Date filter -->
      <div v-if="reconciliationReport || reconciliationLoading" class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-slate-600">Reconciliation Report — Date range (file received):</label>
        <input
          v-model="reconciliationDateFrom"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span class="text-slate-400">to</span>
        <input
          v-model="reconciliationDateTo"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          class="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="reconciliationLoading"
          @click="generateReconciliationReport"
        >
          Apply
        </button>
      </div>

      <p v-if="payerError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ payerError }}
      </p>
      <p v-if="processingError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ processingError }}
      </p>
      <!-- Trends & Analytics Report: Date filter -->
      <div v-if="trendsReport || trendsLoading" class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-slate-600">Trends Report — Date range:</label>
        <input
          v-model="trendsDateFrom"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span class="text-slate-400">to</span>
        <input
          v-model="trendsDateTo"
          type="date"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <label class="text-sm text-slate-600">Group by:</label>
        <select
          v-model="trendsGroupBy"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <button
          class="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="trendsLoading"
          @click="generateTrendsReport"
        >
          Apply
        </button>
      </div>

      <p v-if="reconciliationError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ reconciliationError }}
      </p>
      <p v-if="trendsError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ trendsError }}
      </p>

      <!-- Payer Report -->
      <article v-if="payerReport" class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Users class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Payer Report</h2>
          <span class="ml-auto text-xs text-slate-500">
            Generated {{ formatDate(payerReport.generatedAt) }}
          </span>
        </div>
        <div class="p-4">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Payers</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ payerReport.summary.totalPayers }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Transactions</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ payerReport.summary.totalTransactions.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Amount</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ formatAmount(payerReport.summary.totalAmount) }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Date Range</p>
              <p class="mt-1 text-sm text-slate-700">
                {{ payerReport.dateRange?.from || "All" }}
                <span v-if="payerReport.dateRange?.to"> → {{ payerReport.dateRange.to }}</span>
              </p>
            </div>
          </div>

          <div v-if="payerReport.payers.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Payers (by total amount, top 100)</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">IC / Identifier</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Transactions</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Total Amount</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">First Tx</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Last Tx</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Sources</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(p, idx) in payerReport.payers" :key="idx" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2 font-mono text-slate-700">{{ p.payerIc || "—" }}</td>
                    <td class="px-4 py-2">{{ p.payerName || "—" }}</td>
                    <td class="px-4 py-2 text-right">{{ p.txCount.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right font-medium">{{ formatAmount(p.totalAmount) }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ p.firstTxDate }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ p.lastTxDate }}</td>
                    <td class="px-4 py-2">
                      <span class="text-slate-600">{{ p.sources.join(", ") || "—" }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else class="mt-6 text-center text-sm text-slate-500">Tiada data pembayar dalam julat tarikh yang dipilih.</p>
        </div>
      </article>

      <!-- Reconciliation Report -->
      <article v-if="reconciliationReport" class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <BarChart3 class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Reconciliation Report</h2>
          <span class="ml-auto text-xs text-slate-500">
            Generated {{ formatDate(reconciliationReport.generatedAt) }}
          </span>
        </div>
        <div class="p-4">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Files</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ reconciliationReport.summary.totalFiles }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Staging</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ reconciliationReport.summary.totalStaging.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
              <p class="text-xs font-medium text-emerald-700">Matched</p>
              <p class="mt-1 text-xl font-semibold text-emerald-800">{{ reconciliationReport.summary.matched.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <p class="text-xs font-medium text-amber-700">Unmatched</p>
              <p class="mt-1 text-xl font-semibold text-amber-800">{{ reconciliationReport.summary.unmatched.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-red-100 bg-red-50/50 p-3">
              <p class="text-xs font-medium text-red-700">Mismatch</p>
              <p class="mt-1 text-xl font-semibold text-red-800">{{ reconciliationReport.summary.mismatch.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Match Rate</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ reconciliationReport.summary.matchRate }}%</p>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">Duplicate: {{ reconciliationReport.summary.duplicate }}</span>
          </div>

          <!-- By Source -->
          <div v-if="reconciliationReport.bySource.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By Source</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Staging</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Matched</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Unmatched</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Mismatch</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Duplicate</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="s in reconciliationReport.bySource" :key="s.sourceCode" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2">
                      <span class="font-medium">{{ s.sourceName }}</span>
                      <span class="ml-1 text-slate-500">({{ s.sourceCode }})</span>
                    </td>
                    <td class="px-4 py-2 text-right">{{ s.totalStaging.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right text-emerald-700">{{ s.matched.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right text-amber-700">{{ s.unmatched.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right text-red-700">{{ s.mismatch.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right text-slate-600">{{ s.duplicate.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- By File -->
          <div v-if="reconciliationReport.byFile.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By File</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">File</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Staging</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Matched</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Unmatched</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Mismatch</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="f in reconciliationReport.byFile" :key="f.fileId" class="hover:bg-slate-50/50">
                    <td class="max-w-[180px] truncate px-4 py-2 font-medium" :title="f.fileName">{{ f.fileName }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ f.sourceName ?? f.sourceCode ?? "—" }}</td>
                    <td class="px-4 py-2 text-right">{{ f.totalStaging }}</td>
                    <td class="px-4 py-2 text-right text-emerald-700">{{ f.matched }}</td>
                    <td class="px-4 py-2 text-right text-amber-700">{{ f.unmatched }}</td>
                    <td class="px-4 py-2 text-right text-red-700">{{ f.mismatch }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Exceptions (Unmatched / Mismatch) -->
          <div v-if="reconciliationReport.exceptions.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Exceptions (Unmatched & Mismatch — latest {{ reconciliationReport.exceptions.length }})</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200 max-h-72 overflow-y-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Status</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">IC / Name</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Date</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">File</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Detail</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="e in reconciliationReport.exceptions" :key="e.id" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2">
                      <span class="rounded px-1.5 py-0.5 text-xs font-medium" :class="matchStatusBadgeClass(e.matchStatus)">
                        {{ e.matchStatus }}
                      </span>
                    </td>
                    <td class="px-4 py-2">
                      <span class="font-mono text-slate-700">{{ e.payerIc || "—" }}</span>
                      <span v-if="e.payerName" class="ml-1 text-slate-600">/ {{ e.payerName }}</span>
                    </td>
                    <td class="px-4 py-2 text-slate-600">{{ e.txDate }}</td>
                    <td class="px-4 py-2 text-right font-medium">{{ formatAmount(e.amount) }}</td>
                    <td class="max-w-[140px] truncate px-4 py-2 text-slate-600" :title="e.fileName ?? ''">{{ e.fileName ?? "—" }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ e.sourceCode ?? "—" }}</td>
                    <td class="max-w-[160px] truncate px-4 py-2 text-slate-500 text-xs" :title="e.exceptionDetail ?? e.exceptionCode ?? ''">
                      {{ e.exceptionDetail ?? e.exceptionCode ?? "—" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else-if="reconciliationReport.summary.unmatched === 0 && reconciliationReport.summary.mismatch === 0" class="mt-6 text-center text-sm text-emerald-600">
            Tiada pengecualian. Semua transaksi telah dipadankan.
          </p>
        </div>
      </article>

      <!-- Trends & Analytics Report -->
      <article v-if="trendsReport" class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <TrendingUp class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Trends & Analytics Report</h2>
          <span class="ml-auto text-xs text-slate-500">
            Generated {{ formatDate(trendsReport.generatedAt) }}
          </span>
        </div>
        <div class="p-4">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Files</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ trendsReport.summary.totalFiles }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Records</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ trendsReport.summary.totalRecords.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Total Amount</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ formatAmount(trendsReport.summary.totalAmount) }}</p>
            </div>
            <div class="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
              <p class="text-xs font-medium text-emerald-700">Success Rate</p>
              <p class="mt-1 text-xl font-semibold text-emerald-800">{{ trendsReport.summary.successRate }}%</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Avg Records/File</p>
              <p class="mt-1 text-xl font-semibold text-slate-900">{{ trendsReport.summary.avgRecordsPerFile.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p class="text-xs font-medium text-slate-500">Group By</p>
              <p class="mt-1 text-sm font-medium text-slate-700 capitalize">{{ trendsReport.groupBy }}</p>
            </div>
          </div>

          <!-- Volume Trend (bar chart) -->
          <div v-if="trendsReport.volumeByPeriod.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume by {{ trendsReport.groupBy }} (Amount)</h3>
            <div class="space-y-2">
              <div
                v-for="p in trendsReport.volumeByPeriod"
                :key="p.period"
                class="flex items-center gap-3"
              >
                <span class="w-24 shrink-0 text-xs text-slate-600">{{ p.period }}</span>
                <div class="min-w-0 flex-1">
                  <div
                    class="h-6 rounded bg-blue-200"
                    :style="{ width: `${Math.min(100, (p.amount / maxVolumeAmount(trendsReport.volumeByPeriod)) * 100)}%` }"
                  />
                </div>
                <span class="w-24 shrink-0 text-right text-xs font-medium text-slate-700">{{ formatAmount(p.amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Collection by Source -->
          <div v-if="trendsReport.bySource.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Collection by Source</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Category</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Files</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Records</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">% of Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="s in trendsReport.bySource" :key="s.sourceCode" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2">
                      <span class="font-medium">{{ s.sourceName }}</span>
                      <span class="ml-1 text-slate-500">({{ s.sourceCode }})</span>
                    </td>
                    <td class="px-4 py-2 text-slate-600">{{ s.categoryName }}</td>
                    <td class="px-4 py-2 text-right">{{ s.fileCount }}</td>
                    <td class="px-4 py-2 text-right">{{ s.recordCount.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right font-medium">{{ formatAmount(s.amount) }}</td>
                    <td class="px-4 py-2 text-right text-slate-600">{{ s.pctAmount }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Collection by Category -->
          <div v-if="trendsReport.byCategory.length > 0" class="mt-6">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Collection by Category</h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600">Category</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Files</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Records</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                    <th class="px-4 py-2 text-right font-medium text-slate-600">% of Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="c in trendsReport.byCategory" :key="c.categoryCode" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2">
                      <span class="font-medium">{{ c.categoryName }}</span>
                      <span class="ml-1 text-slate-500">({{ c.categoryCode }})</span>
                    </td>
                    <td class="px-4 py-2 text-right">{{ c.fileCount }}</td>
                    <td class="px-4 py-2 text-right">{{ c.recordCount.toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right font-medium">{{ formatAmount(c.amount) }}</td>
                    <td class="px-4 py-2 text-right text-slate-600">{{ c.pctAmount }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p v-if="trendsReport.volumeByPeriod.length === 0 && trendsReport.bySource.length === 0" class="mt-6 text-center text-sm text-slate-500">
            Tiada data dalam julat tarikh yang dipilih.
          </p>
        </div>
      </article>

      <!-- Processing Report: Summary cards -->
      <div
        v-if="processingReport"
        class="space-y-6"
      >
        <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <FileText class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">Processing Report</h2>
            <span class="ml-auto text-xs text-slate-500">
              Generated {{ formatDate(processingReport.generatedAt) }}
            </span>
          </div>
          <div class="p-4">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <p class="text-xs font-medium text-slate-500">Total Files</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">{{ processingReport.summary.totalFiles }}</p>
              </div>
              <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <p class="text-xs font-medium text-slate-500">Records Parsed</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">
                  {{ processingReport.summary.totalRecordsParsed.toLocaleString() }}
                </p>
              </div>
              <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <p class="text-xs font-medium text-slate-500">Total Amount Parsed</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">
                  {{ formatAmount(processingReport.summary.totalAmountParsed) }}
                </p>
              </div>
              <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <p class="text-xs font-medium text-slate-500">Date Range</p>
                <p class="mt-1 text-sm text-slate-700">
                  {{ processingReport.dateRange?.from || "All" }}
                  <span v-if="processingReport.dateRange?.to"> → {{ processingReport.dateRange.to }}</span>
                </p>
              </div>
            </div>

            <div class="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By Processing Status</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(count, status) in processingReport.summary.byProcessingStatus"
                    :key="status"
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="statusBadgeClass(status)"
                  >
                    {{ status }}: {{ count }}
                  </span>
                </div>
              </div>
              <div>
                <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By Validation Status</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(count, status) in processingReport.summary.byValidationStatus"
                    :key="status"
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="statusBadgeClass(status)"
                  >
                    {{ status }}: {{ count }}
                  </span>
                </div>
              </div>
            </div>

            <!-- By Source -->
            <div v-if="processingReport.bySource.length > 0" class="mt-6">
              <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By Source</h3>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                      <th class="px-4 py-2 text-right font-medium text-slate-600">Files</th>
                      <th class="px-4 py-2 text-right font-medium text-slate-600">Records</th>
                      <th class="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="s in processingReport.bySource" :key="s.sourceCode" class="hover:bg-slate-50/50">
                      <td class="px-4 py-2">
                        <span class="font-medium">{{ s.sourceName }}</span>
                        <span class="ml-1 text-slate-500">({{ s.sourceCode }})</span>
                      </td>
                      <td class="px-4 py-2 text-right">{{ s.fileCount }}</td>
                      <td class="px-4 py-2 text-right">{{ s.recordsParsed.toLocaleString() }}</td>
                      <td class="px-4 py-2 text-right">{{ formatAmount(s.amountParsed) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Files -->
            <div v-if="processingReport.recentFiles.length > 0" class="mt-6">
              <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Files</h3>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">File</th>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">Received</th>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">Processing</th>
                      <th class="px-4 py-2 text-left font-medium text-slate-600">Validation</th>
                      <th class="px-4 py-2 text-right font-medium text-slate-600">Records</th>
                      <th class="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="f in processingReport.recentFiles" :key="f.id" class="hover:bg-slate-50/50">
                      <td class="max-w-[200px] truncate px-4 py-2 font-medium" :title="f.fileName">{{ f.fileName }}</td>
                      <td class="px-4 py-2 text-slate-600">{{ f.sourceName ?? f.sourceCode ?? "—" }}</td>
                      <td class="px-4 py-2 text-slate-600">{{ formatDate(f.receivedAt) }}</td>
                      <td class="px-4 py-2">
                        <span class="rounded px-1.5 py-0.5 text-xs font-medium" :class="statusBadgeClass(f.processingStatus)">
                          {{ f.processingStatus }}
                        </span>
                      </td>
                      <td class="px-4 py-2">
                        <span class="rounded px-1.5 py-0.5 text-xs font-medium" :class="statusBadgeClass(f.validationStatus)">
                          {{ f.validationStatus }}
                        </span>
                      </td>
                      <td class="px-4 py-2 text-right">{{ f.totalRecordsParsed?.toLocaleString() ?? "—" }}</td>
                      <td class="px-4 py-2 text-right">{{ formatAmount(f.totalAmountParsed) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state when no report yet -->
      <article
        v-if="!payerLoading && !payerReport && !processingLoading && !processingReport && !reconciliationLoading && !reconciliationReport && !trendsLoading && !trendsReport"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <BarChart3 class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Recent Reports</h2>
        </div>
        <div class="p-6">
          <p class="text-center text-sm text-slate-500">Tiada laporan dijana. Klik "Generate report" pada mana-mana laporan untuk menjana.</p>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
