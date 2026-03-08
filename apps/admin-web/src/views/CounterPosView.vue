<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Check } from "lucide-vue-next";

import { useAuthStore } from "@/stores/auth";
import { useSiteStore } from "@/stores/site";
import { API_BASE_URL } from "@/env";
import PosPayerTypeSelector from "@/components/counter/PosPayerTypeSelector.vue";
import PosIndividualLookup from "@/components/counter/PosIndividualLookup.vue";
import PosCorporateLookup from "@/components/counter/PosCorporateLookup.vue";
import PosCorporatePurpose from "@/components/counter/PosCorporatePurpose.vue";
import PosPaymentForm from "@/components/counter/PosPaymentForm.vue";
import PosSpgEntry from "@/components/counter/PosSpgEntry.vue";
import PosReceipt from "@/components/counter/PosReceipt.vue";
import type { ReceiptData } from "@/components/counter/PosReceipt.vue";

const auth = useAuthStore();
const site = useSiteStore();
const portalLogoSrc = computed(() => {
  const url = site.portalLogoUrl;
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
});
const isOnline = ref(typeof navigator !== "undefined" ? navigator.onLine : true);
const handleOnline = () => { isOnline.value = true; };
const handleOffline = () => { isOnline.value = false; };

// ── State ──────────────────────────────────────────────

type PosStep = "payer-type" | "ic-lookup" | "ssm-lookup" | "purpose" | "payment" | "spg-entry" | "processing" | "receipt";

const step = ref<PosStep>("payer-type");
const payerType = ref<"individu" | "korporat">("individu");
const corporatePurpose = ref<"zakat_korporat" | "spg">("zakat_korporat");
const processingText = ref("");

// Selected payer info (shared between flows)
const selectedPayer = ref({
  id: 0,
  displayName: "",
  identityNo: "",
  email: "",
  phone: "",
  payerType: "individu" as string,
  companyName: "",
  ssmNo: "",
  registered: false,
});

// Receipt data
const receiptData = ref<ReceiptData | null>(null);

// ── Dynamic step indicator ─────────────────────────────

const steps = computed(() => {
  if (payerType.value === "individu") {
    return [
      { key: "payer-type", label: "Jenis Pembayar" },
      { key: "ic-lookup", label: "Carian No. KP" },
      { key: "payment", label: "Bayaran" },
      { key: "receipt", label: "Selesai & Resit" },
    ];
  }
  if (corporatePurpose.value === "spg") {
    return [
      { key: "payer-type", label: "Jenis Pembayar" },
      { key: "ssm-lookup", label: "Carian Syarikat" },
      { key: "purpose", label: "Tujuan" },
      { key: "spg-entry", label: "Data SPG" },
      { key: "receipt", label: "Selesai & Resit" },
    ];
  }
  return [
    { key: "payer-type", label: "Jenis Pembayar" },
    { key: "ssm-lookup", label: "Carian Syarikat" },
    { key: "purpose", label: "Tujuan" },
    { key: "payment", label: "Bayaran" },
    { key: "receipt", label: "Selesai & Resit" },
  ];
});

const stepIndex = computed(() => {
  if (step.value === "processing") {
    return steps.value.findIndex((s) => s.key === "receipt");
  }
  return steps.value.findIndex((s) => s.key === step.value);
});

// ── Flow actions ───────────────────────────────────────

function selectPayerType(type: "individu" | "korporat") {
  payerType.value = type;
  step.value = type === "individu" ? "ic-lookup" : "ssm-lookup";
}

function onIndividualFound(payer: { id: number; displayName: string; identityNo: string; email: string; phone: string }) {
  selectedPayer.value = { ...payer, payerType: "individu", companyName: "", ssmNo: "", registered: payer.id > 0 };
  step.value = "payment";
}

function onCorporateFound(payer: {
  id: number; displayName: string; identityNo: string; email: string; phone: string;
  payerType: string; companyName: string; ssmNo: string; registered: boolean;
}) {
  selectedPayer.value = payer;
  step.value = "purpose";
}

