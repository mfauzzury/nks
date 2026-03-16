<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CircleDot,
  CreditCard,
  Landmark,
  Printer,
  QrCode,
  ReceiptText,
  Search,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createCounterPayment, getZakatTypes, listCounterPayments, lookupPayerByIc } from "@/api/cms";
import type { CounterPaymentChannel, CounterPaymentRow, ZakatTypeConfig } from "@/types";
import { downloadReceiptPdf } from "@/utils/receipt-pdf";

type StepKey = 1 | 2 | 3 | 4;
type CounterDeskBillItem = { id: number; zakatType: string; financialYear: string; amount: number };
type CounterDeskReceipt = {
  paymentId: number;
  receiptNo: string;
  paidAt: string;
  amount: number;
  status: string;
  paymentChannel: CounterPaymentChannel;
  collectionPoint: string;
  zakatItems: Array<{ zakatType: string; financialYear: string; amount: number }>;
  payerName: string;
  payerIc: string;
};

const loading = ref(false);
const saving = ref(false);
const lookupLoading = ref(false);
const error = ref("");
const info = ref("");
const lookupInfo = ref("");

const zakatTypes = ref<ZakatTypeConfig[]>([]);
const receipt = ref<CounterDeskReceipt | null>(null);

const todayStats = ref({
  transactions: 0,
  totalAmount: 0,
  cashAmount: 0,
  cardAmount: 0,
  otherAmount: 0,
  uniquePayers: 0,
});

const payerForm = ref({
  guestName: "",
  identityNo: "",
  email: "",
  phone: "",
  source: "manual" as "manual" | "lookup",
});

const billItems = ref<CounterDeskBillItem[]>([
  { id: Date.now(), zakatType: "", financialYear: String(new Date().getFullYear()), amount: 0 },
]);

const paymentForm = ref({
  paymentChannel: "COUNTER_CASH" as CounterPaymentChannel,
  collectionPoint: "Kaunter Utama",
  notes: "",
  rrn: "",
  authCode: "",
  tid: "",
  mid: "",
});

const channelOptions: Array<{ label: string; value: CounterPaymentChannel; icon: typeof Banknote }> = [
  { label: "Tunai", value: "COUNTER_CASH", icon: Banknote },
  { label: "Kad Terminal", value: "COUNTER_CARD_TERMINAL", icon: CreditCard },
  { label: "Cek", value: "COUNTER_CHEQUE", icon: Landmark },
  { label: "Debit", value: "COUNTER_DEBIT", icon: Wallet },
  { label: "QR", value: "COUNTER_QR", icon: QrCode },
];

const channelLabels: Record<CounterPaymentChannel, string> = {
  COUNTER_CASH: "Tunai",
  COUNTER_CARD_TERMINAL: "Kad Terminal",
  COUNTER_CHEQUE: "Cek",
  COUNTER_DEBIT: "Debit",
  COUNTER_QR: "QR",
};

const payerComplete = computed(() => payerForm.value.guestName.trim().length > 1 && payerForm.value.identityNo.trim().length >= 3);
const billTotal = computed(() => billItems.value.reduce((sum, item) => sum + Number(item.amount || 0), 0));
const billComplete = computed(() => billItems.value.every((item) => item.zakatType.trim().length > 0 && Number(item.amount) > 0));
const terminalRefComplete = computed(() => {
  if (paymentForm.value.paymentChannel !== "COUNTER_CARD_TERMINAL") return true;
  return [paymentForm.value.rrn, paymentForm.value.authCode, paymentForm.value.tid, paymentForm.value.mid].every((x) => x.trim().length > 0);
});
const paymentComplete = computed(() => paymentForm.value.collectionPoint.trim().length > 0 && terminalRefComplete.value);

const activeStep = computed<StepKey>(() => {
  if (!payerComplete.value) return 1;
  if (!billComplete.value) return 2;
  if (!paymentComplete.value) return 3;
  return 4;
});

