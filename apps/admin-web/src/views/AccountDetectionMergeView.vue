<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowRightLeft, Search, UserCheck, Wallet } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { executeMerge, getGuestPaymentsByIdentity, listPayers } from "@/api/cms";
import type { PayerProfile } from "@/types";

type LegacyPaymentResult = {
  identityNo: string;
  totalTransactions: number;
  totalAmount: number;
  latestPaidAt: string | null;
  transactions: Array<{
    id: number;
    receiptNo: string;
    guestName: string;
    identityNo: string;
    amount: string;
    paymentMethod: string;
    status: string;
    paidAt: string;
  }>;
};

function normalizeIdentity(input: string) {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function dashedMykad(input: string) {
  const normalized = normalizeIdentity(input);
  if (!/^\d{12}$/.test(normalized)) return normalized;
  return `${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8)}`;
}

function fmtCurrency(value: number | string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);
}

const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const message = ref("");
const identityQuery = ref("900105101900");
const route = useRoute();
const rows = ref<PayerProfile[]>([]);
const legacy = ref<LegacyPaymentResult | null>(null);
const selectedMergedIds = ref<number[]>([]);
const paymentDetailOpenRows = ref<number[]>([]);

const normalizedQuery = computed(() => normalizeIdentity(identityQuery.value));
const matchedRows = computed(() => {
  const key = normalizedQuery.value;
  if (!key) return [];
  return rows.value.filter((row) => {
    const profileIdentity = normalizeIdentity(row.identityNo || "");
    const individualIdentity = normalizeIdentity(row.individual?.mykadOrPassport || "");
    return profileIdentity === key || individualIdentity === key;
  });
});
const activeRows = computed(() => matchedRows.value.filter((row) => row.status === "active"));
const inactiveRows = computed(() => matchedRows.value.filter((row) => row.status === "inactive"));
const mergedRows = computed(() => matchedRows.value.filter((row) => row.status === "merged"));
const masterCandidate = computed(() => {
  const key = normalizedQuery.value;
  return (
    activeRows.value.find((row) => normalizeIdentity(row.individual?.mykadOrPassport || "") === key) ||
    activeRows.value[0] ||
    null
  );
});

async function load() {
  const identity = normalizedQuery.value;
  if (!identity) {
    error.value = "Sila masukkan IC/Passport dahulu.";
    return;
  }
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    const [payersExact, payersDashed, legacyRes] = await Promise.all([
      listPayers({ q: identity, type: "individu", page: 1, limit: 100 }),
      listPayers({ q: dashedMykad(identity), type: "individu", page: 1, limit: 100 }),
      getGuestPaymentsByIdentity(identity),
    ]);
    const mergedMap = new Map<number, PayerProfile>();
    for (const row of [...(payersExact.data || []), ...(payersDashed.data || [])]) {
      mergedMap.set(row.id, row);
    }
    rows.value = Array.from(mergedMap.values());
    legacy.value = legacyRes.data || null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal mendapatkan data carian";
  } finally {
    loading.value = false;
  }
}

function canSelectForMerge(row: PayerProfile) {
  if (!masterCandidate.value) return false;
  if (row.id === masterCandidate.value.id) return false;
  if (row.status === "merged") return false;
  return true;
}

function toggleSelected(rowId: number) {
  if (selectedMergedIds.value.includes(rowId)) {
    selectedMergedIds.value = selectedMergedIds.value.filter((id) => id !== rowId);
    return;
  }
  selectedMergedIds.value = [...selectedMergedIds.value, rowId];
}

function togglePaymentDetail(rowId: number) {
  if (paymentDetailOpenRows.value.includes(rowId)) {
    paymentDetailOpenRows.value = paymentDetailOpenRows.value.filter((id) => id !== rowId);
    return;
  }
  paymentDetailOpenRows.value = [...paymentDetailOpenRows.value, rowId];
}

async function submitMerge() {
  const master = masterCandidate.value?.id ?? NaN;
  if (!Number.isFinite(master)) {
    error.value = "Tiada akaun active dijumpai untuk dijadikan Master.";
    return;
  }
  const mergeTargets = selectedMergedIds.value.filter((id) => id !== master);
  if (mergeTargets.length === 0) {
    error.value = "Sila tick sekurang-kurangnya satu akaun untuk digabung.";
    return;
  }

  submitting.value = true;
  error.value = "";
  message.value = "";
  try {
    let successCount = 0;
    for (const mergedId of mergeTargets) {
      await executeMerge({
        masterPayerId: master,
        mergedPayerId: mergedId,
        conflictResolution: {
          source: "account_detection_merge_page",
          identityNo: normalizedQuery.value,
        },
      });
      successCount += 1;
    }
    message.value = `Merge berjaya untuk ${successCount} akaun. Master=${master}`;
    selectedMergedIds.value = [];
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Merge gagal";
  } finally {
    submitting.value = false;
  }
}

onMounted(load);

watch(
  () => route.query.identityNo,
  (val) => {
    const fromQuery = String(val || "").trim();
    if (!fromQuery) return;
    identityQuery.value = fromQuery;
    load();
  },
);

