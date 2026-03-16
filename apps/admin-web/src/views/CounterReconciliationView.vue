<script setup lang="ts">
import { computed, onMounted, ref, unref } from "vue";
import { CheckCircle2, Eye, Play, Upload, Wrench } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";
import {
  confirmDepositReconciliation,
  getCounterDeposit,
  listCounterDeposits,
  listReconciliationCases,
  resolveReconciliationCase,
  runReconciliation,
  uploadBankStatement,
} from "@/api/cms";
import type { CounterDepositBatchDetail, CounterDepositBatchRow, CounterPaymentRow, ReconciliationCaseRow } from "@/types";

const statementFile = ref<File | null>(null);
const statementId = ref<number | null>(null);
const uploadSummary = ref<{ parsedCount: number; errorCount: number; errors: Array<{ lineNo: number; error: string }> } | null>(null);
const runSummary = ref<{ matched: number; partial: number; unmatched: number } | null>(null);
const loading = ref(false);
const actionLoading = ref(false);
const cases = ref<ReconciliationCaseRow[]>([]);
const matchedBatches = ref<CounterDepositBatchRow[]>([]);
const selectedBatch = ref<CounterDepositBatchDetail | null>(null);
const detailLoading = ref(false);
const dragBatchDetail = useDraggableModal();
const casePage = ref(1);
const caseLimit = ref(20);
const batchPage = ref(1);
const batchLimit = ref(20);
const reason = ref("");
const error = ref("");
const message = ref("");
const confirmHint = ref<{ batchId: number; message: string } | null>(null);

const caseTotal = computed(() => cases.value.length);
const caseTotalPages = computed(() => Math.max(1, Math.ceil(caseTotal.value / caseLimit.value)));
const pagedCases = computed(() => {
  const start = (casePage.value - 1) * caseLimit.value;
  return cases.value.slice(start, start + caseLimit.value);
});

const batchTotal = computed(() => matchedBatches.value.length);
const batchTotalPages = computed(() => Math.max(1, Math.ceil(batchTotal.value / batchLimit.value)));
const pagedMatchedBatches = computed(() => {
  const start = (batchPage.value - 1) * batchLimit.value;
  return matchedBatches.value.slice(start, start + batchLimit.value);
});

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(Number(value || 0));
}

function fmtDate(value: string) {
  return new Date(value).toLocaleString("ms-MY");
}

function formatZakatSummary(payment: CounterPaymentRow) {
  if (payment.zakatItems && payment.zakatItems.length > 0) {
    return payment.zakatItems.map((item) => `${item.zakatType} (${item.financialYear})`).join(", ");
  }
  return payment.paymentMethod.split("|").map((s) => s.trim())[1] || "-";
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  statementFile.value = target.files && target.files.length > 0 ? target.files[0] : null;
}

async function load() {
  loading.value = true;
  try {
    const [casesRes, batchesRes] = await Promise.all([
      listReconciliationCases({ page: 1, limit: 100 }),
      listCounterDeposits({ page: 1, limit: 100, status: "matched" }),
    ]);
    cases.value = casesRes.data || [];
    matchedBatches.value = batchesRes.data || [];
    if (casePage.value > caseTotalPages.value) casePage.value = caseTotalPages.value;
    if (batchPage.value > batchTotalPages.value) batchPage.value = batchTotalPages.value;
  } finally {
    loading.value = false;
  }
}

async function handleUpload() {
  if (!statementFile.value) return;
  actionLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    const res = await uploadBankStatement({ file: statementFile.value });
    statementId.value = res.data.statementId;
    uploadSummary.value = {
      parsedCount: res.data.parsedCount,
      errorCount: res.data.errorCount,
      errors: res.data.errors,
    };
    message.value = `Statement dimuat naik: ${res.data.fileName}`;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal muat naik statement";
  } finally {
    actionLoading.value = false;
  }
}

async function handleRunReconciliation() {
  if (!statementId.value) return;
  actionLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    const res = await runReconciliation(statementId.value, 3);
    runSummary.value = res.data;
    message.value = "Rekonsiliasi auto selesai.";
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal jalankan rekonsiliasi";
  } finally {
    actionLoading.value = false;
  }
}

async function resolveCase(caseId: number, action: "mark_bank_fee" | "mark_reversal" | "ignore") {
  actionLoading.value = true;
  error.value = "";
  try {
    await resolveReconciliationCase({ caseId, action, reason: reason.value || undefined });
    await load();
    message.value = `Case #${caseId} berjaya diselesaikan.`;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal resolve case";
  } finally {
    actionLoading.value = false;
  }
}

