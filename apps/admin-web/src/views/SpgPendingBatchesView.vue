<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CheckCircle2, Clock3, Eye, Search } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listPendingSpgPayrollBatches } from "@/api/cms";
import type { SpgPayrollBatchRow } from "@/types";

const loading = ref(false);
const q = ref("");
const allRows = ref<SpgPayrollBatchRow[]>([]);
const page = ref(1);
const limit = ref(20);

const total = computed(() => allRows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));
const rows = computed(() => {
  const start = (page.value - 1) * limit.value;
  return allRows.value.slice(start, start + limit.value);
});

function fmtCurrency(value: string | number) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);
}

function fmtPeriod(row: SpgPayrollBatchRow) {
  return `${String(row.month).padStart(2, "0")}/${row.year}`;
}

async function load() {
  loading.value = true;
  try {
    const res = await listPendingSpgPayrollBatches();
    const all = res.data || [];
    const term = q.value.trim().toLowerCase();
    allRows.value = !term
      ? all
      : all.filter((row) =>
          row.referenceNo.toLowerCase().includes(term) ||
          (row.employer?.displayName || "").toLowerCase().includes(term) ||
          (row.employer?.payerCode || "").toLowerCase().includes(term),
        );
    if (page.value > totalPages.value) page.value = totalPages.value;
  } finally {
    loading.value = false;
  }
}

async function search() {
  page.value = 1;
  await load();
}

function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
}

function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between gap-2">
        <h1 class="page-title">SPG - Pending Payment</h1>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Clock3 class="h-4 w-4 text-blue-600" />
              <h2 class="text-sm font-semibold text-slate-900">Senarai Batch Menunggu Semakan</h2>
              <span class="ml-1 text-xs text-slate-500">{{ rows.length }} rekod</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="q"
                  placeholder="Carian reference / majikan..."
                  class="w-64 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  @keyup.enter="search"
                />
              </div>
              <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50" @click="search">Cari</button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Majikan</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Period</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Channel</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Rows</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Jumlah</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 text-slate-800">{{ row.referenceNo }}</td>
                <td class="px-4 py-2">
                  <p class="font-medium text-slate-800">{{ row.employer?.displayName || "-" }}</p>
                  <p class="text-xs text-slate-500">{{ row.employer?.payerCode || "-" }}</p>
                </td>
                <td class="px-4 py-2 text-slate-600">{{ fmtPeriod(row) }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.paymentChannel }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.rowCount }}</td>
                <td class="px-4 py-2 text-right font-semibold text-slate-900">{{ fmtCurrency(row.totalAmount) }}</td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link
                      :to="`/spg/payments/${row.id}`"
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Semak</span>
                    </router-link>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && rows.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">
                  <div class="inline-flex items-center gap-2">
                    <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                    Tiada batch pending payment.
                  </div>
                </td>
              </tr>
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
    </div>
  </AdminLayout>
</template>