const canSubmit = computed(() => payerComplete.value && billComplete.value && paymentComplete.value && !saving.value);
const previewItems = computed(() => {
  if (receipt.value) return receipt.value.zakatItems;
  return billItems.value
    .map((item) => ({
      zakatType: String(item.zakatType || "").trim(),
      financialYear: String(item.financialYear || "").trim(),
      amount: Number(item.amount || 0),
    }))
    .filter((item) => item.zakatType.length > 0 || item.amount > 0);
});
const previewTotal = computed(() => {
  if (receipt.value) return Number(receipt.value.amount || 0);
  return Number(billTotal.value || 0);
});
const previewPayerName = computed(() => receipt.value?.payerName || payerForm.value.guestName || "-");
const previewPayerIc = computed(() => receipt.value?.payerIc || payerForm.value.identityNo || "-");
const previewChannel = computed(() => {
  if (receipt.value?.paymentChannel) return channelLabels[receipt.value.paymentChannel];
  return channelLabels[paymentForm.value.paymentChannel];
});
const previewCollectionPoint = computed(() => receipt.value?.collectionPoint || paymentForm.value.collectionPoint || "-");

function addBillItem() {
  billItems.value.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    zakatType: zakatTypes.value[0]?.name || "",
    financialYear: String(new Date().getFullYear()),
    amount: 0,
  });
}

function removeBillItem(id: number) {
  if (billItems.value.length <= 1) return;
  billItems.value = billItems.value.filter((item) => item.id !== id);
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(Number(amount || 0));
}

function fmtDate(value: string) {
  return new Date(value).toLocaleString("ms-MY");
}

function panelClass(step: StepKey) {
  const isActive = activeStep.value === step;
  return isActive
    ? "rounded-xl border border-emerald-300 bg-white shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
    : "rounded-xl border border-slate-200 bg-white shadow-sm";
}

function statusClass(step: StepKey) {
  if (activeStep.value === step) return "text-emerald-700 bg-emerald-100 border-emerald-200";
  if (activeStep.value > step) return "text-blue-700 bg-blue-100 border-blue-200";
  return "text-slate-500 bg-slate-100 border-slate-200";
}

async function lookupPayer() {
  if (!payerForm.value.identityNo.trim()) return;
  lookupLoading.value = true;
  lookupInfo.value = "";
  error.value = "";

  try {
    const res = await lookupPayerByIc(payerForm.value.identityNo.trim());
    const row = res.data;
    payerForm.value.guestName = row.displayName || row.individual?.fullName || payerForm.value.guestName;
    payerForm.value.email = row.email || payerForm.value.email;
    payerForm.value.phone = row.phone || payerForm.value.phone;
    payerForm.value.source = "lookup";
    lookupInfo.value = "Maklumat pembayar ditemui dan diisi daripada rekod sedia ada.";
  } catch {
    payerForm.value.source = "manual";
    lookupInfo.value = "Tiada padanan rekod dijumpai. Anda boleh teruskan sebagai pembayar walk-in.";
  } finally {
    lookupLoading.value = false;
  }
}

async function fetchTodayStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let page = 1;
  const limit = 200;
  let total = 0;
  const all: CounterPaymentRow[] = [];

  do {
    const res = await listCounterPayments({
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
      page,
      limit,
    });
    const rows = res.data || [];
    const meta = (res.meta || {}) as { total?: number };
    total = Number(meta.total || rows.length);
    all.push(...rows);
    page += 1;
  } while (all.length < total && page <= 10);

  const txToday = all.filter((r) => {
    const dt = new Date(r.paidAt);
    return dt >= start && dt <= end;
  });

  const cash = txToday
    .filter((r) => r.counterChannel === "COUNTER_CASH")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const card = txToday
    .filter((r) => r.counterChannel === "COUNTER_CARD_TERMINAL")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const other = txToday
    .filter((r) => r.counterChannel !== "COUNTER_CASH" && r.counterChannel !== "COUNTER_CARD_TERMINAL")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  todayStats.value = {
    transactions: txToday.length,
    totalAmount: txToday.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    cashAmount: cash,
    cardAmount: card,
    otherAmount: other,
    uniquePayers: new Set(txToday.map((r) => r.identityNo)).size,
  };
}

