<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Check, Eye, FileText, RefreshCw, X } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import {
  approveSpgPayrollBatch,
  getSpgPayrollBatchDetail,
  rejectSpgPayrollBatch,
} from "@/api/cms";
import type { SpgPayrollBatchDetail } from "@/types";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const actionLoading = ref(false);
const row = ref<SpgPayrollBatchDetail | null>(null);
const reason = ref("");
const error = ref("");
const message = ref("");

const batchId = computed(() => Number(route.params.batchId));

function fmtCurrency(value: string | number) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);
}

async function load() {
  if (!Number.isFinite(batchId.value)) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await getSpgPayrollBatchDetail(batchId.value);
    row.value = res.data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan butiran batch";
  } finally {
    loading.value = false;
  }
}

async function approve() {
  if (!row.value) return;
  actionLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    const res = await approveSpgPayrollBatch(row.value.id, reason.value || undefined);
    message.value = `Batch diluluskan. Receipt: ${res.data.officialReceiptNo || "-"}`;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal approve batch";
  } finally {
    actionLoading.value = false;
  }
}

async function reject() {
  if (!row.value) return;
  actionLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    await rejectSpgPayrollBatch(row.value.id, reason.value || undefined);
    message.value = "Batch ditolak.";
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal reject batch";
  } finally {
    actionLoading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="page-title">SPG Batch Detail</h1>
        <div class="flex items-center gap-2">
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="router.push('/spg/payments/pending')">
            Kembali
          </button>
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="load">
            <RefreshCw class="inline h-4 w-4" />
          </button>
        </div>
      </div>

      <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{{ message }}</div>
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</div>

      <article v-if="row" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <p><span class="font-medium text-slate-700">Reference:</span> {{ row.referenceNo }}</p>
          <p><span class="font-medium text-slate-700">Status:</span> {{ row.status }}</p>
          <p><span class="font-medium text-slate-700">Majikan:</span> {{ row.employer?.displayName || "-" }}</p>
          <p><span class="font-medium text-slate-700">Payer Code:</span> {{ row.employer?.payerCode || "-" }}</p>
          <p><span class="font-medium text-slate-700">Period:</span> {{ String(row.month).padStart(2, "0") }}/{{ row.year }}</p>
          <p><span class="font-medium text-slate-700">Channel:</span> {{ row.paymentChannel }}</p>
          <p><span class="font-medium text-slate-700">Rows:</span> {{ row.rowCount }}</p>
          <p><span class="font-medium text-slate-700">Jumlah:</span> {{ fmtCurrency(row.totalAmount) }}</p>
          <p><span class="font-medium text-slate-700">Duplicate (File):</span> {{ row.duplicateSummary.duplicateInFileCount }}</p>
          <p><span class="font-medium text-slate-700">Duplicate (Month):</span> {{ row.duplicateSummary.duplicateInMonthBatchCount }}</p>
          <p><span class="font-medium text-slate-700">Submitted:</span> {{ row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "-" }}</p>
          <p><span class="font-medium text-slate-700">Receipt:</span> {{ row.officialReceiptNo || "-" }}</p>
          <p class="md:col-span-2">
            <span class="font-medium text-slate-700">Slip:</span>
            <a v-if="row.supportingSlipUrl" :href="row.supportingSlipUrl" target="_blank" rel="noreferrer" class="ml-1 text-blue-600 hover:underline">
              Buka Dokumen
            </a>
            <span v-else class="ml-1 text-slate-500">-</span>
          </p>
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 p-3">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Catatan Semakan</label>
          <textarea
            v-model="reason"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Sebab approve/reject (optional)"
          />
          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              class="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
              :disabled="actionLoading || row.status !== 'pending_payment'"
              @click="approve"
            >
              <Check class="h-4 w-4" />
              <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Approve</span>
            </button>
            <button
              class="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300 text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
              :disabled="actionLoading || row.status !== 'pending_payment'"
              @click="reject"
            >
              <X class="h-4 w-4" />
              <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Reject</span>
            </button>
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex items-center gap-2">
            <FileText class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">Senarai Pekerja</h2>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">IC</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(line, idx) in row?.lines || []" :key="line.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 text-slate-600">{{ idx + 1 }}</td>
                <td class="px-4 py-2 text-slate-800">{{ line.employeeName }}</td>
                <td class="px-4 py-2 text-slate-600">{{ line.employeeIdentityNo }}</td>
                <td class="px-4 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(line.amount) }}</td>
                <td class="px-4 py-2 text-right">
                  <button
                    class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Eye class="h-3.5 w-3.5" />
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      Lihat
                    </span>
                  </button>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="5" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && (!row || row.lines.length === 0)">
                <td colspan="5" class="px-4 py-6 text-center text-slate-400">Tiada baris pekerja.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