async function mapCaseToBatch(caseId: number, batchIdRaw: string) {
  const batchId = Number(batchIdRaw);
  if (!Number.isFinite(batchId)) return;
  actionLoading.value = true;
  error.value = "";
  try {
    await resolveReconciliationCase({ caseId, action: "map_batch", batchId, reason: reason.value || undefined });
    await load();
    message.value = `Case #${caseId} berjaya dipadankan ke batch.`;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal map case";
  } finally {
    actionLoading.value = false;
  }
}

function onMapSelect(caseId: number, event: Event) {
  const target = event.target as HTMLSelectElement | null;
  if (!target) return;
  void mapCaseToBatch(caseId, target.value);
  target.value = "";
}

async function confirmBatch(batchId: number) {
  actionLoading.value = true;
  error.value = "";
  confirmHint.value = null;
  try {
    await confirmDepositReconciliation(batchId);
    message.value = `Batch #${batchId} disahkan sebagai reconciled.`;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal confirm batch";
    if (error.value.includes("Batch cannot be confirmed")) {
      confirmHint.value = {
        batchId,
        message: error.value,
      };
    }
  } finally {
    actionLoading.value = false;
  }
}

async function openBatch(id: number) {
  detailLoading.value = true;
  try {
    const res = await getCounterDeposit(id);
    selectedBatch.value = res.data;
  } finally {
    detailLoading.value = false;
  }
}

function prevCasePage() {
  if (casePage.value <= 1) return;
  casePage.value -= 1;
}

function nextCasePage() {
  if (casePage.value >= caseTotalPages.value) return;
  casePage.value += 1;
}

function prevBatchPage() {
  if (batchPage.value <= 1) return;
  batchPage.value -= 1;
}