async function submitPayment() {
  if (!canSubmit.value) return;

  saving.value = true;
  error.value = "";
  info.value = "";

  try {
    const res = await createCounterPayment({
      guestName: payerForm.value.guestName.trim(),
      identityNo: payerForm.value.identityNo.trim(),
      email: payerForm.value.email.trim() || undefined,
      phone: payerForm.value.phone.trim() || undefined,
      zakatItems: billItems.value.map((item) => ({
        zakatType: item.zakatType,
        financialYear: item.financialYear,
        amount: Number(item.amount || 0),
      })),
      amount: Number(billTotal.value),
      paymentChannel: paymentForm.value.paymentChannel,
      collectionPoint: paymentForm.value.collectionPoint.trim(),
      terminalRef: paymentForm.value.paymentChannel === "COUNTER_CARD_TERMINAL"
        ? {
            rrn: paymentForm.value.rrn.trim(),
            authCode: paymentForm.value.authCode.trim(),
            tid: paymentForm.value.tid.trim(),
            mid: paymentForm.value.mid.trim(),
          }
        : undefined,
      notes: paymentForm.value.notes.trim() || undefined,
    });

    receipt.value = {
      ...res.data,
      payerName: payerForm.value.guestName.trim(),
      payerIc: payerForm.value.identityNo.trim(),
      paymentChannel: res.data.paymentChannel || paymentForm.value.paymentChannel,
      collectionPoint: res.data.collectionPoint || paymentForm.value.collectionPoint.trim(),
      zakatItems: (res.data.zakatItems || []).map((item) => ({
        zakatType: item.zakatType,
        financialYear: item.financialYear,
        amount: Number(item.amount || 0),
      })),
    };
    info.value = `Transaksi berjaya direkodkan. No. Resit: ${receipt.value.receiptNo}`;
    await fetchTodayStats();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal memproses bayaran kaunter.";
  } finally {
    saving.value = false;
  }
}

function printReceipt() {
  window.print();
}

function saveReceiptPdf() {
  if (!receipt.value) return;
  const firstYear = receipt.value.zakatItems.length === 1 ? receipt.value.zakatItems[0].financialYear : "-";
  downloadReceiptPdf({
    receiptNo: receipt.value.receiptNo,
    paidAt: receipt.value.paidAt,
    amount: Number(receipt.value.amount),
    status: receipt.value.status,
    payerName: receipt.value.payerName,
    payerIc: receipt.value.payerIc,
    zakatType: receipt.value.zakatItems.map((item) => item.zakatType).filter(Boolean).join(", ") || "-",
    financialYear: firstYear,
    zakatItems: receipt.value.zakatItems,
    paymentChannel: channelLabels[receipt.value.paymentChannel],
    collectionPoint: receipt.value.collectionPoint,
  });
}

function startNewTransaction() {
  const defaultYear = String(new Date().getFullYear());
  payerForm.value = {
    guestName: "",
    identityNo: "",
    email: "",
    phone: "",
    source: "manual",
  };
  billItems.value = [
    {
      id: Date.now(),
      zakatType: zakatTypes.value[0]?.name || "",
      financialYear: defaultYear,
      amount: 0,
    },
  ];
  paymentForm.value = {
    paymentChannel: "COUNTER_CASH",
    collectionPoint: "Kaunter Utama",
    notes: "",
    rrn: "",
    authCode: "",
    tid: "",
    mid: "",
  };
  receipt.value = null;
  info.value = "";
  error.value = "";
  lookupInfo.value = "";
}