onMounted(() => {
  const fromQuery = String(route.query.identityNo || "").trim();
  if (!fromQuery) return;
  identityQuery.value = fromQuery;
});
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="text-xs text-slate-500">
            <router-link to="/reconciliation/account-merge/queue" class="hover:underline">Account Merge</router-link>
            <span class="mx-1">/</span>
            <span>Detection &amp; Merge</span>
          </p>
          <h1 class="page-title">Account Detection & Merge</h1>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-2">
          <label class="grid gap-1 text-sm text-slate-700">
            IC / Passport
            <input
              v-model="identityQuery"
              class="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Contoh: 900105101900"
              @keyup.enter="load"
            />
          </label>
          <button class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" :disabled="loading" @click="load">
            <Search class="h-4 w-4" />
            Cari
          </button>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          Tip demo: guna IC <span class="font-medium text-slate-700">900105101900</span> (seeded pre-registration payment).
        </p>
      </article>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</div>
      <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ message }}</div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <Wallet class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Legacy/Pre-Registration Payment Summary</h2>
        </div>
        <div class="grid gap-3 px-4 py-3 md:grid-cols-4">
          <div class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs text-slate-500">Normalized IC</p>
            <p class="mt-1 font-semibold text-slate-900">{{ legacy?.identityNo || normalizedQuery || "-" }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs text-slate-500">Total Transactions</p>
            <p class="mt-1 font-semibold text-slate-900">{{ legacy?.totalTransactions ?? 0 }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs text-slate-500">Total Amount</p>
            <p class="mt-1 font-semibold text-slate-900">{{ fmtCurrency(legacy?.totalAmount ?? 0) }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs text-slate-500">Latest Paid At</p>
            <p class="mt-1 font-semibold text-slate-900">{{ legacy?.latestPaidAt ? new Date(legacy.latestPaidAt).toLocaleString("ms-MY") : "-" }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <UserCheck class="h-4 w-4 text-violet-600" />
          <h2 class="text-sm font-semibold text-slate-900">Candidate Accounts (By Identity)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Merge</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Payer ID</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Payer Code</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Identity</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="row in matchedRows" :key="row.id">
                <tr>
                  <td class="px-4 py-2">
                    <input
                      type="checkbox"
                      :checked="selectedMergedIds.includes(row.id)"
                      :disabled="!canSelectForMerge(row) || submitting"
                      @change="toggleSelected(row.id)"
                    />
                  </td>
                <td class="px-4 py-2">{{ row.id }}</td>
                <td class="px-4 py-2">{{ row.payerCode }}</td>
                <td class="px-4 py-2">{{ row.individual?.mykadOrPassport || row.identityNo || "-" }}</td>
                <td class="px-4 py-2">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : row.status === 'merged' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex justify-end gap-1.5">
                    <button
                      v-if="masterCandidate && row.id === masterCandidate.id"
                      class="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                      disabled
                    >
                      Master (Auto)
                    </button>
                    <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" @click="togglePaymentDetail(row.id)">
                      {{ paymentDetailOpenRows.includes(row.id) ? "Hide Payment" : "View Payment" }}
                    </button>
                  </div>
                </td>
                </tr>
                <tr v-if="paymentDetailOpenRows.includes(row.id)">
                  <td colspan="6" class="bg-slate-50 px-4 py-3">
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Detail (Identity-based)</p>
                    <div v-if="!legacy || legacy.transactions.length === 0" class="text-xs text-slate-500">Tiada rekod bayaran.</div>
                    <div v-else class="overflow-x-auto">
                      <table class="w-full text-xs">
                        <thead>
                          <tr class="border-b border-slate-200 text-left">
                            <th class="px-2 py-1 text-slate-500">Receipt</th>
                            <th class="px-2 py-1 text-slate-500">Amount</th>
                            <th class="px-2 py-1 text-slate-500">Method</th>
                            <th class="px-2 py-1 text-slate-500">Paid At</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="tx in legacy.transactions" :key="tx.id" class="border-b border-slate-100">
                            <td class="px-2 py-1 text-slate-700">{{ tx.receiptNo }}</td>
                            <td class="px-2 py-1 text-slate-700">{{ fmtCurrency(tx.amount) }}</td>
                            <td class="px-2 py-1 text-slate-700">{{ tx.paymentMethod }}</td>
                            <td class="px-2 py-1 text-slate-700">{{ new Date(tx.paidAt).toLocaleString("ms-MY") }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="loading">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && matchedRows.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Tiada padanan berdasarkan IC ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grid gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 md:grid-cols-2">
          <p>Active candidates: <span class="font-medium text-slate-700">{{ activeRows.length }}</span></p>
          <p>Inactive/Merged candidates: <span class="font-medium text-slate-700">{{ inactiveRows.length + mergedRows.length }}</span></p>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <ArrowRightLeft class="h-4 w-4 text-emerald-600" />
          <h2 class="text-sm font-semibold text-slate-900">Execute Merge (Tickbox)</h2>
        </div>
        <div class="grid gap-2 md:grid-cols-2">
          <label class="grid gap-1 text-sm text-slate-700">
            Master Payer (Auto)
            <input
              :value="masterCandidate ? `${masterCandidate.id} - ${masterCandidate.displayName}` : 'Tiada akaun active dijumpai'"
              class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              readonly
            />
          </label>
          <div class="flex items-end">
            <button class="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting" @click="submitMerge">
              {{ submitting ? "Processing..." : "Merge Selected" }}
            </button>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          Master dipilih automatik daripada akaun `active` untuk IC carian ini. Tick akaun sasaran, kemudian tekan `Merge Selected`.
        </p>
      </article>
    </div>
  </AdminLayout>
</template>
