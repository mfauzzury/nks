<script setup lang="ts">
import { computed, onMounted, ref, unref, watch } from "vue";
import { useRoute } from "vue-router";
import { Eye, Save, Search } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";
import { createCounterDeposit, getCounterDeposit, listCounterDeposits, listCounterPayments } from "@/api/cms";
import type { CounterDepositBatchDetail, CounterDepositBatchRow, CounterDepositType, CounterPaymentRow } from "@/types";

const route = useRoute();
const loading = ref(false);
const creating = ref(false);
const message = ref("");
const error = ref("");

const type = ref<CounterDepositType>("CASH_BANKIN");
const depositDate = ref(new Date().toISOString().slice(0, 10));
const collectionPoint = ref("Kaunter Utama");
const notes = ref("");
const slipFile = ref<File | null>(null);

const availablePayments = ref<CounterPaymentRow[]>([]);
const selectedPaymentIds = ref<number[]>([]);
const declaredAmount = ref<number>(0);
const paymentPage = ref(1);
const paymentLimit = ref(20);

const batches = ref<CounterDepositBatchRow[]>([]);
const detailLoading = ref(false);
const selectedBatch = ref<CounterDepositBatchDetail | null>(null);
const dragBatchDetail = useDraggableModal();
const batchPage = ref(1);
const batchLimit = ref(20);

const expectedChannel = computed(() => (type.value === "CASH_BANKIN" ? "COUNTER_CASH" : "COUNTER_CARD_TERMINAL"));
const systemAmount = computed(() => {
  const ids = new Set(selectedPaymentIds.value);
  return availablePayments.value
    .filter((p) => ids.has(p.id))
    .reduce((sum, p) => sum + Number(p.amount), 0);
});

const variance = computed(() => Math.round((Number(declaredAmount.value || 0) - systemAmount.value) * 100) / 100);
const paymentTotal = computed(() => availablePayments.value.length);
const paymentTotalPages = computed(() => Math.max(1, Math.ceil(paymentTotal.value / paymentLimit.value)));
const pagedAvailablePayments = computed(() => {
  const start = (paymentPage.value - 1) * paymentLimit.value;
  return availablePayments.value.slice(start, start + paymentLimit.value);
});
const batchTotal = computed(() => batches.value.length);
const batchTotalPages = computed(() => Math.max(1, Math.ceil(batchTotal.value / batchLimit.value)));
const pagedBatches = computed(() => {
  const start = (batchPage.value - 1) * batchLimit.value;
  return batches.value.slice(start, start + batchLimit.value);
});

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(Number(value || 0));
}

function fmtDate(value: string) {
  return new Date(value).toLocaleString("ms-MY");
}

function toggleSelection(id: number) {
  if (selectedPaymentIds.value.includes(id)) {
    selectedPaymentIds.value = selectedPaymentIds.value.filter((x) => x !== id);
  } else {
    selectedPaymentIds.value.push(id);
  }
}

function onSlipChange(e: Event) {
  const input = e.target as HTMLInputElement;
  slipFile.value = input.files && input.files.length > 0 ? input.files[0] : null;
}

async function loadPayments() {
  const res = await listCounterPayments({
    page: 1,
    limit: 200,
    reconStatus: "unbatched",
    channel: expectedChannel.value,
  });
  availablePayments.value = res.data || [];
  if (paymentPage.value > paymentTotalPages.value) paymentPage.value = paymentTotalPages.value;
}

async function loadBatches() {
  const res = await listCounterDeposits({ page: 1, limit: 100 });
  batches.value = res.data || [];
  if (batchPage.value > batchTotalPages.value) batchPage.value = batchTotalPages.value;
}

async function submitBatch() {
  if (selectedPaymentIds.value.length === 0) {
    error.value = "Sila pilih sekurang-kurangnya satu transaksi.";
    return;
  }
  creating.value = true;
  error.value = "";
  message.value = "";
  try {
    const res = await createCounterDeposit({
      depositType: type.value,
      depositDate: `${depositDate.value}T00:00:00.000Z`,
      collectionPoint: collectionPoint.value || undefined,
      paymentIds: selectedPaymentIds.value,
      declaredAmount: Number(declaredAmount.value),
      notes: notes.value || undefined,
      slipFile: slipFile.value,
    });
    message.value = `Batch berjaya dicipta: ${res.data.referenceNo}`;
    selectedPaymentIds.value = [];
    declaredAmount.value = 0;
    notes.value = "";
    slipFile.value = null;
    await Promise.all([loadPayments(), loadBatches()]);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal mencipta batch";
  } finally {
    creating.value = false;
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

watch(systemAmount, (val) => {
  if (selectedPaymentIds.value.length > 0 && Number(declaredAmount.value || 0) === 0) {
    declaredAmount.value = Math.round(val * 100) / 100;
  }
});

watch(type, async () => {
  selectedPaymentIds.value = [];
  declaredAmount.value = 0;
  await loadPayments();
});

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([loadPayments(), loadBatches()]);
    const add = String(route.query.add || "").trim();
    if (add) {
      const ids = add.split(",").map((x) => Number(x)).filter((x) => Number.isFinite(x));
      const validIds = new Set(availablePayments.value.map((p) => p.id));
      selectedPaymentIds.value = ids.filter((id) => validIds.has(id));
      declaredAmount.value = Math.round(systemAmount.value * 100) / 100;
    }
  } finally {
    loading.value = false;
  }
});