function selectPurpose(purpose: "zakat_korporat" | "spg") {
  corporatePurpose.value = purpose;
  step.value = purpose === "zakat_korporat" ? "payment" : "spg-entry";
}

async function onPaymentSuccess(receipt: {
  paymentId: number; receiptNo: string; paidAt: string; amount: number; status: string;
  zakatType: string; financialYear: string; paymentChannel: string; collectionPoint: string;
}) {
  // Processing animation
  step.value = "processing";
  const messages = ["Menghantar maklumat bayaran...", "Mengesahkan transaksi...", "Menjana resit..."];
  for (const msg of messages) {
    processingText.value = msg;
    await new Promise((r) => setTimeout(r, 1000));
  }

  receiptData.value = {
    type: payerType.value === "korporat" ? "corporate" : "individual",
    paymentId: receipt.paymentId,
    receiptNo: receipt.receiptNo,
    paidAt: receipt.paidAt,
    amount: receipt.amount,
    status: receipt.status,
    payerName: selectedPayer.value.displayName,
    payerIdentityNo: selectedPayer.value.identityNo,
    zakatType: receipt.zakatType,
    financialYear: receipt.financialYear,
    paymentChannel: receipt.paymentChannel,
    collectionPoint: receipt.collectionPoint,
  };
  step.value = "receipt";
}

function onSpgSuccess(data: {
  batchId: number; referenceNo: string; totalAmount: number; rowCount: number; status: string;
  month: number; year: number; paymentChannel: string; collectionPoint: string;
  rows: Array<{ employeeName: string; employeeIdentityNo: string; amount: number }>;
}) {
  receiptData.value = {
    type: "spg",
    batchId: data.batchId,
    referenceNo: data.referenceNo,
    payerName: selectedPayer.value.companyName || selectedPayer.value.displayName,
    payerIdentityNo: selectedPayer.value.ssmNo || selectedPayer.value.identityNo,
    month: data.month,
    year: data.year,
    rowCount: data.rowCount,
    totalAmount: data.totalAmount,
    status: data.status,
    paymentChannel: data.paymentChannel,
    collectionPoint: data.collectionPoint,
    rows: data.rows,
  };
  step.value = "receipt";
}

function resetFlow() {
  step.value = "payer-type";
  payerType.value = "individu";
  corporatePurpose.value = "zakat_korporat";
  selectedPayer.value = { id: 0, displayName: "", identityNo: "", email: "", phone: "", payerType: "individu", companyName: "", ssmNo: "", registered: false };
  receiptData.value = null;
  processingText.value = "";
}

onMounted(() => {
  if (!site.initialized) site.load();
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
});
</script>