function nextBatchPage() {
  if (batchPage.value >= batchTotalPages.value) return;
  batchPage.value += 1;
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Rekonsiliasi Bank</h1>

      <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{{ message }}</div>
      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</div>
      <div v-if="confirmHint" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <p class="font-semibold">Panduan Confirm Batch #{{ confirmHint.batchId }}</p>
        <p class="mt-1">{{ confirmHint.message }}</p>
        <p class="mt-1 text-xs">Semak kes rekonsiliasi terbuka dan pastikan jumlah padanan statement sama dengan jumlah sistem batch sebelum confirm semula.</p>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Upload Statement & Jalankan Auto-Match</h2>
        <div class="flex flex-wrap items-center gap-2">
          <input type="file" accept=".csv,text/csv" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" @change="onFileChange" />
          <button class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" :disabled="!statementFile || actionLoading" @click="handleUpload">
            <Upload class="h-4 w-4" /> Upload CSV
          </button>
          <button class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="!statementId || actionLoading" @click="handleRunReconciliation">
            <Play class="h-4 w-4" /> Run Reconciliation
          </button>
        </div>

        <div v-if="uploadSummary" class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p><span class="font-medium">Parsed:</span> {{ uploadSummary.parsedCount }}</p>
          <p><span class="font-medium">Errors:</span> {{ uploadSummary.errorCount }}</p>
          <ul v-if="uploadSummary.errors.length > 0" class="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-700">
            <li v-for="err in uploadSummary.errors.slice(0, 10)" :key="`${err.lineNo}-${err.error}`">Line {{ err.lineNo }}: {{ err.error }}</li>
          </ul>
        </div>

        <div v-if="runSummary" class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">Matched: <span class="font-semibold">{{ runSummary.matched }}</span></div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Partial: <span class="font-semibold">{{ runSummary.partial }}</span></div>
          <div class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm">Unmatched: <span class="font-semibold">{{ runSummary.unmatched }}</span></div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Kes Rekonsiliasi</h2>
        <div class="mb-3">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Catatan tindakan (optional)</label>
          <textarea v-model="reason" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Case</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Statement</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Batch</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in pagedCases" :key="item.id" class="transition-colors hover:bg-slate-50">
                <td class="px-3 py-2 font-medium text-slate-800">#{{ item.id }}</td>
                <td class="px-3 py-2 text-slate-600">{{ item.caseType }}</td>
                <td class="px-3 py-2 text-slate-600">
                  <p v-if="item.statementLine">{{ item.statementLine.description }}</p>
                  <p v-if="item.statementLine" class="text-xs text-slate-500">{{ fmtDate(item.statementLine.txnDate) }} · {{ fmtCurrency(item.statementLine.netAmount) }}</p>
                  <span v-else>-</span>
                </td>
                <td class="px-3 py-2 text-slate-600">
                  <p v-if="item.batch">{{ item.batch.referenceNo }}</p>
                  <p v-if="item.batch" class="text-xs text-slate-500">{{ fmtCurrency(item.batch.systemAmount) }} · {{ item.batch.itemCount }} transaksi</p>
                  <span v-else>-</span>
                </td>
                <td class="px-3 py-2"><span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ item.status }}</span></td>
                <td class="px-3 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <select class="rounded-lg border border-slate-300 px-2 py-1 text-xs" @change="onMapSelect(item.id, $event)">
                      <option value="">Map to batch...</option>
                      <option v-for="b in matchedBatches" :key="b.id" :value="b.id">{{ b.referenceNo }}</option>
                    </select>
                    <button class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" @click="resolveCase(item.id, 'mark_bank_fee')">
                      <Wrench class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Bank Fee</span>
                    </button>
                    <button class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" @click="resolveCase(item.id, 'mark_reversal')">
                      <Wrench class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Reversal</span>
                    </button>
                    <button class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" @click="resolveCase(item.id, 'ignore')">
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Ignore</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="loading"><td colspan="6" class="px-3 py-5 text-center text-slate-400">Memuatkan...</td></tr>
              <tr v-if="!loading && cases.length === 0"><td colspan="6" class="px-3 py-5 text-center text-slate-400">Tiada kes rekonsiliasi.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-xs text-slate-500">Papar {{ caseTotal === 0 ? 0 : (casePage - 1) * caseLimit + 1 }}-{{ Math.min(caseTotal, casePage * caseLimit) }} daripada {{ caseTotal }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="casePage <= 1" @click="prevCasePage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ casePage }} / {{ caseTotalPages }}</span>
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="casePage >= caseTotalPages" @click="nextCasePage">Next</button>
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Batch Matched Menunggu Confirm</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarikh</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Item</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in pagedMatchedBatches" :key="b.id">
                <td class="px-3 py-2 font-medium text-slate-800">{{ b.referenceNo }}</td>
                <td class="px-3 py-2 text-slate-600">{{ b.depositType }}</td>
                <td class="px-3 py-2 text-slate-600">{{ fmtDate(b.depositDate) }}</td>
                <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(b.systemAmount) }}</td>
                <td class="px-3 py-2 text-right text-slate-600">{{ b.itemCount }}</td>
                <td class="px-3 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" @click="openBatch(b.id)">
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Detail</span>
                    </button>
                    <button class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60" :disabled="actionLoading" @click="confirmBatch(b.id)">
                    Confirm Reconciled
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="matchedBatches.length === 0"><td colspan="6" class="px-3 py-5 text-center text-slate-400">Tiada batch menunggu confirm.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-xs text-slate-500">Papar {{ batchTotal === 0 ? 0 : (batchPage - 1) * batchLimit + 1 }}-{{ Math.min(batchTotal, batchPage * batchLimit) }} daripada {{ batchTotal }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="batchPage <= 1" @click="prevBatchPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ batchPage }} / {{ batchTotalPages }}</span>
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="batchPage >= batchTotalPages" @click="nextBatchPage">Next</button>
          </div>
        </div>
      </article>

      <div v-if="selectedBatch" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" @click.self="selectedBatch = null; dragBatchDetail.resetPosition()">
        <div
          :ref="dragBatchDetail.modalRef"
          :style="unref(dragBatchDetail.modalStyle)"
          class="w-full max-w-4xl rounded-xl bg-white p-4 shadow-xl"
        >
          <div
            class="mb-3 flex cursor-move items-center justify-between"
            @mousedown="dragBatchDetail.onHandleMouseDown"
          >
            <h2 class="text-base font-semibold text-slate-900">Detail Batch: {{ selectedBatch.referenceNo }}</h2>
            <button class="rounded-lg border border-slate-300 px-2 py-1 text-sm" @click="selectedBatch = null; dragBatchDetail.resetPosition()">Tutup</button>
          </div>
          <div v-if="detailLoading" class="py-8 text-center text-sm text-slate-500">Memuatkan...</div>
          <template v-else>
            <div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
              <p><span class="font-medium">Status:</span> {{ selectedBatch.status }}</p>
              <p><span class="font-medium">Type:</span> {{ selectedBatch.depositType }}</p>
              <p><span class="font-medium">Tarikh:</span> {{ fmtDate(selectedBatch.depositDate) }}</p>
              <p><span class="font-medium">System:</span> {{ fmtCurrency(selectedBatch.systemAmount) }}</p>
              <p><span class="font-medium">Declared:</span> {{ fmtCurrency(selectedBatch.declaredAmount) }}</p>
              <p><span class="font-medium">Variance:</span> {{ fmtCurrency(selectedBatch.varianceAmount) }}</p>
            </div>
            <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-100 text-left">
                    <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resit</th>
                    <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                    <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">IC</th>
                    <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Zakat</th>
                    <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amaun</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="p in selectedBatch.payments" :key="p.id">
                    <td class="px-3 py-2 font-medium text-slate-800">{{ p.receiptNo }}</td>
                    <td class="px-3 py-2 text-slate-800">{{ p.guestName }}</td>
                    <td class="px-3 py-2 text-slate-600">{{ p.identityNo }}</td>
                    <td class="px-3 py-2 text-slate-600">{{ formatZakatSummary(p) }}</td>
                    <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(p.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
