<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { RefreshCw, Search, Play, Eye, Loader2 } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import {
  listReconciliationRuns,
  runReconciliation,
  type ReconciliationRun,
} from "@/api/integration";

const router = useRouter();
const runs = ref<ReconciliationRun[]>([]);
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const total = ref(0);
const runningFileId = ref<number | null>(null);

const filteredRuns = computed(() => runs.value);

async function fetchRuns() {
  loading.value = true;
  error.value = "";
  try {
    const res = await listReconciliationRuns({
      search: searchQuery.value || undefined,
      limit: 50,
    });
    runs.value = res.data ?? [];
    const meta = (res as { meta?: { total?: number } }).meta;
    total.value = meta?.total ?? runs.value.length;
  } catch (e) {
    runs.value = [];
    total.value = 0;
    error.value = e instanceof Error ? e.message : "Gagal memuatkan rekod";
    console.error("Failed to fetch reconciliation runs:", e);
  } finally {
    loading.value = false;
  }
}

async function handleRunReconciliation(fileId: number) {
  runningFileId.value = fileId;
  try {
    await runReconciliation(fileId);
    await fetchRuns();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reconciliation failed";
    alert(msg);
  } finally {
    runningFileId.value = null;
  }
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Belum dijalankan",
    COMPLETED: "Selesai",
  };
  return map[status] ?? status;
}

function canRunReconciliation(r: ReconciliationRun): boolean {
  return r.totalStaging > 0;
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
onMounted(fetchRuns);
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchRuns, 300);
});
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Reconciliation</h1>
        <p class="mt-1 text-sm text-slate-600">
          Perform reconciliation with internal NKS records. Match external transactions with internal records.
        </p>
      </div>

      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ error }}
      </div>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <RefreshCw class="h-4 w-4 text-blue-600" />
            Reconciliation Runs
          </h2>
          <div class="flex items-center gap-2">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Carian (nama fail / ID)..."
                class="w-56 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Run ID</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Fail</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarikh</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Matched</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Unmatched</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Variance</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="8" class="px-4 py-12 text-center text-sm text-slate-500">
                  <span class="inline-flex items-center gap-2">
                    <Loader2 class="h-5 w-5 animate-spin text-slate-400" />
                    Memuatkan...
                  </span>
                </td>
              </tr>
              <tr v-else-if="filteredRuns.length === 0">
                <td colspan="8" class="px-4 py-12 text-center">
                  <div class="inline-flex flex-col items-center gap-2 text-slate-600">
                    <p class="text-sm font-medium">Tiada rekod rekonsiliasi.</p>
                    <p class="max-w-sm text-xs text-slate-500">
                      Muat naik fail dalam <strong>File Upload</strong>, kemudian klik <strong>Process</strong> dalam <strong>Batch Processing</strong> terlebih dahulu.
                    </p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="r in filteredRuns"
                :key="r.runId"
                class="cursor-pointer hover:bg-slate-50"
                @click="router.push(`/integration/3rd-party/reconciliation/${r.fileId}`)"
              >
                <td class="px-4 py-2 font-mono text-slate-700">{{ r.runId }}</td>
                <td class="px-4 py-2 text-slate-700">{{ r.fileName }}</td>
                <td class="px-4 py-2 text-slate-600">{{ formatDate(r.date) }}</td>
                <td class="px-4 py-2">
                  <span class="font-medium text-emerald-600">{{ r.matched }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="font-medium text-amber-600">{{ r.unmatched }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="font-medium text-red-600">{{ r.mismatch }}</span>
                </td>
                <td class="px-4 py-2">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-100 text-emerald-700': r.status === 'COMPLETED',
                      'bg-slate-100 text-slate-600': r.status === 'PENDING',
                    }"
                  >
                    {{ statusLabel(r.status) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right" @click.stop>
                  <div class="flex items-center justify-end gap-1">
                    <router-link
                      :to="`/integration/3rd-party/reconciliation/${r.fileId}`"
                      class="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye class="inline h-3.5 w-3.5" /> Lihat
                    </router-link>
                    <button
                      v-if="canRunReconciliation(r)"
                      type="button"
                      class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                      :disabled="runningFileId === r.fileId"
                      @click="handleRunReconciliation(r.fileId)"
                    >
                      <Loader2 v-if="runningFileId === r.fileId" class="h-3.5 w-3.5 animate-spin" />
                      <Play v-else class="h-3.5 w-3.5" />
                      {{ r.status === "PENDING" ? "Jalankan" : "Jalankan semula" }}
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
