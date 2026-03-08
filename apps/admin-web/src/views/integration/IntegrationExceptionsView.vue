<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { AlertTriangle, Filter, RefreshCw, Loader2 } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listExceptions, type ExceptionItem } from "@/api/integration";

const exceptions = ref<ExceptionItem[]>([]);
const loading = ref(true);
const total = ref(0);
const statusFilter = ref<"" | "unmatched" | "mismatch">("");
const limit = 50;
const offset = ref(0);

const statusOptions = [
  { value: "", label: "Semua status" },
  { value: "unmatched", label: "Unmatched" },
  { value: "mismatch", label: "Mismatch" },
];

const hasExceptions = computed(() => exceptions.value.length > 0);

async function fetchExceptions() {
  loading.value = true;
  try {
    const res = await listExceptions({
      limit,
      offset: offset.value,
      status: statusFilter.value || undefined,
    });
    exceptions.value = res.data ?? [];
    total.value = res.meta?.total ?? 0;
  } catch {
    exceptions.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getTypeLabel(matchStatus: string) {
  return matchStatus === "MISMATCH" ? "Mismatch" : "Unmatched";
}

function getTypeBadgeClass(matchStatus: string) {
  return matchStatus === "MISMATCH"
    ? "bg-amber-100 text-amber-800"
    : "bg-slate-100 text-slate-700";
}

onMounted(fetchExceptions);
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Exceptions</h1>
        <p class="mt-1 text-sm text-slate-600">
          Review exceptions and approve/reprocess transactions.
        </p>
      </div>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"
        >
          <h2
            class="flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <AlertTriangle class="h-4 w-4 text-amber-500" />
            Exception Queue
            <span
              v-if="total > 0"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {{ total }}
            </span>
          </h2>
          <div class="flex items-center gap-2">
            <select
              v-model="statusFilter"
              class="rounded-lg border border-slate-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              @change="fetchExceptions"
            >
              <option
                v-for="opt in statusOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              @click="fetchExceptions"
            >
              <Filter class="h-4 w-4" />
              Filter
            </button>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              :disabled="loading"
              @click="fetchExceptions"
            >
              <RefreshCw :class="['h-4 w-4', loading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Reference
                </th>
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Type
                </th>
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Payer / IC
                </th>
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Amount
                </th>
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Date
                </th>
                <th
                  class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Source / File
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="7" class="px-4 py-12 text-center">
                  <Loader2 class="mx-auto h-8 w-8 animate-spin text-slate-400" />
                  <p class="mt-2 text-sm text-slate-500">Memuatkan...</p>
                </td>
              </tr>
              <tr
                v-else-if="!hasExceptions"
                class="text-slate-500"
              >
                <td colspan="7" class="px-4 py-12 text-center text-sm">
                  Tiada pengecualian.
                </td>
              </tr>
              <tr
                v-for="ex in exceptions"
                :key="ex.id"
                class="hover:bg-slate-50/50"
              >
                <td class="px-4 py-2 font-mono text-xs">
                  {{ ex.sourceTxRef || "—" }}
                </td>
                <td class="px-4 py-2">
                  <span
                    :class="[
                      'inline-flex rounded px-2 py-0.5 text-xs font-medium',
                      getTypeBadgeClass(ex.matchStatus),
                    ]"
                  >
                    {{ getTypeLabel(ex.matchStatus) }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <div class="font-medium text-slate-900">
                    {{ ex.payerName || "—" }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ ex.payerIc || "—" }}
                  </div>
                </td>
                <td class="px-4 py-2 font-medium">
                  {{ formatAmount(ex.amount) }}
                </td>
                <td class="px-4 py-2">{{ ex.txDate }}</td>
                <td class="px-4 py-2">
                  <div class="text-slate-700">{{ ex.sourceName || ex.sourceCode || "—" }}</div>
                  <div class="text-xs text-slate-500">{{ ex.fileName || "—" }}</div>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      class="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Reject
                    </button>
                    <button
                      class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Reprocess
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
