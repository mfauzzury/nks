<script setup lang="ts">
import { computed, ref } from "vue";

import AdminLayout from "@/layouts/AdminLayout.vue";

type Option = { label: string; value: string };
type PayerRow = { id: string; name: string; zakatType: string; amount: number };
type ChartDatum = { label: string; value: number; color?: string };

const years: Option[] = [
  { label: "All", value: "all" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
];

const negeriOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Selangor", value: "selangor" },
  { label: "Kuala Lumpur", value: "kuala-lumpur" },
  { label: "Johor", value: "johor" },
  { label: "Penang", value: "penang" },
];

const jenisPembayarOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Korporat", value: "corporate" },
  { label: "Individu", value: "individual" },
  { label: "SPG", value: "spg" },
];

const jenisZakatOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Zakat Pendapatan", value: "zakat-pendapatan" },
  { label: "Zakat Wang Simpanan", value: "zakat-wang-simpanan" },
  { label: "Zakat Perniagaan", value: "zakat-perniagaan" },
];

const kaedahBayaranOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Pindahan Wang Elektronik", value: "fpx" },
  { label: "Tunai", value: "cash" },
  { label: "Cek", value: "cheque" },
  { label: "E-Wallet", value: "ewallet" },
];

const selectedYear = ref("all");
const selectedNegeri = ref("all");
const selectedJenisPembayar = ref("all");
const selectedJenisZakat = ref("all");
const selectedKaedahBayaran = ref("all");

const totalPayers = 5723;
const totalAmount = 273_830_000;
const newPayers = 0;

const topPayers = ref<PayerRow[]>([
  { id: "391703H", name: "SKVE HOLDINGS SDN BHD", zakatType: "ZAKAT PENDAPATAN", amount: 66_192_114.63 },
  { id: "529600T", name: "FAT BOYS RECORD SDN BHD", zakatType: "ZAKAT PENDAPATAN", amount: 27_460_395.11 },
  { id: "638135M", name: "METRIX RESEARCH SDN. BHD.", zakatType: "ZAKAT PENDAPATAN", amount: 12_090_304.75 },
  { id: "GRP355WG", name: "KUMPULAN PERANGSANG TAHUN 2022", zakatType: "ZAKAT PENDAPATAN", amount: 10_525_421.54 },
  { id: "0189884W", name: "KP ASIA AUTO LOGISTICS SDN BHD", zakatType: "ZAKAT PENDAPATAN", amount: 6_318_533.37 },
  { id: "183059HWI", name: "DATAPREP HOLDINGS BHD", zakatType: "ZAKAT PENDAPATAN", amount: 6_318_533.37 },
  { id: "284377X", name: "WAN HUSIN & ASSOCIATES SDN BHD", zakatType: "ZAKAT PENDAPATAN", amount: 3_261_079.84 },
  { id: "319687-M", name: "TRISYSTEMS ENGINEERING SDN. BHD.", zakatType: "ZAKAT PENDAPATAN", amount: 2_190_233.53 },
  { id: "GRP439WG", name: "KUMPULAN NUEMERA (M) SDN BHD", zakatType: "ZAKAT PENDAPATAN", amount: 2_006_468.02 },
  { id: "1019421T", name: "SYNERGY MARINE (M) SDN. BHD.", zakatType: "ZAKAT PERNIAGAAN", amount: 1_136_000.08 },
]);

const genderData = ref<ChartDatum[]>([
  { label: "LELAKI", value: 2469, color: "#4c148c" },
  { label: "PEREMPUAN", value: 863, color: "#ca66d8" },
  { label: "TIADA MAKLUMAT", value: 4, color: "#b89add" },
]);

const paymentMethodData = ref<ChartDatum[]>([
  { label: "PINDAHAN WANG\nELEKTRONIK", value: 4712 },
  { label: "TUNAI", value: 921 },
  { label: "CEK", value: 82 },
  { label: "(Blank)", value: 67 },
  { label: "E-WALLET", value: 4 },
]);

const negeriData = ref<ChartDatum[]>([
  { label: "JOHOR", value: 2 },
  { label: "KUALA LUMPUR", value: 25 },
  { label: "PENANG", value: 1 },
  { label: "SELANGOR", value: 5691 },
  { label: "TIADA MAKLUMAT", value: 67 },
]);

const zakatTypeData = ref<ChartDatum[]>([
  { label: "ZAKAT WANG SIMPANAN", value: 2762 },
  { label: "ZAKAT PENDAPATAN", value: 2744 },
  { label: "ZAKAT PERNIAGAAN", value: 166 },
  { label: "(Blank)", value: 67 },
  { label: "ZAKAT FITRAH", value: 25 },
  { label: "ZAKAT EMAS", value: 13 },
  { label: "ZAKAT PADI", value: 9 },
]);

const genderTotal = computed(() => genderData.value.reduce((sum, item) => sum + item.value, 0));
const paymentMethodMax = computed(() => Math.max(...paymentMethodData.value.map((item) => item.value), 1));
const negeriMax = computed(() => Math.max(...negeriData.value.map((item) => item.value), 1));
const zakatTypeMax = computed(() => Math.max(...zakatTypeData.value.map((item) => item.value), 1));

const genderDonutStyle = computed(() => {
  let start = 0;
  const stops: string[] = [];

  genderData.value.forEach((item) => {
    const size = (item.value / genderTotal.value) * 100;
    const end = start + size;
    stops.push(`${item.color || "#4c148c"} ${start}% ${end}%`);
    start = end;
  });

  return {
    background: `conic-gradient(${stops.join(", ")})`,
  };
});

