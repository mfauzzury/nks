<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CalendarClock, Pause, Play, Search, XCircle, Zap } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import {
  listScheduledPayments,
  getScheduledPaymentDetail,
  pauseScheduledPayment,
  resumeScheduledPayment,
  cancelScheduledPayment,
  processDueScheduledPayments,
} from "@/api/cms";

type ScheduleRow = {
  id: number;
  scheduleRef: string;
  payerName: string;
  identityNo: string;
  zakatType: string;
  amountPerInstalment: string;
  totalInstalments: number;
  completedInstalments: number;
  frequency: string;
  cardBrand: string;
  cardLast4: string;
  source: string;
  status: string;
  nextChargeDate: string;
  createdAt: string;
};

type ScheduleDetail = {
  id: number;
  scheduleRef: string;
  payerName: string;
  identityNo: string;
  email: string | null;
  zakatType: string;
  financialYear: string;
  amountPerInstalment: string;
  totalInstalments: number;
  completedInstalments: number;
  frequency: string;
  cardBrand: string;
  cardLast4: string;
  source: string;
  collectionPoint: string | null;
  nextChargeDate: string;
  status: string;
  pausedReason: string | null;
  cancelledReason: string | null;
  createdAt: string;
  executions: Array<{
    id: number;
    instalmentNo: number;
    amount: string;
    chargedAt: string;
    status: string;
    failureReason: string | null;
    receiptNo: string | null;
    paidAt: string | null;
  }>;
};

const loading = ref(false);
const q = ref("");
const statusFilter = ref("");
const rows = ref<ScheduleRow[]>([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));

const showDetail = ref(false);
const detail = ref<ScheduleDetail | null>(null);
const detailLoading = ref(false);
const actionLoading = ref(false);

const showConfirmModal = ref(false);
const confirmAction = ref<"pause" | "resume" | "cancel" | null>(null);
const confirmReason = ref("");

const processingDue = ref(false);
const processDueResult = ref<{ processedCount: number; results: Array<{ scheduleRef: string; instalmentNo: number; receiptNo: string; status: string }> } | null>(null);