onMounted(async () => {
  loading.value = true;
  try {
    const [zakatRes] = await Promise.all([
      getZakatTypes(),
      fetchTodayStats(),
    ]);
    zakatTypes.value = (zakatRes.data.types || []).filter((x) => x.isActive !== false);
    if (zakatTypes.value.length > 0 && billItems.value[0] && !billItems.value[0].zakatType) {
      billItems.value[0].zakatType = zakatTypes.value[0].name;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan data kaunter.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 py-4 text-white">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold tracking-tight">Counter Desk</h1>
            <p class="text-sm text-emerald-50/90">Kaunter berpanel untuk transaksi walk-in berkelajuan tinggi.</p>
          </div>
          <div class="text-right text-xs text-emerald-50/90">
            <p>{{ new Date().toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) }}</p>
            <p>Mod desktop 24 inci</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Transaksi Hari Ini</p>
          <p class="mt-1 text-lg font-bold text-slate-900">{{ todayStats.transactions }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Jumlah Kutipan</p>
          <p class="mt-1 text-lg font-bold text-slate-900">{{ fmtCurrency(todayStats.totalAmount) }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Tunai</p>
          <p class="mt-1 text-lg font-bold text-emerald-700">{{ fmtCurrency(todayStats.cashAmount) }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Kad Terminal</p>
          <p class="mt-1 text-lg font-bold text-blue-700">{{ fmtCurrency(todayStats.cardAmount) }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Pembayar Unik</p>
          <p class="mt-1 text-lg font-bold text-slate-900">{{ todayStats.uniquePayers }}</p>
        </div>
      </div>

      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{{ error }}</div>
      <div v-if="info" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{{ info }}</div>

      <div class="desk-scroll overflow-x-auto pb-2">
        <div class="desk-grid min-w-[1380px] gap-3">
          <section :class="panelClass(1)">
            <header class="panel-hdr">
              <div class="flex items-center gap-2">
                <span class="panel-num">1</span>
                <h2 class="panel-title">Maklumat Pembayar</h2>
              </div>
              <span class="panel-chip" :class="statusClass(1)">
                <CheckCircle2 v-if="activeStep > 1" class="h-3.5 w-3.5" />
                <CircleDot v-else class="h-3.5 w-3.5" />
                {{ activeStep === 1 ? "Aktif" : activeStep > 1 ? "Selesai" : "Menunggu" }}
              </span>
            </header>

            <div class="panel-body space-y-3">
              <div>
                <label class="field-label">No. IC / Passport</label>
                <div class="flex gap-2">
                  <input v-model="payerForm.identityNo" class="field-input" placeholder="Contoh: 880514105321" />
                  <button
                    class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    :disabled="lookupLoading"
                    @click="lookupPayer"
                  >
                    <Search class="h-4 w-4" />
                    {{ lookupLoading ? "Semak..." : "Cari" }}
                  </button>
                </div>
                <p v-if="lookupInfo" class="mt-1 text-xs text-slate-500">{{ lookupInfo }}</p>
              </div>

              <div>
                <label class="field-label">Nama Penuh</label>
                <input v-model="payerForm.guestName" class="field-input" placeholder="Nama pembayar" />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Telefon</label>
                  <input v-model="payerForm.phone" class="field-input" placeholder="01X-XXXXXXX" />
                </div>
                <div>
                  <label class="field-label">Email</label>
                  <input v-model="payerForm.email" type="email" class="field-input" placeholder="nama@email.com" />
                </div>
              </div>

              <div class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                <p class="inline-flex items-center gap-1 font-semibold"><BadgeCheck class="h-3.5 w-3.5" /> Status Rekod</p>
                <p class="mt-1">
                  {{ payerForm.source === "lookup" ? "Rekod ditemui dari sistem." : "Walk-in/manual entry. Boleh teruskan transaksi." }}
                </p>
              </div>
            </div>
          </section>

          <section :class="panelClass(2)">
            <header class="panel-hdr">
              <div class="flex items-center gap-2">
                <span class="panel-num">2</span>
                <h2 class="panel-title">Zakat & Bil</h2>
              </div>
              <span class="panel-chip" :class="statusClass(2)">
                <CheckCircle2 v-if="activeStep > 2" class="h-3.5 w-3.5" />
                <CircleDot v-else class="h-3.5 w-3.5" />
                {{ activeStep === 2 ? "Aktif" : activeStep > 2 ? "Selesai" : "Menunggu" }}
              </span>
            </header>

            <div class="panel-body space-y-3">
              <div
                v-for="(line, idx) in billItems"
                :key="line.id"
                class="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
              >
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-xs font-semibold text-slate-600">Item #{{ idx + 1 }}</p>
                  <button
                    type="button"
                    class="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-40"
                    :disabled="billItems.length <= 1"
                    @click="removeBillItem(line.id)"
                  >
                    Padam
                  </button>
                </div>

                <div>
                  <label class="field-label">Jenis Zakat</label>
                  <select v-model="line.zakatType" class="field-input">
                    <option v-for="item in zakatTypes" :key="item.code" :value="item.name">{{ item.name }}</option>
                  </select>
                </div>

                <div class="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label class="field-label">Tahun</label>
                    <select v-model="line.financialYear" class="field-input">
                      <option v-for="y in Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i)" :key="y" :value="String(y)">{{ y }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="field-label">Amaun (RM)</label>
                    <input v-model.number="line.amount" type="number" min="0" step="0.01" class="field-input" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                @click="addBillItem"
              >
                + Tambah Jenis Zakat
              </button>

              <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Ringkasan Bil</p>
                <div class="mt-2 space-y-1">
                  <div v-for="line in billItems" :key="`sum-${line.id}`" class="flex items-center justify-between text-xs text-slate-700">
                    <span>{{ line.zakatType || "Jenis belum dipilih" }} ({{ line.financialYear }})</span>
                    <span class="font-semibold">{{ fmtCurrency(Number(line.amount || 0)) }}</span>
                  </div>
                </div>
                <div class="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-sm">
                  <span class="font-semibold text-slate-700">Jumlah Keseluruhan</span>
                  <span class="text-lg font-bold text-emerald-700">{{ fmtCurrency(Number(billTotal || 0)) }}</span>
                </div>
              </div>
            </div>
          </section>

          <section :class="panelClass(3)">
            <header class="panel-hdr">
              <div class="flex items-center gap-2">
                <span class="panel-num">3</span>
                <h2 class="panel-title">Kaedah Bayaran</h2>
              </div>
              <span class="panel-chip" :class="statusClass(3)">
                <CheckCircle2 v-if="activeStep > 3" class="h-3.5 w-3.5" />
                <CircleDot v-else class="h-3.5 w-3.5" />
                {{ activeStep === 3 ? "Aktif" : activeStep > 3 ? "Selesai" : "Menunggu" }}
              </span>
            </header>

            <div class="panel-body space-y-3">
              <div class="grid grid-cols-1 gap-2">
                <button
                  v-for="method in channelOptions"
                  :key="method.value"
                  type="button"
                  class="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium transition"
                  :class="paymentForm.paymentChannel === method.value ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50'"
                  @click="paymentForm.paymentChannel = method.value"
                >
                  <span class="inline-flex items-center gap-2">
                    <component :is="method.icon" class="h-4 w-4" />
                    {{ method.label }}
                  </span>
                  <CheckCircle2 v-if="paymentForm.paymentChannel === method.value" class="h-4 w-4" />
                </button>
              </div>

              <div v-if="paymentForm.paymentChannel === 'COUNTER_CARD_TERMINAL'" class="grid grid-cols-2 gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
                <div>
                  <label class="field-label">RRN</label>
                  <input v-model="paymentForm.rrn" class="field-input" />
                </div>
                <div>
                  <label class="field-label">Auth Code</label>
                  <input v-model="paymentForm.authCode" class="field-input" />
                </div>
                <div>
                  <label class="field-label">TID</label>
                  <input v-model="paymentForm.tid" class="field-input" />
                </div>
                <div>
                  <label class="field-label">MID</label>
                  <input v-model="paymentForm.mid" class="field-input" />
                </div>
              </div>

              <div>
                <label class="field-label">Pusat Kutipan</label>
                <input v-model="paymentForm.collectionPoint" class="field-input" />
              </div>

              <div>
                <label class="field-label">Catatan</label>
                <textarea v-model="paymentForm.notes" rows="2" class="field-input" />
              </div>

              <div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                <p class="inline-flex items-center gap-1 font-semibold text-slate-700"><Sparkles class="h-3.5 w-3.5" /> AI Scan & Chat</p>
                <p class="mt-1">Fasa 2: Modul AI chat dan imbas dokumen akan diaktifkan pada keluaran seterusnya.</p>
              </div>

              <button
                class="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                :disabled="!canSubmit"
                @click="submitPayment"
              >
                {{ saving ? "Memproses..." : "Proses & Jana Resit" }}
              </button>
            </div>
          </section>

          <section :class="panelClass(4)">
            <header class="panel-hdr">
              <div class="flex items-center gap-2">
                <span class="panel-num">4</span>
                <h2 class="panel-title">Pratonton Resit</h2>
              </div>
              <span class="panel-chip" :class="statusClass(4)">
                <CircleDot class="h-3.5 w-3.5" />
                {{ activeStep === 4 ? "Aktif" : "Menunggu" }}
              </span>
            </header>

            <div id="counter-desk-receipt-print" class="panel-body space-y-3">
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p class="inline-flex items-center gap-1.5 font-semibold text-slate-800"><ReceiptText class="h-4 w-4" /> Resit Kaunter</p>
                  <p class="text-xs text-slate-500">{{ receipt ? fmtDate(receipt.paidAt) : "Belum dijana" }}</p>
                </div>

                <dl class="mt-2 space-y-1 text-xs">
                  <div class="flex justify-between gap-2"><dt class="text-slate-500">No. Resit</dt><dd class="font-semibold text-slate-900">{{ receipt?.receiptNo || "-" }}</dd></div>
                  <div class="flex justify-between gap-2"><dt class="text-slate-500">Nama</dt><dd class="font-semibold text-slate-900">{{ previewPayerName }}</dd></div>
                  <div class="flex justify-between gap-2"><dt class="text-slate-500">IC</dt><dd class="font-semibold text-slate-900">{{ previewPayerIc }}</dd></div>
                  <div class="flex justify-between gap-2"><dt class="text-slate-500">Kaedah</dt><dd class="font-semibold text-slate-900">{{ previewChannel }}</dd></div>
                  <div class="flex justify-between gap-2"><dt class="text-slate-500">Pusat Kutipan</dt><dd class="font-semibold text-slate-900">{{ previewCollectionPoint }}</dd></div>
                </dl>

                <div class="mt-2 rounded-md border border-slate-200 bg-white p-2">
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Item Zakat</p>
                  <div class="mt-1 space-y-1">
                    <div v-for="(line, idx) in previewItems" :key="`rc-${idx}`" class="flex items-center justify-between text-xs">
                      <span class="text-slate-700">{{ line.zakatType || "-" }} ({{ line.financialYear || "-" }})</span>
                      <span class="font-semibold text-slate-900">{{ fmtCurrency(Number(line.amount || 0)) }}</span>
                    </div>
                    <p v-if="previewItems.length === 0" class="text-xs text-slate-500">Belum ada item.</p>
                  </div>
                </div>

                <div class="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah</span>
                  <span class="text-xl font-bold text-emerald-700">{{ fmtCurrency(previewTotal) }}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  :disabled="!receipt"
                  @click="printReceipt"
                >
                  <Printer class="h-4 w-4" /> Cetak
                </button>
                <button
                  class="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-60"
                  :disabled="!receipt"
                  @click="saveReceiptPdf"
                >
                  <Wallet class="h-4 w-4" /> PDF
                </button>
              </div>
              <button
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                @click="startNewTransaction"
              >
                Transaksi Baru
              </button>

              <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Panel ini sentiasa aktif apabila Langkah 1-3 lengkap walaupun anda kembali edit panel sebelumnya.
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
        <div class="flex flex-wrap items-center gap-5 text-xs text-slate-600">
          <span class="inline-flex items-center gap-1"><UserRound class="h-3.5 w-3.5" /> Pembayar unik: <strong class="text-slate-900">{{ todayStats.uniquePayers }}</strong></span>
          <span class="inline-flex items-center gap-1"><Banknote class="h-3.5 w-3.5" /> Tunai: <strong class="text-slate-900">{{ fmtCurrency(todayStats.cashAmount) }}</strong></span>
          <span class="inline-flex items-center gap-1"><CreditCard class="h-3.5 w-3.5" /> Kad: <strong class="text-slate-900">{{ fmtCurrency(todayStats.cardAmount) }}</strong></span>
          <span class="inline-flex items-center gap-1"><ReceiptText class="h-3.5 w-3.5" /> Lain-lain: <strong class="text-slate-900">{{ fmtCurrency(todayStats.otherAmount) }}</strong></span>
        </div>
      </div>

      <div v-if="loading" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Memuatkan data kaunter...</div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.desk-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr 1fr 1.05fr;
}

.panel-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 10px 12px;
  background: linear-gradient(to bottom, #fcfffd, #f8fafc);
}

.panel-num {
  height: 23px;
  width: 23px;
  border-radius: 9999px;
  background: rgb(22 163 74);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: rgb(15 23 42);
}

.panel-chip {
  border-width: 1px;
  border-style: solid;
  border-radius: 9999px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.panel-body {
  padding: 12px;
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: rgb(71 85 105);
  text-transform: uppercase;
}

.field-input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgb(203 213 225);
  background: white;
  padding: 8px 10px;
  font-size: 13px;
  color: rgb(15 23 42);
}

.field-input:focus {
  outline: none;
  border-color: rgb(52 211 153);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

@media print {
  body * {
    visibility: hidden;
  }
  #counter-desk-receipt-print,
  #counter-desk-receipt-print * {
    visibility: visible;
  }
  #counter-desk-receipt-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
