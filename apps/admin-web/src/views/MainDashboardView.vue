<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  UserPlus,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Briefcase,
  Loader2,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { fetchMainDashboard, type MainDashboardData } from "@/api/cms";

const loading = ref(true);
const selectedYear = ref("all");
const dashboard = ref<MainDashboardData | null>(null);

const years = [
  { label: "Semua Tahun", value: "all" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
];

async function loadDashboard() {
  loading.value = true;
  try {
    const res = await fetchMainDashboard(selectedYear.value);
    dashboard.value = res.data;
  } catch {
    // keep previous data on error
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
watch(selectedYear, loadDashboard);

const s = computed(() => dashboard.value?.summary);

const genderTotal = computed(() =>
  (dashboard.value?.genderDistribution || []).reduce((sum, item) => sum + item.value, 0),
);

const genderColors: Record<string, string> = {
  LELAKI: "#6366f1",
  PEREMPUAN: "#ec4899",
  L: "#6366f1",
  P: "#ec4899",
};

const genderDonutStyle = computed(() => {
  if (!dashboard.value?.genderDistribution.length) return {};
  let start = 0;
  const stops: string[] = [];
  for (const item of dashboard.value.genderDistribution) {
    const size = genderTotal.value ? (item.value / genderTotal.value) * 100 : 0;
    const end = start + size;
    const color = genderColors[item.label.toUpperCase()] || "#a5b4fc";
    stops.push(`${color} ${start}% ${end}%`);
    start = end;
  }
  return { background: `conic-gradient(${stops.join(", ")})` };
});

const zakatTypeMax = computed(() =>
  Math.max(...(dashboard.value?.zakatTypeDistribution || []).map((i) => i.value), 1),
);

const paymentMethodMax = computed(() =>
  Math.max(...(dashboard.value?.paymentMethodDistribution || []).map((i) => i.value), 1),
);

const monthlyMax = computed(() =>
  Math.max(...(dashboard.value?.monthlyTrend || []).map((i) => i.amount), 1),
);

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function pct(value: number) {
  if (!genderTotal.value) return "0.0";
  return ((value / genderTotal.value) * 100).toFixed(1);
}

const barColors = [
  "from-indigo-500 to-indigo-600",
  "from-violet-500 to-violet-600",
  "from-fuchsia-500 to-fuchsia-600",
  "from-pink-500 to-pink-600",
  "from-rose-500 to-rose-600",
  "from-orange-500 to-orange-600",
  "from-amber-500 to-amber-600",
];

const todayString = new Intl.DateTimeFormat("ms-MY", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-5">
      <!-- Header -->
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="page-title">Dashboard Utama</h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ todayString }} &mdash; Analitik pembayar zakat secara keseluruhan.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedYear"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-[var(--accent-300)]"
          >
            <option v-for="item in years" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && !dashboard" class="flex items-center justify-center py-32">
        <Loader2 class="h-8 w-8 animate-spin text-[var(--accent-600)]" />
      </div>

      <template v-if="dashboard">
        <!-- ── Summary Cards ── -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-indigo-50 transition-transform group-hover:scale-150" />
            <div class="relative">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jumlah Pembayar</p>
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Users class="h-4 w-4" />
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">{{ formatNumber(s!.totalPayers) }}</p>
              <div class="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span class="flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-indigo-400" />
                  Individu: {{ formatNumber(s!.totalIndividual) }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-violet-400" />
                  Korporat: {{ formatNumber(s!.totalCorporate) }}
                </span>
              </div>
            </div>
          </article>

          <article class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-emerald-50 transition-transform group-hover:scale-150" />
            <div class="relative">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jumlah Bayaran</p>
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Wallet class="h-4 w-4" />
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">
                <span class="text-lg font-medium text-slate-400">RM</span>
                {{ formatCompact(s!.totalAmount) }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                {{ formatNumber(s!.totalTransactions) }} transaksi &middot;
                {{ formatNumber(s!.uniquePayers) }} pembayar unik
              </p>
            </div>
          </article>

          <article class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-amber-50 transition-transform group-hover:scale-150" />
            <div class="relative">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Pembayar Baru (Bulan Ini)</p>
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <UserPlus class="h-4 w-4" />
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">{{ formatNumber(s!.newPayersThisMonth) }}</p>
              <p class="mt-2 text-xs text-slate-500">Pendaftaran bulan semasa</p>
            </div>
          </article>

          <article class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-violet-50 transition-transform group-hover:scale-150" />
            <div class="relative">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Majikan SPG</p>
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Briefcase class="h-4 w-4" />
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">{{ formatNumber(s!.totalSpgEmployer) }}</p>
              <p class="mt-2 text-xs text-slate-500">Syarikat aktif dalam SPG</p>
            </div>
          </article>
        </div>

        <!-- ── Monthly Trend ── -->
        <article v-if="dashboard.monthlyTrend.length > 0" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <TrendingUp class="h-4 w-4 text-[var(--accent-600)]" />
            <h2 class="text-sm font-semibold text-slate-900">Trend Sumbangan Bulanan</h2>
          </div>
          <div class="flex items-end gap-2 overflow-x-auto pb-1" style="min-height: 200px">
            <div
              v-for="(item, i) in dashboard.monthlyTrend"
              :key="item.month"
              class="group flex min-w-[48px] flex-1 flex-col items-center gap-2"
            >
              <div class="relative">
                <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  RM {{ formatCurrency(item.amount) }}
                </span>
                <span class="text-[10px] font-semibold text-slate-500">{{ formatCompact(item.amount) }}</span>
              </div>
              <div class="flex w-full max-w-[40px] items-end" style="height: 160px">
                <div
                  class="w-full rounded-t-md bg-gradient-to-t transition-all duration-500"
                  :class="barColors[i % barColors.length]"
                  :style="{ height: `${Math.max((item.amount / monthlyMax) * 100, 3)}%` }"
                />
              </div>
              <span class="text-[10px] font-medium text-slate-500">{{ item.month }}</span>
            </div>
          </div>
        </article>

        <!-- ── Top Payers + Gender ── -->
        <div class="grid gap-4 xl:grid-cols-12">
          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-7">
            <header class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div class="flex items-center gap-2">
                <BarChart3 class="h-4 w-4 text-[var(--accent-600)]" />
                <h2 class="text-sm font-semibold text-slate-900">Senarai Pembayar Tertinggi</h2>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">TOP 10</span>
            </header>
            <div class="overflow-x-auto">
              <table class="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col class="w-[5%]" />
                  <col class="w-[20%]" />
                  <col class="w-[40%]" />
                  <col class="w-[13%]" />
                  <col class="w-[22%]" />
                </colgroup>
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-2.5 font-semibold">#</th>
                    <th class="px-4 py-2.5 font-semibold">No Pengenalan</th>
                    <th class="px-4 py-2.5 font-semibold">Nama Pembayar</th>
                    <th class="px-4 py-2.5 font-semibold">Jenis</th>
                    <th class="px-4 py-2.5 text-right font-semibold">Jumlah (RM)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(payer, idx) in dashboard.topPayers"
                    :key="payer.identityNo"
                    class="transition-colors hover:bg-slate-50/80"
                  >
                    <td class="px-4 py-2.5">
                      <span
                        class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                        :class="idx < 3 ? 'bg-[var(--accent-100)] text-[var(--accent-700)]' : 'bg-slate-100 text-slate-500'"
                      >{{ idx + 1 }}</span>
                    </td>
                    <td class="px-4 py-2.5 font-medium text-slate-600"><span class="block truncate">{{ payer.identityNo }}</span></td>
                    <td class="px-4 py-2.5 text-slate-800"><span class="block truncate font-medium">{{ payer.name }}</span></td>
                    <td class="px-4 py-2.5">
                      <span
                        class="inline-block truncate rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        :class="payer.payerType === 'korporat' ? 'bg-violet-100 text-violet-700' : payer.payerType === 'majikan_spg' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'"
                      >{{ payer.payerType === 'korporat' ? 'Korporat' : payer.payerType === 'majikan_spg' ? 'SPG' : 'Individu' }}</span>
                    </td>
                    <td class="px-4 py-2.5 text-right font-semibold text-slate-800">{{ formatCurrency(payer.amount) }}</td>
                  </tr>
                  <tr v-if="!dashboard.topPayers.length">
                    <td colspan="5" class="py-8 text-center text-sm text-slate-400">Tiada data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-5">
            <div class="mb-4 flex items-center gap-2">
              <PieChartIcon class="h-4 w-4 text-[var(--accent-600)]" />
              <h2 class="text-sm font-semibold text-slate-900">Pembayar Mengikut Jantina</h2>
            </div>
            <div class="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
              <div class="space-y-3">
                <div
                  v-for="item in dashboard.genderDistribution"
                  :key="item.label"
                  class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: genderColors[item.label.toUpperCase()] || '#a5b4fc' }" />
                    <span class="text-sm font-medium text-slate-700">{{ item.label }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-bold text-slate-800">{{ formatNumber(item.value) }}</span>
                    <span class="ml-1.5 text-xs text-slate-400">({{ pct(item.value) }}%)</span>
                  </div>
                </div>
                <div v-if="!dashboard.genderDistribution.length" class="py-4 text-center text-sm text-slate-400">Tiada data</div>
              </div>
              <div
                v-if="dashboard.genderDistribution.length"
                class="relative mx-auto h-44 w-44 rounded-full shadow-inner"
                :style="genderDonutStyle"
              >
                <div class="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white shadow-sm">
                  <p class="text-lg font-bold text-slate-800">{{ formatNumber(genderTotal) }}</p>
                  <p class="text-[10px] text-slate-400">JUMLAH</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- ── Zakat Types + Payment Methods ── -->
        <div class="grid gap-4 xl:grid-cols-12">
          <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-7">
            <div class="mb-4 flex items-center gap-2">
              <Activity class="h-4 w-4 text-[var(--accent-600)]" />
              <h2 class="text-sm font-semibold text-slate-900">Pembayar Mengikut Jenis Zakat</h2>
            </div>
            <div class="space-y-2.5">
              <div
                v-for="(item, i) in dashboard.zakatTypeDistribution"
                :key="item.label"
                class="group grid grid-cols-[180px_1fr_auto] items-center gap-3"
              >
                <span class="truncate text-xs font-medium text-slate-600">{{ item.label }}</span>
                <div class="h-7 overflow-hidden rounded-lg bg-slate-100 p-1">
                  <div
                    class="flex h-full items-center rounded-md bg-gradient-to-r px-2 transition-all duration-700"
                    :class="barColors[i % barColors.length]"
                    :style="{ width: `${Math.max((item.value / zakatTypeMax) * 100, 3)}%` }"
                  >
                    <span v-if="(item.value / zakatTypeMax) * 100 > 15" class="text-[10px] font-semibold text-white">{{ formatNumber(item.value) }}</span>
                  </div>
                </div>
                <span class="w-14 text-right text-xs font-bold text-slate-700">{{ formatNumber(item.value) }}</span>
              </div>
              <div v-if="!dashboard.zakatTypeDistribution.length" class="py-4 text-center text-sm text-slate-400">Tiada data</div>
            </div>
          </article>

          <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-5">
            <div class="mb-4 flex items-center gap-2">
              <CreditCard class="h-4 w-4 text-[var(--accent-600)]" />
              <h2 class="text-sm font-semibold text-slate-900">Kaedah Bayaran</h2>
            </div>
            <div class="space-y-2.5">
              <div v-for="(item, i) in dashboard.paymentMethodDistribution" :key="item.label" class="group">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-600">{{ item.label }}</span>
                  <span class="text-xs font-bold text-slate-700">{{ formatNumber(item.value) }}</span>
                </div>
                <div class="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-gradient-to-r transition-all duration-700"
                    :class="barColors[i % barColors.length]"
                    :style="{ width: `${Math.max((item.value / paymentMethodMax) * 100, 2)}%` }"
                  />
                </div>
              </div>
              <div v-if="!dashboard.paymentMethodDistribution.length" class="py-4 text-center text-sm text-slate-400">Tiada data</div>
            </div>
          </article>
        </div>

        <!-- ── Recent Payers ── -->
        <article v-if="dashboard.recentPayers.length" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <UserPlus class="h-4 w-4 text-[var(--accent-600)]" />
            <h2 class="text-sm font-semibold text-slate-900">Pembayar Terkini Didaftarkan</h2>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <router-link
              v-for="p in dashboard.recentPayers"
              :key="p.id"
              :to="`/payers/${p.id}`"
              class="group flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-all hover:border-[var(--accent-200)] hover:bg-[var(--accent-50)]"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-100)] text-xs font-bold text-[var(--accent-700)]">
                {{ p.displayName.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-slate-800 group-hover:text-[var(--accent-700)]">{{ p.displayName }}</p>
                <p class="truncate text-[10px] text-slate-400">{{ p.payerCode }}</p>
              </div>
            </router-link>
          </div>
        </article>
      </template>
    </div>
  </AdminLayout>
</template>
