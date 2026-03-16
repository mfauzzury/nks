<script setup lang="ts">
import { computed, onMounted, ref, unref } from "vue";
import { useRouter } from "vue-router";
import { Banknote, ExternalLink, Hash, Monitor, PlusCircle, Search, TrendingUp, Users } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";
import { getCounterPayment, listCounterPayments } from "@/api/cms";
import type { CounterPaymentChannel, CounterPaymentRow, CounterReconStatus } from "@/types";

const router = useRouter();
const loading = ref(false);
const q = ref("");
const channel = ref<CounterPaymentChannel | "">("");
const reconStatus = ref<CounterReconStatus | "">("");
const rows = ref<CounterPaymentRow[]>([]);
const selectedIds = ref<number[]>([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);

const showReceipt = ref(false);
const dragReceipt = useDraggableModal();
const receiptLoading = ref(false);
const selectedReceipt = ref<CounterPaymentRow | null>(null);

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(Number(value || 0));
}

function fmtDate(value: string) {
  return new Date(value).toLocaleString("ms-MY");
}

function formatZakatSummary(row: CounterPaymentRow) {
  if (row.zakatItems && row.zakatItems.length > 0) {
    return row.zakatItems.map((z) => `${z.zakatType} (${z.financialYear})`).join(", ");
  }
  return row.paymentMethod.split("|").map((p) => p.trim())[1] || "-";
}

const totalAmount = computed(() => rows.value.reduce((sum, r) => sum + Number(r.amount || 0), 0));
const totalTransactions = computed(() => rows.value.length);
const uniquePayers = computed(() => new Set(rows.value.map((r) => r.identityNo)).size);
const todayAmount = computed(() => {
  const today = new Date().toDateString();
  return rows.value
    .filter((r) => new Date(r.paidAt).toDateString() === today)
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
});
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));

const allChecked = computed({
  get: () => rows.value.length > 0 && selectedIds.value.length === rows.value.length,
  set: (checked: boolean) => {
    selectedIds.value = checked ? rows.value.map((r) => r.id) : [];
  },
});

function toggleSelected(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  } else {
    selectedIds.value.push(id);
  }
}

function goToDepositWithSelected() {
  if (selectedIds.value.length === 0) return;
  router.push({ path: "/counter/deposits", query: { add: selectedIds.value.join(",") } });
}

function openPos() {
  const href = router.resolve({ name: "counter-pos" }).href;
  window.open(href, "_blank");
}

function openDesk() {
  const href = router.resolve({ name: "counter-desk" }).href;
  window.open(href, "_blank");
}

async function openReceipt(id: number) {
  showReceipt.value = true;
  receiptLoading.value = true;
  try {
    const res = await getCounterPayment(id);
    selectedReceipt.value = res.data;
  } finally {
    receiptLoading.value = false;
  }
}

