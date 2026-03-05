<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Landmark,
  Printer,
  QrCode,
  ReceiptText,
  RefreshCw,
  Search,
  UserPlus,
  Wallet,
  X,
} from "lucide-vue-next";

import { useAuthStore } from "@/stores/auth";
import {
  createCounterPayment,
  getZakatTypes,
  lookupPayerByIc,
  quickRegisterPayer,
} from "@/api/cms";
import type { CounterPaymentChannel, ZakatTypeConfig } from "@/types";
import { downloadReceiptPdf } from "@/utils/receipt-pdf";

const auth = useAuthStore();

const step = ref<"ic-lookup" | "payment" | "processing" | "receipt">("ic-lookup");
const processingText = ref("");

const steps = [
  { key: "ic-lookup", label: "Carian No. KP" },
  { key: "payment", label: "Bayaran" },
  { key: "receipt", label: "Selesai & Resit" },
] as const;

const stepIndex = computed(() => {
  if (step.value === "processing") return 2;
  return steps.findIndex((s) => s.key === step.value);
});

// Step 1: IC Lookup
const icNo = ref("");
const icDisplay = computed(() => {
  const digits = icNo.value;
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
});

function onIcInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, "");
  icNo.value = raw;
  // Reset display with dashes
  input.value = icDisplay.value;
}
const lookupLoading = ref(false);
const lookupResult = ref<{
  id: number;
  displayName: string;
  identityNo: string;
  email: string | null;
  phone: string | null;
  individual: { fullName: string } | null;
} | null>(null);
const lookupNotFound = ref(false);

// Quick registration
const showQuickRegister = ref(false);
const regForm = reactive({
  fullName: "",
  phone: "",
  email: "",
  password: "",
});
const registering = ref(false);

// Selected payer
const selectedPayer = reactive({
  id: 0,
  displayName: "",
  identityNo: "",
  email: "",
  phone: "",
});

// Step 2: Payment
const zakatTypes = ref<ZakatTypeConfig[]>([]);
const paymentForm = reactive({
  zakatType: "",
  financialYear: String(new Date().getFullYear()),
  amount: 0,
  paymentChannel: "COUNTER_CASH" as CounterPaymentChannel,
  collectionPoint: "Kaunter Utama",
  notes: "",
  rrn: "",
  authCode: "",
  tid: "",
  mid: "",
});
const submitting = ref(false);
const showZakatModal = ref(false);

// Bank-style amount input (cents-based)
const amountCents = ref(0);
const amountDisplay = computed(() => (amountCents.value / 100).toFixed(2));

function onAmountKeydown(event: KeyboardEvent) {
  if (event.key === "Backspace") {
    event.preventDefault();
    amountCents.value = Math.floor(amountCents.value / 10);
    paymentForm.amount = amountCents.value / 100;
    return;
  }
  if (event.key >= "0" && event.key <= "9") {
    event.preventDefault();
    const next = amountCents.value * 10 + Number(event.key);
    if (next <= 99999999) {
      amountCents.value = next;
      paymentForm.amount = amountCents.value / 100;
    }
    return;
  }
}

function selectZakatType(name: string) {
  paymentForm.zakatType = name;
  showZakatModal.value = false;
}

const showTerminalRef = computed(
  () => paymentForm.paymentChannel === "COUNTER_CARD_TERMINAL",
);

const paymentMethods: { label: string; value: CounterPaymentChannel; icon: typeof Banknote }[] = [
  { label: "Tunai", value: "COUNTER_CASH", icon: Banknote },
  { label: "Cek", value: "COUNTER_CHEQUE", icon: Landmark },
  { label: "Debit", value: "COUNTER_DEBIT", icon: CreditCard },
  { label: "Kad Kredit", value: "COUNTER_CARD_TERMINAL", icon: CreditCard },
  { label: "QR", value: "COUNTER_QR", icon: QrCode },
];

// Step 3: Receipt
const receipt = ref<{
  paymentId: number;
  receiptNo: string;
  paidAt: string;
  amount: number;
  status: string;
} | null>(null);

const error = ref("");

// ------- Actions -------