function pct(value: number) {
  if (!genderTotal.value) return "0.00";
  return ((value / genderTotal.value) * 100).toFixed(2);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace("M", "M");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 class="page-title">Main Dashboard</h1>
          <p class="mt-1 text-sm text-slate-500">Analitik pembayar zakat mengikut profil, kaedah bayaran, dan jenis zakat.</p>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-5">
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Tahun</span>
            <select v-model="selectedYear" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="item in years" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Negeri</span>
            <select v-model="selectedNegeri" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="item in negeriOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Jenis Pembayar</span>
            <select v-model="selectedJenisPembayar" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="item in jenisPembayarOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Jenis Zakat</span>
            <select v-model="selectedJenisZakat" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="item in jenisZakatOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Kaedah Bayaran</span>
            <select v-model="selectedKaedahBayaran" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="item in kaedahBayaranOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
        </div>
      </article>

      <div class="grid gap-3 sm:grid-cols-3">
        <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500">Jumlah Pembayar</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ formatNumber(totalPayers) }}</p>
        </article>
        <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500">Jumlah Bayaran (RM)</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ formatCurrencyCompact(totalAmount) }}</p>
        </article>
        <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500">Jumlah Pembayar Baru</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ formatNumber(newPayers) }}</p>
        </article>
      </div>

      <div class="grid gap-4 xl:grid-cols-12">
        <article class="rounded-lg border border-slate-200 bg-white shadow-sm xl:col-span-7">
          <header class="border-b border-slate-100 px-4 py-3">
            <h2 class="text-sm font-semibold text-slate-900">Senarai Pembayar Tertinggi</h2>
          </header>
          <div class="overflow-hidden">
            <table class="w-full table-fixed text-left text-sm">
              <colgroup>
                <col class="w-[17%]" />
                <col class="w-[43%]" />
                <col class="w-[20%]" />
                <col class="w-[20%]" />
              </colgroup>
              <thead class="sticky top-0 bg-slate-900 text-white">
                <tr>
                  <th class="px-4 py-2 font-semibold">No Pengenalan</th>
                  <th class="px-4 py-2 font-semibold">Nama Pembayar</th>
                  <th class="px-4 py-2 font-semibold">Jenis Zakat</th>
                  <th class="px-4 py-2 text-right font-semibold">Jumlah Bayaran (RM)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="payer in topPayers" :key="payer.id" class="hover:bg-slate-50">
                  <td class="px-4 py-2.5 font-medium text-slate-700"><span class="block truncate">{{ payer.id }}</span></td>
                  <td class="px-4 py-2.5 text-slate-800"><span class="block truncate">{{ payer.name }}</span></td>
                  <td class="px-4 py-2.5 text-slate-700"><span class="block truncate">{{ payer.zakatType }}</span></td>
                  <td class="px-4 py-2.5 text-right font-medium text-slate-800"><span class="block truncate">{{ formatCurrency(payer.amount) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-5">
          <h2 class="text-sm font-semibold text-slate-900">Jumlah Pembayar Ikut Jantina</h2>
          <div class="mt-3 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div class="space-y-2">
              <div v-for="item in genderData" :key="item.label" class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">{{ item.label }}</span>
                <span class="text-slate-500">{{ formatNumber(item.value) }} ({{ pct(item.value) }}%)</span>
              </div>
            </div>
            <div class="relative mx-auto h-48 w-48 rounded-full" :style="genderDonutStyle">
              <div class="absolute inset-[26%] rounded-full bg-white"></div>
            </div>
          </div>
        </article>
      </div>

      <div class="grid gap-4 xl:grid-cols-12">
        <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-7">
          <h2 class="text-sm font-semibold text-slate-900">Jumlah Pembayar Mengikut Negeri</h2>
          <div class="mt-3 grid grid-cols-5 items-end gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div v-for="item in negeriData" :key="item.label" class="flex flex-col items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">{{ formatNumber(item.value) }}</span>
              <div class="flex h-56 w-full max-w-[68px] items-end rounded bg-white p-1">
                <div class="w-full rounded bg-[var(--accent-600)]" :style="{ height: `${Math.max((item.value / negeriMax) * 100, 2)}%` }"></div>
              </div>
              <span class="text-center text-[11px] font-medium text-slate-600">{{ item.label }}</span>
            </div>
          </div>
        </article>

        <div class="space-y-4 xl:col-span-5">
          <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 class="text-sm font-semibold text-slate-900">Jumlah Pembayar Mengikut Kaedah Bayaran</h2>
            <div class="mt-3 grid grid-cols-5 items-end gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div v-for="item in paymentMethodData" :key="item.label" class="flex flex-col items-center gap-2">
                <span class="text-[11px] font-semibold text-slate-600">{{ formatNumber(item.value) }}</span>
                <div class="flex h-40 w-full max-w-[58px] items-end rounded bg-white p-1">
                  <div class="w-full rounded bg-[var(--accent-600)]" :style="{ height: `${Math.max((item.value / paymentMethodMax) * 100, 2)}%` }"></div>
                </div>
                <span class="whitespace-pre-line text-center text-[10px] font-medium text-slate-600">{{ item.label }}</span>
              </div>
            </div>
          </article>

          <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 class="text-sm font-semibold text-slate-900">Jumlah Pembayar Mengikut Jenis Zakat</h2>
            <div class="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div v-for="item in zakatTypeData" :key="item.label" class="grid grid-cols-[150px_1fr_auto] items-center gap-2">
                <span class="truncate text-[11px] font-medium text-slate-600">{{ item.label }}</span>
                <div class="h-5 rounded bg-white p-0.5">
                  <div class="h-full rounded bg-[var(--accent-600)]" :style="{ width: `${Math.max((item.value / zakatTypeMax) * 100, 2)}%` }"></div>
                </div>
                <span class="text-[11px] font-semibold text-slate-600">{{ formatNumber(item.value) }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