function printReceipt() {
  window.print();
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadReceiptPdf() {
  if (!selectedReceipt.value) return;
  const tx = selectedReceipt.value;
  const zakatLines = (tx.zakatItems && tx.zakatItems.length > 0)
    ? tx.zakatItems.map((item) => `- ${item.zakatType} (${item.financialYear}): RM ${Number(item.amount).toFixed(2)}`)
    : [`- ${tx.paymentMethod.split("|").map((p) => p.trim())[1] || "-"}`];
  const lines = [
    "RESIT BAYARAN KAUNTER - NKS",
    "",
    `No. Resit: ${tx.receiptNo}`,
    `Nama: ${tx.guestName}`,
    `IC / Passport: ${tx.identityNo}`,
    `Jumlah: RM ${Number(tx.amount).toFixed(2)}`,
    `Kaedah Bayaran: ${tx.counterChannel || "-"}`,
    `Tarikh: ${fmtDate(tx.paidAt)}`,
    `Status Rekonsiliasi: ${tx.reconStatus}`,
    "",
    "Item Zakat:",
    ...zakatLines,
  ];
  const content = lines.map((line, i) => `BT /F1 12 Tf 50 ${800 - i * 24} Td (${escapePdfText(line)}) Tj ET`).join("\n");
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
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([new TextEncoder().encode(pdf)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tx.receiptNo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

async function load() {
  loading.value = true;
  try {
    const res = await listCounterPayments({
      q: q.value || undefined,
      channel: channel.value || undefined,
      reconStatus: reconStatus.value || undefined,
      page: page.value,
      limit: limit.value,
    });
    rows.value = res.data || [];
    const meta = (res.meta || {}) as { total?: number };
    total.value = Number(meta.total || 0);
    selectedIds.value = [];
  } finally {
    loading.value = false;
  }
}

async function search() {
  page.value = 1;
  await load();
}

async function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
  await load();
}

async function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await load();
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between gap-2">
        <h1 class="page-title">Senarai Kutipan Kaunter</h1>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            :disabled="selectedIds.length === 0"
            @click="goToDepositWithSelected"
          >
            <PlusCircle class="h-4 w-4" /> Tambah ke Batch
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            @click="openDesk"
          >
            <Monitor class="h-4 w-4" />
            Counter Desk
            <ExternalLink class="h-3.5 w-3.5" />
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="openPos"
          >
            <Monitor class="h-4 w-4" />
            Mod POS
            <ExternalLink class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Hash class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Jumlah Transaksi</p>
            <p class="text-lg font-bold text-slate-900">{{ totalTransactions }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Banknote class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Jumlah Kutipan</p>
            <p class="text-lg font-bold text-slate-900">{{ fmtCurrency(totalAmount) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TrendingUp class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Kutipan Hari Ini</p>
            <p class="text-lg font-bold text-slate-900">{{ fmtCurrency(todayAmount) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Users class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Pembayar Unik</p>
            <p class="text-lg font-bold text-slate-900">{{ uniquePayers }}</p>
          </div>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input v-model="q" placeholder="Carian resit/nama/IC" class="w-64 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm" @keyup.enter="search" />
            </div>
            <select v-model="channel" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm">
              <option value="">Semua Channel</option>
              <option value="COUNTER_CASH">Tunai</option>
              <option value="COUNTER_CARD_TERMINAL">Kad Terminal</option>
            </select>
            <select v-model="reconStatus" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm">
              <option value="">Semua Status Recon</option>
              <option value="unbatched">Unbatched</option>
              <option value="batched">Batched</option>
              <option value="reconciled">Reconciled</option>
              <option value="exception">Exception</option>
            </select>
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="search">Cari</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2"><input v-model="allChecked" type="checkbox" /></th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resit</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarikh</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Pembayar</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis Zakat</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Channel</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amaun</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recon</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id" class="cursor-pointer transition-colors hover:bg-slate-50" @click="openReceipt(row.id)">
                <td class="px-3 py-2" @click.stop>
                  <input :checked="selectedIds.includes(row.id)" :disabled="row.reconStatus !== 'unbatched'" type="checkbox" @change="toggleSelected(row.id)" />
                </td>
                <td class="px-3 py-2 font-medium text-slate-800">{{ row.receiptNo }}</td>
                <td class="px-3 py-2 text-slate-600">{{ fmtDate(row.paidAt) }}</td>
                <td class="px-3 py-2">
                  <p class="font-medium text-slate-800">{{ row.guestName }}</p>
                  <p class="text-xs text-slate-500">{{ row.identityNo }}</p>
                </td>
                <td class="px-3 py-2 text-slate-600">{{ formatZakatSummary(row) }}</td>
                <td class="px-3 py-2 text-slate-600">{{ row.counterChannel }}</td>
                <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(row.amount) }}</td>
                <td class="px-3 py-2">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ row.reconStatus }}</span>
                </td>
              </tr>
              <tr v-if="loading"><td colspan="8" class="px-3 py-6 text-center text-slate-400">Memuatkan...</td></tr>
              <tr v-if="!loading && rows.length === 0"><td colspan="8" class="px-3 py-6 text-center text-slate-400">Tiada data kutipan.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
          <p class="text-xs text-slate-500">Papar {{ fromRow }}-{{ toRow }} daripada {{ total }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page <= 1" @click="prevPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ page }} / {{ totalPages }}</span>
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page >= totalPages" @click="nextPage">Next</button>
          </div>
        </div>
      </article>

      <div v-if="showReceipt" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" @click.self="showReceipt = false; dragReceipt.resetPosition()">
        <div
          :ref="dragReceipt.modalRef"
          :style="unref(dragReceipt.modalStyle)"
          class="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl"
          id="counter-list-receipt-print"
        >
          <div
            class="mb-3 flex cursor-move items-center justify-between"
            @mousedown="dragReceipt.onHandleMouseDown"
          >
            <h2 class="text-base font-semibold text-slate-900">Resit Bayaran</h2>
            <button class="rounded-lg border border-slate-300 px-2 py-1 text-sm" @click="showReceipt = false; dragReceipt.resetPosition()">Tutup</button>
          </div>
          <div v-if="receiptLoading" class="py-8 text-center text-sm text-slate-500">Memuatkan...</div>
          <template v-else-if="selectedReceipt">
            <div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p><span class="font-medium">No. Resit:</span> {{ selectedReceipt.receiptNo }}</p>
              <p><span class="font-medium">Status:</span> {{ selectedReceipt.status }}</p>
              <p><span class="font-medium">Nama:</span> {{ selectedReceipt.guestName }}</p>
              <p><span class="font-medium">IC:</span> {{ selectedReceipt.identityNo }}</p>
              <p><span class="font-medium">Kaedah:</span> {{ selectedReceipt.counterChannel }}</p>
              <p><span class="font-medium">Tarikh:</span> {{ fmtDate(selectedReceipt.paidAt) }}</p>
              <p class="md:col-span-2 text-base font-semibold">Jumlah: {{ fmtCurrency(selectedReceipt.amount) }}</p>
            </div>
            <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Perincian Zakat</p>
              <div class="mt-2 space-y-1.5">
                <div
                  v-for="line in selectedReceipt.zakatItems || []"
                  :key="line.id"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="text-slate-700">{{ line.zakatType }} ({{ line.financialYear }})</span>
                  <span class="font-semibold text-slate-900">{{ fmtCurrency(line.amount) }}</span>
                </div>
                <p v-if="!selectedReceipt.zakatItems || selectedReceipt.zakatItems.length === 0" class="text-xs text-slate-500">Tiada item direkodkan.</p>
              </div>
            </div>
            <div class="mt-4 flex justify-end gap-2">
              <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" @click="printReceipt">Cetak</button>
              <button class="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white" @click="downloadReceiptPdf">Muat Turun PDF</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
@media print {
  body * { visibility: hidden; }
  #counter-list-receipt-print, #counter-list-receipt-print * { visibility: visible; }
  #counter-list-receipt-print { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