async function doLookup() {
  if (!icNo.value.trim()) return;
  lookupLoading.value = true;
  lookupNotFound.value = false;
  lookupResult.value = null;
  showQuickRegister.value = false;
  error.value = "";
  try {
    const res = await lookupPayerByIc(icNo.value.trim());
    lookupResult.value = res.data;
    selectedPayer.id = res.data.id;
    selectedPayer.displayName =
      res.data.individual?.fullName || res.data.displayName;
    selectedPayer.identityNo = res.data.identityNo;
    selectedPayer.email = res.data.email || "";
    selectedPayer.phone = res.data.phone || "";
  } catch {
    lookupNotFound.value = true;
  } finally {
    lookupLoading.value = false;
  }
}

function startQuickRegister() {
  showQuickRegister.value = true;
  regForm.fullName = "";
  regForm.phone = "";
  regForm.email = "";
  regForm.password = "";
}

async function submitQuickRegister() {
  if (!regForm.fullName.trim()) return;
  registering.value = true;
  error.value = "";
  try {
    const res = await quickRegisterPayer({
      fullName: regForm.fullName.trim(),
      mykadOrPassport: icNo.value.trim(),
      phone: regForm.phone || undefined,
      email: regForm.email || undefined,
      password: regForm.password || undefined,
    });
    selectedPayer.id = res.data.id;
    selectedPayer.displayName = res.data.displayName;
    selectedPayer.identityNo = icNo.value.trim();
    selectedPayer.email = regForm.email;
    selectedPayer.phone = regForm.phone;
    step.value = "payment";
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "Pendaftaran gagal. Sila cuba lagi.";
  } finally {
    registering.value = false;
  }
}

function goToPayment() {
  step.value = "payment";
}

function continueWithoutRegister() {
  selectedPayer.id = 0;
  selectedPayer.displayName = icNo.value;
  selectedPayer.identityNo = icNo.value;
  selectedPayer.email = "";
  selectedPayer.phone = "";
  step.value = "payment";
}

const channelLabels: Record<string, string> = {
  COUNTER_CASH: "Tunai",
  COUNTER_CARD_TERMINAL: "Kad Kredit",
  COUNTER_CHEQUE: "Cek",
  COUNTER_DEBIT: "Debit",
  COUNTER_QR: "QR",
};

async function submitPayment() {
  if (!paymentForm.zakatType || paymentForm.amount <= 0) return;
  submitting.value = true;
  error.value = "";
  try {
    const res = await createCounterPayment({
      guestName: selectedPayer.displayName,
      identityNo: selectedPayer.identityNo,
      email: selectedPayer.email || undefined,
      phone: selectedPayer.phone || undefined,
      zakatType: paymentForm.zakatType,
      financialYear: paymentForm.financialYear,
      amount: Number(paymentForm.amount),
      paymentChannel: paymentForm.paymentChannel,
      collectionPoint: paymentForm.collectionPoint,
      terminalRef: showTerminalRef.value
        ? {
            rrn: paymentForm.rrn,
            authCode: paymentForm.authCode,
            tid: paymentForm.tid,
            mid: paymentForm.mid,
          }
        : undefined,
      notes: paymentForm.notes || undefined,
    });
    receipt.value = res.data;

    // Processing animation
    step.value = "processing";
    const messages = [
      "Menghantar maklumat bayaran...",
      "Mengesahkan transaksi...",
      "Menjana resit...",
    ];
    for (const msg of messages) {
      processingText.value = msg;
      await new Promise((r) => setTimeout(r, 1000));
    }
    step.value = "receipt";
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "Bayaran gagal. Sila cuba lagi.";
  } finally {
    submitting.value = false;
  }
}

function handleDownloadPdf() {
  if (!receipt.value) return;
  downloadReceiptPdf({
    receiptNo: receipt.value.receiptNo,
    paidAt: receipt.value.paidAt,
    amount: receipt.value.amount,
    status: receipt.value.status,
    payerName: selectedPayer.displayName,
    payerIc: selectedPayer.identityNo,
    zakatType: paymentForm.zakatType,
    financialYear: paymentForm.financialYear,
    paymentChannel: channelLabels[paymentForm.paymentChannel] || paymentForm.paymentChannel,
    collectionPoint: paymentForm.collectionPoint,
  });
}

function printReceipt() {
  window.print();
}