<template>
  <div class="pos-bg relative flex min-h-screen flex-col overflow-hidden">
    <!-- Decorative shapes -->
    <div class="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#0F7FFF]/20 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#FFEC00]/25 blur-3xl" />
    <div class="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#183DE4]/20 blur-3xl" />

    <!-- POS Header -->
    <header class="relative z-10 flex items-center justify-between border-b border-white/15 bg-linear-to-r from-white/30 to-white/10 px-6 py-3 text-white backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold tracking-wide">Kaunter Bayaran Zakat</h1>
      </div>
      <img v-if="portalLogoSrc" :src="portalLogoSrc" alt="Logo" class="absolute inset-x-0 mx-auto h-8 w-auto object-contain" />
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          :class="isOnline ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100' : 'border-red-300/60 bg-red-400/15 text-red-100'"
        >
          <span class="h-2 w-2 rounded-full" :class="isOnline ? 'bg-emerald-300 pos-online-heartbeat' : 'bg-red-300'" />
          {{ isOnline ? "Online" : "Offline" }}
        </span>
        <span class="text-sm opacity-80">{{ auth.user?.name || "Staff" }}</span>
      </div>
    </header>

    <!-- Step indicator -->
    <div class="relative z-10 flex items-center justify-center gap-0 py-5">
      <template v-for="(s, i) in steps" :key="s.key">
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
            :class="
              i < stepIndex
                ? 'bg-emerald-400 text-white'
                : i === stepIndex
                  ? 'bg-[#FFEC00] text-[#000957] shadow-lg'
                  : 'bg-white/20 text-white/60'
            "
          >
            <Check v-if="i < stepIndex" class="h-5 w-5" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-sm font-semibold transition-all"
            :class="i === stepIndex ? 'text-white' : i < stepIndex ? 'text-emerald-300' : 'text-white/50'"
          >
            {{ s.label }}
          </span>
        </div>
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
        <!-- PAYER TYPE -->
        <PosPayerTypeSelector
          v-if="step === 'payer-type'"
          @select="selectPayerType"
        />

        <!-- INDIVIDUAL LOOKUP -->
        <PosIndividualLookup
          v-if="step === 'ic-lookup'"
          @found="onIndividualFound"
          @back="step = 'payer-type'"
        />

        <!-- CORPORATE LOOKUP -->
        <PosCorporateLookup
          v-if="step === 'ssm-lookup'"
          @found="onCorporateFound"
          @back="step = 'payer-type'"
        />

        <!-- PURPOSE SELECTOR -->
        <PosCorporatePurpose
          v-if="step === 'purpose'"
          :registered="selectedPayer.registered"
          :company-name="selectedPayer.companyName || selectedPayer.displayName"
          @select="selectPurpose"
          @back="step = 'ssm-lookup'"
        />

        <!-- PAYMENT FORM -->
        <PosPaymentForm
          v-if="step === 'payment'"
          :payer-name="selectedPayer.displayName"
          :payer-identity-no="selectedPayer.identityNo"
          :payer-email="selectedPayer.email"
          :payer-phone="selectedPayer.phone"
          :payer-type="payerType"
          @success="onPaymentSuccess"
          @back="payerType === 'individu' ? (step = 'ic-lookup') : (step = 'purpose')"
        />

        <!-- SPG ENTRY -->
        <PosSpgEntry
          v-if="step === 'spg-entry'"
          :employer-payer-id="selectedPayer.id"
          :company-name="selectedPayer.companyName || selectedPayer.displayName"
          :ssm-no="selectedPayer.ssmNo || selectedPayer.identityNo"
          @success="onSpgSuccess"
          @back="step = 'purpose'"
        />

        <!-- PROCESSING -->
        <div
          v-if="step === 'processing'"
          class="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-2xl"
        >
          <div class="processing-spinner mb-6 h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p class="text-xl font-bold text-slate-800">Memproses Bayaran</p>
          <p class="mt-2 text-base text-slate-500">{{ processingText }}</p>
        </div>

        <!-- RECEIPT -->
        <PosReceipt
          v-if="step === 'receipt' && receiptData"
          :receipt="receiptData"
          @reset="resetFlow"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pos-bg {
  background:
    radial-gradient(640px 320px at 84% 16%, rgba(255, 236, 0, 0.3), transparent 64%),
    radial-gradient(440px 220px at 74% 82%, rgba(255, 236, 0, 0.2), transparent 72%),
    radial-gradient(1200px 520px at 8% -12%, rgba(15, 127, 255, 0.14), transparent 58%),
    radial-gradient(900px 420px at 92% -10%, rgba(24, 61, 228, 0.24), transparent 52%),
    linear-gradient(145deg, #000957 0%, #07137f 44%, #183DE4 74%, #0F7FFF 96%, #FFEC00 100%);
}
.processing-spinner {
  animation: spin 1s linear infinite;
}
@keyframes pos-heartbeat {
  0%, 100% {
    transform: scale(1);
    opacity: 0.95;
    box-shadow: 0 0 0 0 rgba(110, 231, 183, 0.45);
  }
  25% {
    transform: scale(1.28);
    opacity: 1;
    box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(110, 231, 183, 0.15);
  }
}
.pos-online-heartbeat {
  animation: pos-heartbeat 1.15s ease-in-out infinite;
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