const statusTabs = [
  { value: "", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "paused", label: "Ditangguh" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatal" },
];

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

const frequencyLabels: Record<string, string> = {
  monthly: "Bulanan",
  quarterly: "Suku Tahunan",
  yearly: "Tahunan",
};

function fmtCurrency(value: string | number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(Number(value || 0));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function load() {
  loading.value = true;
  try {
    const res = await listScheduledPayments({ page: page.value, limit: limit.value, status: statusFilter.value || undefined, q: q.value.trim() || undefined });
    rows.value = res.data || [];
    total.value = res.meta?.total || 0;
  } finally {
    loading.value = false;
  }
}

async function search() {
  page.value = 1;
  await load();
}

function prevPage() { if (page.value > 1) { page.value--; load(); } }
function nextPage() { if (page.value < totalPages.value) { page.value++; load(); } }

function selectTab(value: string) {
  statusFilter.value = value;
  page.value = 1;
  load();
}

async function openDetail(row: ScheduleRow) {
  showDetail.value = true;
  detailLoading.value = true;
  try {
    const res = await getScheduledPaymentDetail(row.id);
    detail.value = res.data;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  showDetail.value = false;
  detail.value = null;
}

function openConfirm(action: "pause" | "resume" | "cancel") {
  confirmAction.value = action;
  confirmReason.value = "";
  showConfirmModal.value = true;
}

async function executeAction() {
  if (!detail.value || !confirmAction.value) return;
  actionLoading.value = true;
  try {
    if (confirmAction.value === "pause") {
      await pauseScheduledPayment(detail.value.id, confirmReason.value || undefined);
    } else if (confirmAction.value === "resume") {
      await resumeScheduledPayment(detail.value.id);
    } else if (confirmAction.value === "cancel") {
      await cancelScheduledPayment(detail.value.id, confirmReason.value || undefined);
    }
    showConfirmModal.value = false;
    // Refresh detail
    const res = await getScheduledPaymentDetail(detail.value.id);
    detail.value = res.data;
    await load();
  } finally {
    actionLoading.value = false;
  }
}

async function processDue() {
  processingDue.value = true;
  processDueResult.value = null;
  try {
    const res = await processDueScheduledPayments();
    processDueResult.value = res.data;
    await load();
  } finally {
    processingDue.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <CalendarClock class="h-5 w-5 text-blue-600" />
          <h1 class="page-title">Penjadualan Bayaran</h1>
        </div>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="processingDue"
          @click="processDue"
        >
          <Zap class="h-4 w-4" />
          {{ processingDue ? "Memproses..." : "Process Due" }}
        </button>
      </div>

      <!-- Process due result -->
      <div v-if="processDueResult" class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
        <p class="font-semibold text-blue-800">Diproses: {{ processDueResult.processedCount }} jadual</p>
        <div v-if="processDueResult.results.length > 0" class="mt-2 space-y-1">
          <p v-for="r in processDueResult.results" :key="r.scheduleRef" class="text-blue-700">
            {{ r.scheduleRef }} — Ansuran #{{ r.instalmentNo }} — {{ r.status }}
            <span v-if="r.receiptNo"> ({{ r.receiptNo }})</span>
          </p>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <!-- Status tabs -->
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-1">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                class="rounded-md px-3 py-1.5 text-xs font-semibold transition"
                :class="statusFilter === tab.value ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'"
                @click="selectTab(tab.value)"
              >
                {{ tab.label }}
              </button>
            </div>
            <form class="flex items-center gap-2" @submit.prevent="search">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="q"
                  class="rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="Cari nama / IC / ref..."
                />
              </div>
              <button type="submit" class="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium hover:bg-slate-200">Cari</button>
            </form>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-2">Ref</th>
                <th class="px-4 py-2">Pembayar</th>
                <th class="px-4 py-2">Jenis Zakat</th>
                <th class="px-4 py-2 text-right">Jumlah / Ansuran</th>
                <th class="px-4 py-2">Kekerapan</th>
                <th class="px-4 py-2">Progres</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2">Caj Seterusnya</th>
                <th class="px-4 py-2">Tarikh</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                @click="openDetail(row)"
              >
                <td class="px-4 py-2.5 font-mono text-xs">{{ row.scheduleRef }}</td>
                <td class="px-4 py-2.5">
                  <p class="font-medium text-slate-900">{{ row.payerName }}</p>
                  <p class="text-xs text-slate-400">{{ row.identityNo }}</p>
                </td>
                <td class="px-4 py-2.5 text-slate-600">{{ row.zakatType }}</td>
                <td class="px-4 py-2.5 text-right font-semibold">{{ fmtCurrency(row.amountPerInstalment) }}</td>
                <td class="px-4 py-2.5 text-slate-600">{{ frequencyLabels[row.frequency] || row.frequency }}</td>
                <td class="px-4 py-2.5">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-16 rounded-full bg-slate-200">
                      <div class="h-full rounded-full bg-blue-500" :style="{ width: `${(row.completedInstalments / row.totalInstalments) * 100}%` }"></div>
                    </div>
                    <span class="text-xs text-slate-500">{{ row.completedInstalments }}/{{ row.totalInstalments }}</span>
                  </div>
                </td>
                <td class="px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusColors[row.status] || 'bg-slate-100 text-slate-600'">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-xs text-slate-500">{{ row.status === 'active' ? fmtDate(row.nextChargeDate) : '—' }}</td>
                <td class="px-4 py-2.5 text-xs text-slate-400">{{ fmtDate(row.createdAt) }}</td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-slate-400">Tiada rekod ditemui.</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr><td colspan="9" class="px-4 py-8 text-center text-slate-400">Memuatkan...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
          <span>{{ total }} rekod</span>
          <div class="flex items-center gap-2">
            <button class="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40" :disabled="page <= 1" @click="prevPage">&laquo; Prev</button>
            <span>{{ page }} / {{ totalPages }}</span>
            <button class="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40" :disabled="page >= totalPages" @click="nextPage">Next &raquo;</button>
          </div>
        </div>
      </article>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16" @click.self="closeDetail">
        <div class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-bold text-slate-900">Butiran Jadual Bayaran</h3>
            <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100" @click="closeDetail">&times;</button>
          </div>

          <div v-if="detailLoading" class="p-8 text-center text-slate-400">Memuatkan...</div>

          <div v-else-if="detail" class="space-y-5 p-6">
            <!-- Info -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-slate-500">Ref:</span> <span class="ml-1 font-mono font-semibold">{{ detail.scheduleRef }}</span></div>
              <div><span class="text-slate-500">Status:</span> <span class="ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusColors[detail.status]">{{ detail.status }}</span></div>
              <div><span class="text-slate-500">Pembayar:</span> <span class="ml-1 font-semibold">{{ detail.payerName }}</span></div>
              <div><span class="text-slate-500">IC/SSM:</span> <span class="ml-1">{{ detail.identityNo }}</span></div>
              <div><span class="text-slate-500">Jenis Zakat:</span> <span class="ml-1">{{ detail.zakatType }}</span></div>
              <div><span class="text-slate-500">Tahun:</span> <span class="ml-1">{{ detail.financialYear }}</span></div>
              <div><span class="text-slate-500">Jumlah/Ansuran:</span> <span class="ml-1 font-semibold">{{ fmtCurrency(detail.amountPerInstalment) }}</span></div>
              <div><span class="text-slate-500">Kekerapan:</span> <span class="ml-1">{{ frequencyLabels[detail.frequency] }}</span></div>
              <div><span class="text-slate-500">Progres:</span> <span class="ml-1 font-semibold">{{ detail.completedInstalments }}/{{ detail.totalInstalments }}</span></div>
              <div><span class="text-slate-500">Kad:</span> <span class="ml-1">{{ detail.cardBrand }} ****{{ detail.cardLast4 }}</span></div>
              <div><span class="text-slate-500">Sumber:</span> <span class="ml-1">{{ detail.source }}</span></div>
              <div><span class="text-slate-500">Caj Seterusnya:</span> <span class="ml-1">{{ detail.status === 'active' ? fmtDate(detail.nextChargeDate) : '—' }}</span></div>
            </div>

            <div v-if="detail.pausedReason" class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
              <strong>Sebab tangguh:</strong> {{ detail.pausedReason }}
            </div>
            <div v-if="detail.cancelledReason" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <strong>Sebab batal:</strong> {{ detail.cancelledReason }}
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                v-if="detail.status === 'active'"
                class="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200"
                @click="openConfirm('pause')"
              >
                <Pause class="h-4 w-4" /> Tangguh
              </button>
              <button
                v-if="detail.status === 'paused'"
                class="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                @click="openConfirm('resume')"
              >
                <Play class="h-4 w-4" /> Sambung Semula
              </button>
              <button
                v-if="detail.status === 'active' || detail.status === 'paused'"
                class="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                @click="openConfirm('cancel')"
              >
                <XCircle class="h-4 w-4" /> Batalkan
              </button>
            </div>

            <!-- Executions table -->
            <div>
              <h4 class="mb-2 text-sm font-semibold text-slate-700">Sejarah Ansuran</h4>
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th class="px-3 py-2">#</th>
                    <th class="px-3 py-2 text-right">Jumlah</th>
                    <th class="px-3 py-2">Resit</th>
                    <th class="px-3 py-2">Tarikh</th>
                    <th class="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ex in detail.executions" :key="ex.id" class="border-b border-slate-50">
                    <td class="px-3 py-2">{{ ex.instalmentNo }}</td>
                    <td class="px-3 py-2 text-right font-semibold">{{ fmtCurrency(ex.amount) }}</td>
                    <td class="px-3 py-2 font-mono text-xs">{{ ex.receiptNo || '—' }}</td>
                    <td class="px-3 py-2 text-xs">{{ ex.paidAt ? fmtDateTime(ex.paidAt) : fmtDateTime(ex.chargedAt) }}</td>
                    <td class="px-3 py-2">
                      <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="ex.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                        {{ ex.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="detail.executions.length === 0">
                    <td colspan="5" class="px-3 py-4 text-center text-slate-400">Tiada rekod ansuran.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Action Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" @click.self="showConfirmModal = false">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900">
            {{ confirmAction === 'pause' ? 'Tangguhkan Jadual' : confirmAction === 'resume' ? 'Sambung Semula Jadual' : 'Batalkan Jadual' }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ confirmAction === 'resume' ? 'Jadual akan disambung semula dan caj seterusnya akan diproses mengikut tarikh.' : 'Sila nyatakan sebab (pilihan).' }}
          </p>
          <textarea
            v-if="confirmAction !== 'resume'"
            v-model="confirmReason"
            rows="3"
            class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Sebab (pilihan)..."
          ></textarea>
          <div class="mt-4 flex justify-end gap-2">
            <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" @click="showConfirmModal = false">Batal</button>
            <button
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :class="confirmAction === 'cancel' ? 'bg-red-600 hover:bg-red-700' : confirmAction === 'pause' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'"
              :disabled="actionLoading"
              @click="executeAction"
            >
              {{ actionLoading ? 'Memproses...' : 'Sahkan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
