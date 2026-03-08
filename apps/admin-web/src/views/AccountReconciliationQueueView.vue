<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Search, Rows3, ArrowRightCircle } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getGuestPaymentsByIdentity, listIndividualDirectory, listPayers } from "@/api/cms";
import type { IndividualDirectoryRow } from "@/types";

type QueueRow = {
  identityNo: string;
  payerCode: string | null;
  directContributionCount: number;
  lastContributionAt: string | null;
  registrationState: "registered" | "unregistered";
  status: "ready_to_review" | "needs_registration";
};

const DEMO_IDENTITIES = ["900105101900", "900206101901", "900909104200"];
const HARD_DEMO_ROWS: QueueRow[] = [
  {
    identityNo: "900105101900",
    payerCode: "PYR-IND-LEG-900105-A",
    directContributionCount: 3,
    lastContributionAt: "2026-03-07T10:30:00.000Z",
    registrationState: "registered",
    status: "ready_to_review",
  },
  {
    identityNo: "900206101901",
    payerCode: "PYR-IND-LEG-900206-A",
    directContributionCount: 2,
    lastContributionAt: "2026-03-06T08:15:00.000Z",
    registrationState: "registered",
    status: "ready_to_review",
  },
  {
    identityNo: "900909104200",
    payerCode: null,
    directContributionCount: 1,
    lastContributionAt: "2026-03-05T12:00:00.000Z",
    registrationState: "unregistered",
    status: "needs_registration",
  },
];

const loading = ref(false);
const q = ref("");
const rows = ref<QueueRow[]>([]);

const queueRows = computed(() => {
  const term = q.value.trim().toLowerCase();
  const filtered = !term
    ? rows.value
    : rows.value.filter((row) =>
      row.identityNo.toLowerCase().includes(term) ||
      (row.payerCode || "").toLowerCase().includes(term),
    );

  return filtered
    .slice()
    .sort((a, b) => {
      if (a.status === b.status) return (b.lastContributionAt || "").localeCompare(a.lastContributionAt || "");
      return a.status === "ready_to_review" ? -1 : 1;
    });
});

const summary = computed(() => ({
  total: queueRows.value.length,
  ready: queueRows.value.filter((r) => r.status === "ready_to_review").length,
  pendingRegistration: queueRows.value.filter((r) => r.status === "needs_registration").length,
}));

async function buildDemoRow(identity: string): Promise<QueueRow | null> {
  try {
    const [paymentsRes, payerRes] = await Promise.all([
      getGuestPaymentsByIdentity(identity),
      listPayers({ q: identity, type: "individu", page: 1, limit: 20 }),
    ]);

    const txCount = paymentsRes.data.totalTransactions || 0;
    if (txCount <= 0) return null;

    const payers = payerRes.data || [];
    const active = payers.find((p) => p.status === "active") || payers[0] || null;

    return {
      identityNo: paymentsRes.data.identityNo || identity,
      payerCode: active?.payerCode || null,
      directContributionCount: txCount,
      lastContributionAt: paymentsRes.data.latestPaidAt || null,
      registrationState: active ? "registered" : "unregistered",
      status: active ? "ready_to_review" : "needs_registration",
    };
  } catch {
    return null;
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await listIndividualDirectory({
      category: "all",
      page: 1,
      limit: 500,
    });

    const baseRows = (res.data || [])
      .filter((row: IndividualDirectoryRow) => row.hasDirectContribution && row.directContributionCount > 0)
      .map<QueueRow>((row) => ({
        identityNo: row.identityNo,
        payerCode: row.payerCode,
        directContributionCount: row.directContributionCount,
        lastContributionAt: row.lastContributionAt,
        registrationState: row.registrationState,
        status: row.registrationState === "registered" ? "ready_to_review" : "needs_registration",
      }));

    const demoRows = await Promise.all(DEMO_IDENTITIES.map((identity) => buildDemoRow(identity)));
    const merged = new Map<string, QueueRow>();
    for (const row of baseRows) {
      merged.set(`${row.identityNo}-${row.payerCode || "none"}`, row);
    }
    for (const row of demoRows.filter((x): x is QueueRow => Boolean(x))) {
      merged.set(`${row.identityNo}-${row.payerCode || "none"}`, row);
    }

    const finalRows = Array.from(merged.values());
    if (finalRows.length === 0) {
      rows.value = HARD_DEMO_ROWS;
      return;
    }
    rows.value = finalRows;
  } catch {
    rows.value = HARD_DEMO_ROWS;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="text-xs text-slate-500">
            <span>Account Merge</span>
            <span class="mx-1">/</span>
            <span>Queue</span>
          </p>
          <h1 class="page-title">Reconciliation Queue</h1>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-2">
          <label class="grid gap-1 text-sm text-slate-700">
            Search Identity / Payer Code
            <div class="relative">
              <Search class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                v-model="q"
                class="w-80 rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm"
                placeholder="Contoh: 900105101900"
              />
            </div>
          </label>
          <button class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" :disabled="loading" @click="load">Refresh</button>
        </div>
        <div class="mt-2 text-xs text-slate-500">
          Demo identities included: <span class="font-medium text-slate-700">900105101900, 900206101901, 900909104200</span>
        </div>
        <div class="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
          <p class="rounded-md bg-slate-50 px-2.5 py-1.5 text-slate-600">Total Queue: <span class="font-semibold text-slate-800">{{ summary.total }}</span></p>
          <p class="rounded-md bg-emerald-50 px-2.5 py-1.5 text-emerald-700">Ready to Review: <span class="font-semibold">{{ summary.ready }}</span></p>
          <p class="rounded-md bg-amber-50 px-2.5 py-1.5 text-amber-700">Need Registration: <span class="font-semibold">{{ summary.pendingRegistration }}</span></p>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <Rows3 class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Candidate Transaction Queue</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Identity</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Payer Code</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Direct Txn</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Last Contribution</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Registration</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in queueRows" :key="`${row.identityNo}-${row.payerCode || 'none'}`">
                <td class="px-4 py-2 font-medium text-slate-800">{{ row.identityNo }}</td>
                <td class="px-4 py-2 text-slate-700">{{ row.payerCode || "-" }}</td>
                <td class="px-4 py-2 text-slate-700">{{ row.directContributionCount }}</td>
                <td class="px-4 py-2 text-slate-700">{{ row.lastContributionAt ? new Date(row.lastContributionAt).toLocaleString("ms-MY") : "-" }}</td>
                <td class="px-4 py-2">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="row.registrationState === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                    {{ row.registrationState }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="row.status === 'ready_to_review' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right">
                  <router-link
                    v-if="row.registrationState === 'registered'"
                    :to="`/reconciliation/account-merge?identityNo=${encodeURIComponent(row.identityNo)}`"
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    <ArrowRightCircle class="h-3.5 w-3.5" />
                    Review
                  </router-link>
                  <span v-else class="text-xs text-slate-400">Register first</span>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && queueRows.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">Tiada queue item.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