function resetFlow() {
  step.value = "ic-lookup";
  icNo.value = "";
  lookupResult.value = null;
  lookupNotFound.value = false;
  showQuickRegister.value = false;
  Object.assign(regForm, { fullName: "", phone: "", email: "", password: "" });
  Object.assign(selectedPayer, {
    id: 0,
    displayName: "",
    identityNo: "",
    email: "",
    phone: "",
  });
  Object.assign(paymentForm, {
    zakatType: zakatTypes.value[0]?.name || "",
    financialYear: String(new Date().getFullYear()),
    amount: 0,
    paymentChannel: "COUNTER_CASH",
    collectionPoint: "Kaunter Utama",
    notes: "",
    rrn: "",
    authCode: "",
    tid: "",
    mid: "",
  });
  amountCents.value = 0;
  receipt.value = null;
  error.value = "";
}

onMounted(async () => {
  try {
    const res = await getZakatTypes();
    zakatTypes.value = (res.data.types || []).filter(
      (x) => x.isActive !== false,
    );
    // default to empty — user must select via modal
  } catch {
    // no-op
  }
});
</script>

<template>
  <div class="pos-bg relative flex min-h-screen flex-col overflow-hidden">
    <!-- Decorative shapes -->
    <div class="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-400/20 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-3xl" />
    <div class="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-purple-300/15 blur-3xl" />

    <!-- POS Header -->
    <header
      class="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3 text-white backdrop-blur-md"
    >
      <h1 class="text-xl font-bold tracking-wide">Kaunter Bayaran Zakat</h1>
      <span class="text-sm opacity-80">{{ auth.user?.name || "Staff" }}</span>
    </header>

    <!-- Step indicator -->
    <div class="relative z-10 flex items-center justify-center gap-0 py-5">
      <template v-for="(s, i) in steps" :key="s.key">
        <div class="flex items-center gap-2.5">
          <!-- Circle -->
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
            :class="
              i < stepIndex
                ? 'bg-emerald-400 text-white'
                : i === stepIndex
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/20 text-white/60'
            "
          >
            <Check v-if="i < stepIndex" class="h-5 w-5" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <!-- Label -->
          <span
            class="text-sm font-semibold transition-all"
            :class="
              i === stepIndex
                ? 'text-white'
                : i < stepIndex
                  ? 'text-emerald-300'
                  : 'text-white/50'
            "
          >
            {{ s.label }}
          </span>
        </div>
        <!-- Connector line -->
        <div
          v-if="i < steps.length - 1"
          class="mx-4 h-0.5 w-12 rounded-full transition-all"
          :class="i < stepIndex ? 'bg-emerald-400' : 'bg-white/20'"
        />
      </template>
    </div>

    <!-- Main content -->
    <div class="flex flex-1 items-center justify-center px-4 py-6">
      <div class="w-full max-w-2xl">
        <!-- Error banner -->
        <div
          v-if="error"
          class="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- STEP 1: IC LOOKUP -->
        <div
          v-if="step === 'ic-lookup'"
          class="rounded-2xl bg-white p-8 shadow-2xl"
        >
          <h2 class="mb-6 text-center text-2xl font-bold text-slate-800">
            Masukkan No. Kad Pengenalan
          </h2>

          <form class="space-y-4" @submit.prevent="doLookup">
            <input
              :value="icDisplay"
              inputmode="numeric"
              placeholder="000000-00-0000"
              autofocus
              class="w-full rounded-xl border-2 border-slate-200 px-5 py-4 text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              @input="onIcInput"
            />
            <button
              :disabled="lookupLoading || !icNo.trim()"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Search class="h-5 w-5" />
              {{ lookupLoading ? "Mencari..." : "Cari" }}
            </button>
          </form>

          <!-- Found result -->
          <div
            v-if="lookupResult"
            class="mt-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center"
          >
            <p class="text-sm font-medium text-emerald-600">Pembayar dijumpai</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">
              {{ lookupResult.individual?.fullName || lookupResult.displayName }}
            </p>
            <p class="mt-1 text-sm text-slate-500">{{ lookupResult.identityNo }}</p>
            <button
              class="mt-4 rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
              @click="goToPayment"
            >
              Seterusnya
            </button>
          </div>

          <!-- Not found -->
          <div v-if="lookupNotFound && !showQuickRegister" class="mt-6 text-center">
            <div
              class="rounded-xl border-2 border-amber-200 bg-amber-50 p-6"
            >
              <p class="text-lg font-semibold text-amber-800">
                Tiada rekod dijumpai
              </p>
              <p class="mt-1 text-sm text-amber-600">
                No. Kad Pengenalan {{ icDisplay }} tidak berdaftar dalam sistem.
              </p>
              <div class="mt-4 flex items-center justify-center gap-3">
                <button
                  class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
                  @click="startQuickRegister"
                >
                  <UserPlus class="h-5 w-5" />
                  Daftar
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                  @click="continueWithoutRegister"
                >
                  Teruskan Tanpa Daftar
                </button>
              </div>
            </div>
          </div>

          <!-- Quick registration form -->
          <div v-if="showQuickRegister" class="mt-6">
            <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
              <h3 class="mb-4 text-center text-lg font-bold text-slate-800">
                Pendaftaran Pantas
              </h3>
              <form class="space-y-3" @submit.prevent="submitQuickRegister">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">
                    Nama Penuh
                  </label>
                  <input
                    v-model="regForm.fullName"
                    required
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">
                    No. Telefon
                  </label>
                  <input
                    v-model="regForm.phone"
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    v-model="regForm.email"
                    type="email"
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">
                    Kata Laluan
                  </label>
                  <input
                    v-model="regForm.password"
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <button
                  :disabled="registering || !regForm.fullName.trim()"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserPlus class="h-5 w-5" />
                  {{ registering ? "Mendaftar..." : "Daftar & Teruskan" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- STEP 2: PAYMENT -->
        <div
          v-if="step === 'payment'"
          class="rounded-2xl bg-white p-8 shadow-2xl"
        >
          <!-- Payer info bar -->
          <div class="mb-6 rounded-xl bg-slate-100 p-4 text-center">
            <p class="text-sm text-slate-500">Pembayar</p>
            <p class="text-xl font-bold text-slate-900">
              {{ selectedPayer.displayName }}
            </p>
            <p class="text-sm text-slate-500">{{ selectedPayer.identityNo }}</p>
          </div>

          <form class="space-y-5" @submit.prevent="submitPayment">
            <!-- Payment method cards -->
            <div>
              <label class="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                Kaedah Bayaran
              </label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.value"
                  type="button"
                  class="flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-4 text-sm font-semibold transition-all"
                  :class="
                    paymentForm.paymentChannel === method.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                  "
                  @click="paymentForm.paymentChannel = method.value"
                >
                  <component :is="method.icon" class="h-6 w-6" />
                  {{ method.label }}
                </button>
              </div>
            </div>

            <!-- Zakat type + Amount -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Jenis Zakat
                </label>
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-2xl transition-all"
                  :class="
                    paymentForm.zakatType
                      ? 'border border-slate-300 bg-white hover:border-blue-400'
                      : 'border-2 border-dashed border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100/70'
                  "
                  @click="showZakatModal = true"
                >
                  <span :class="paymentForm.zakatType ? 'text-slate-900' : 'text-blue-400'">
                    {{ paymentForm.zakatType || "Sila Pilih" }}
                  </span>
                  <ChevronRight class="h-5 w-5" :class="paymentForm.zakatType ? 'text-slate-400' : 'text-blue-400'" />
                </button>
              </div>
              <div>
                <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Tahun Bayaran Zakat
                </label>
                <select
                  v-model="paymentForm.financialYear"
                  class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option v-for="y in Array.from({ length: 11 }, (_, idx) => new Date().getFullYear() - idx)" :key="y" :value="String(y)">
                    {{ y }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Jumlah (RM)
                </label>
                <input
                  :value="amountDisplay"
                  inputmode="numeric"
                  readonly
                  class="w-full cursor-text rounded-lg border border-slate-300 px-4 py-3 text-right text-2xl font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  @keydown="onAmountKeydown"
                />
              </div>
            </div>

            <!-- Collection point -->
            <div>
              <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                Pusat Kutipan
              </label>
              <input
                v-model="paymentForm.collectionPoint"
                required
                class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <!-- Terminal ref (only for Kad Kredit) -->
            <template v-if="showTerminalRef">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-500">RRN</label>
                  <input
                    v-model="paymentForm.rrn"
                    required
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-500">Auth Code</label>
                  <input
                    v-model="paymentForm.authCode"
                    required
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-500">Terminal ID (TID)</label>
                  <input
                    v-model="paymentForm.tid"
                    required
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-500">Merchant ID (MID)</label>
                  <input
                    v-model="paymentForm.mid"
                    required
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </template>

            <!-- Submit -->
            <button
              :disabled="submitting || paymentForm.amount <= 0"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Wallet class="h-5 w-5" />
              {{ submitting ? "Memproses..." : "Bayar" }}
            </button>
          </form>
        </div>

        <!-- PROCESSING -->
        <div
          v-if="step === 'processing'"
          class="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-2xl"
        >
          <div class="processing-spinner mb-6 h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p class="text-xl font-bold text-slate-800">Memproses Bayaran</p>
          <p class="mt-2 text-base text-slate-500">{{ processingText }}</p>
        </div>

        <!-- STEP 3: RECEIPT -->
        <div v-if="step === 'receipt'" class="space-y-4">
          <div
            id="pos-receipt-print-area"
            class="rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2">
                <ReceiptText class="h-5 w-5 text-blue-600" />
                <h2 class="text-lg font-bold text-slate-900">Resit Bayaran</h2>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="printReceipt"
                >
                  <Printer class="h-4 w-4" />
                  Cetak
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                  @click="handleDownloadPdf"
                >
                  Muat Turun PDF
                </button>
              </div>
            </div>

            <table class="mt-4 w-full text-base">
              <tbody>
                <tr>
                  <td class="w-40 py-1.5 align-top font-semibold text-slate-500">No. Resit</td>
                  <td class="w-4 py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ receipt?.receiptNo }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Status</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ receipt?.status }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Nama</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ selectedPayer.displayName }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">No. Kad Pengenalan</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ selectedPayer.identityNo }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Jenis Zakat</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ paymentForm.zakatType }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Tahun Zakat</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ paymentForm.financialYear }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Kaedah</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ channelLabels[paymentForm.paymentChannel] || paymentForm.paymentChannel }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Pusat Kutipan</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ paymentForm.collectionPoint }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 align-top font-semibold text-slate-500">Tarikh</td>
                  <td class="py-1.5 text-slate-400">:</td>
                  <td class="py-1.5 text-slate-900">{{ receipt ? new Date(receipt.paidAt).toLocaleString("ms-MY") : "" }}</td>
                </tr>
              </tbody>
            </table>

            <div class="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
              <span class="text-base font-semibold text-slate-700">Jumlah Bayaran</span>
              <span class="text-2xl font-bold text-emerald-700">RM {{ receipt ? Number(receipt.amount).toFixed(2) : "0.00" }}</span>
            </div>

            <div
              class="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"
            >
              <Wallet class="h-4 w-4" />
              <span>Pembayaran telah diterima dan direkodkan. Terima kasih.</span>
            </div>
          </div>

          <!-- Bayaran Baru button -->
          <button
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-xl font-bold text-blue-700 shadow-2xl hover:bg-blue-50"
            @click="resetFlow"
          >
            <RefreshCw class="h-6 w-6" />
            Bayaran Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Zakat Type Modal -->
    <Teleport to="body">
      <div
        v-if="showZakatModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showZakatModal = false"
      >
        <div class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-bold text-slate-900">Pilih Jenis Zakat</h3>
            <button
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              @click="showZakatModal = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="zt in zakatTypes"
                :key="zt.code"
                class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-center text-sm font-semibold transition-all"
                :class="
                  paymentForm.zakatType === zt.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                "
                @click="selectZakatType(zt.name)"
              >
                <Check
                  v-if="paymentForm.zakatType === zt.name"
                  class="h-4 w-4 shrink-0 text-blue-600"
                />
                <span>{{ zt.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pos-bg {
  background: linear-gradient(to bottom right, #1a0538, #49108B, #7E30E1);
}
.processing-spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media print {
  body * {
    visibility: hidden;
  }
  #pos-receipt-print-area,
  #pos-receipt-print-area * {
    visibility: visible;
  }
  #pos-receipt-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