function prevPaymentPage() {
  if (paymentPage.value <= 1) return;
  paymentPage.value -= 1;
}

function nextPaymentPage() {
  if (paymentPage.value >= paymentTotalPages.value) return;
  paymentPage.value += 1;
}

function prevBatchPage() {
  if (batchPage.value <= 1) return;
  batchPage.value -= 1;
}

function nextBatchPage() {
  if (batchPage.value >= batchTotalPages.value) return;
  batchPage.value += 1;
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Konsolidasi Bank-In</h1>

      <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{{ message }}</div>
      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Cipta Batch Deposit</h2>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Jenis Deposit</label>
            <select v-model="type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="CASH_BANKIN">Cash Bank-In</option>
              <option value="CARD_SETTLEMENT">Card Settlement</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Tarikh Deposit</label>
            <input v-model="depositDate" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Pusat Kutipan</label>
            <input v-model="collectionPoint" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2"></th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resit</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarikh</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">IC</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amaun</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in pagedAvailablePayments" :key="p.id" class="transition-colors hover:bg-slate-50">
                <td class="px-3 py-2"><input type="checkbox" :checked="selectedPaymentIds.includes(p.id)" @change="toggleSelection(p.id)" /></td>
                <td class="px-3 py-2 font-medium text-slate-800">{{ p.receiptNo }}</td>
                <td class="px-3 py-2 text-slate-600">{{ fmtDate(p.paidAt) }}</td>
                <td class="px-3 py-2 text-slate-800">{{ p.guestName }}</td>
                <td class="px-3 py-2 text-slate-600">{{ p.identityNo }}</td>
                <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(p.amount) }}</td>
              </tr>
              <tr v-if="loading"><td colspan="6" class="px-3 py-5 text-center text-slate-400">Memuatkan...</td></tr>
              <tr v-if="!loading && availablePayments.length === 0"><td colspan="6" class="px-3 py-5 text-center text-slate-400">Tiada transaksi unbatched untuk channel ini.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-xs text-slate-500">Papar {{ paymentTotal === 0 ? 0 : (paymentPage - 1) * paymentLimit + 1 }}-{{ Math.min(paymentTotal, paymentPage * paymentLimit) }} daripada {{ paymentTotal }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="paymentPage <= 1" @click="prevPaymentPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ paymentPage }} / {{ paymentTotalPages }}</span>
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="paymentPage >= paymentTotalPages" @click="nextPaymentPage">Next</button>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">System Amount</label>
            <input :value="fmtCurrency(systemAmount)" readonly class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Declared Amount</label>
            <input v-model.number="declaredAmount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Variance</label>
            <input :value="fmtCurrency(variance)" readonly class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm" :class="variance === 0 ? 'text-emerald-700' : 'text-rose-700'" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Slip (optional)</label>
            <input type="file" accept=".pdf,image/*" class="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" @change="onSlipChange" />
          </div>
        </div>

        <div class="mt-3">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Catatan</label>
          <textarea v-model="notes" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div class="mt-3 flex justify-end">
          <button :disabled="creating" class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" @click="submitBatch">
            <Save class="h-4 w-4" /> {{ creating ? "Menyimpan..." : "Simpan Batch" }}
          </button>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <h2 class="text-sm font-semibold text-slate-900">Senarai Batch Deposit</h2>
          <button class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="loadBatches">
            <Search class="h-4 w-4" /> Muat Semula
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarikh</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">System</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Declared</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in pagedBatches" :key="b.id" class="transition-colors hover:bg-slate-50">
                <td class="px-3 py-2 font-medium text-slate-800">{{ b.referenceNo }}</td>
                <td class="px-3 py-2 text-slate-600">{{ b.depositType }}</td>
                <td class="px-3 py-2 text-slate-600">{{ fmtDate(b.depositDate) }}</td>
                <td class="px-3 py-2"><span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ b.status }}</span></td>
                <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(b.systemAmount) }}</td>
                <td class="px-3 py-2 text-right text-slate-700">{{ fmtCurrency(b.declaredAmount) }}</td>
                <td class="px-3 py-2 text-right">
                  <button class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" @click="openBatch(b.id)">
                    <Eye class="h-3.5 w-3.5" />
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Lihat</span>
                  </button>
                </td>
              </tr>
              <tr v-if="batches.length === 0"><td colspan="7" class="px-3 py-5 text-center text-slate-400">Tiada batch.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between px-4 pb-3">
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
                    <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amaun</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="p in selectedBatch.payments" :key="p.id">
                    <td class="px-3 py-2 font-medium text-slate-800">{{ p.receiptNo }}</td>
                    <td class="px-3 py-2 text-slate-800">{{ p.guestName }}</td>
                    <td class="px-3 py-2 text-slate-600">{{ p.identityNo }}</td>
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
