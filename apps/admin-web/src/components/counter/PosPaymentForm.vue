<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Landmark,
  QrCode,
  ReceiptText,
  Wallet,
  X,
} from "lucide-vue-next";
import { CalendarClock } from "lucide-vue-next";
import { createCounterPayment, createCounterScheduledPayment, getZakatTypes } from "@/api/cms";
import type { CounterPaymentChannel, ZakatTypeConfig } from "@/types";

const props = defineProps<{
  payerName: string;
  payerIdentityNo: string;
  payerEmail: string;
  payerPhone: string;
  payerType: "individu" | "korporat";
}>();

const emit = defineEmits<{
  success: [receipt: { paymentId: number; receiptNo: string; paidAt: string; amount: number; status: string; zakatType: string; financialYear: string; paymentChannel: string; collectionPoint: string }];
  back: [];
}>();

const zakatTypes = ref<ZakatTypeConfig[]>([]);
const paymentForm = reactive({
  zakatType: "",
  financialYear: String(new Date().getFullYear()),
  amount: 0,
  fidyahDays: 1,
  fidyahYears: 1,
  paymentMethodCode: "CASH",
  paymentChannel: "COUNTER_CASH" as CounterPaymentChannel,
  collectionPoint: "Kaunter Utama",
  notes: "",
  paymentMode: "sekali" as "sekali" | "berjadual",
  scheduleFrequency: "monthly" as "monthly" | "quarterly" | "yearly",
  scheduleTotalInstalments: 12,
  cardLast4: "",
  cardBrand: "VISA" as "VISA" | "MASTERCARD",
  rrn: "",
  authCode: "",
  tid: "",
  mid: "",
});
const submitting = ref(false);
const showZakatModal = ref(false);
const error = ref("");

const amountCents = ref(0);
const amountDisplay = computed(() => (amountCents.value / 100).toFixed(2));
const isFidyah = computed(() => paymentForm.zakatType.toLowerCase().includes("fidyah"));
const calculatedAmount = computed(() => {
  if (paymentForm.amount <= 0) return 0;
  if (!isFidyah.value) return paymentForm.amount;
  const days = Number(paymentForm.fidyahDays);
  const years = Number(paymentForm.fidyahYears);
  if (!Number.isFinite(days) || !Number.isFinite(years) || days <= 0 || years <= 0) return 0;
  return paymentForm.amount * days * years;
});

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
  }
}

function selectZakatType(name: string) {
  paymentForm.zakatType = name;
  showZakatModal.value = false;
}

const showTerminalRef = computed(() => paymentForm.paymentMethodCode === "CARD" && paymentForm.paymentMode === "sekali");
const showScheduleOption = computed(() => paymentForm.paymentMethodCode === "CARD");

const channelLabels: Record<string, string> = {
  COUNTER_CASH: "Tunai",
  COUNTER_CARD_TERMINAL: "Kad Kredit",
  COUNTER_CHEQUE: "Cek",
  COUNTER_DEBIT: "Debit",
  COUNTER_QR: "QR",
};

const paymentMethods: { code: string; label: string; value: CounterPaymentChannel; icon: typeof Banknote }[] = [
  { code: "SLIP_BANK", label: "Slip Bank", value: "COUNTER_CHEQUE", icon: ReceiptText },
  { code: "FPX", label: "FPX B2C/B2B", value: "COUNTER_QR", icon: Landmark },
  { code: "JOMPAY", label: "JomPAY", value: "COUNTER_QR", icon: QrCode },
  { code: "CARD", label: "Debit/Credit Card", value: "COUNTER_CARD_TERMINAL", icon: CreditCard },
  { code: "CHEQUE", label: "Cek", value: "COUNTER_CHEQUE", icon: Landmark },
  { code: "CASH", label: "Tunai", value: "COUNTER_CASH", icon: Banknote },
];
const selectedMethod = computed(
  () => paymentMethods.find((m) => m.code === paymentForm.paymentMethodCode) || paymentMethods[0],
);

async function submitPayment() {
  if (!paymentForm.zakatType || calculatedAmount.value <= 0) return;
  submitting.value = true;
  error.value = "";
  try {
    if (isFidyah.value && (paymentForm.fidyahDays <= 0 || paymentForm.fidyahYears <= 0)) {
      error.value = "Sila isi bilangan hari dan tahun gandaan fidyah.";
      submitting.value = false;
      return;
    }

    if (paymentForm.paymentMode === "berjadual" && paymentForm.paymentMethodCode === "CARD") {
      if (!paymentForm.cardLast4 || paymentForm.cardLast4.length !== 4) {
        error.value = "Sila masukkan 4 digit terakhir kad.";
        submitting.value = false;
        return;
      }
      if (paymentForm.scheduleTotalInstalments < 2) {
        error.value = "Bilangan ansuran mestilah sekurang-kurangnya 2.";
        submitting.value = false;
        return;
      }
      const res = await createCounterScheduledPayment({
        payerName: props.payerName,
        identityNo: props.payerIdentityNo,
        email: props.payerEmail || undefined,
        zakatType: paymentForm.zakatType,
        financialYear: paymentForm.financialYear,
        amountPerInstalment: Number(calculatedAmount.value),
        totalInstalments: paymentForm.scheduleTotalInstalments,
        frequency: paymentForm.scheduleFrequency,
        cardLast4: paymentForm.cardLast4,
        cardBrand: paymentForm.cardBrand,
        collectionPoint: paymentForm.collectionPoint,
      });
      emit("success", {
        paymentId: res.data.firstPayment.id,
        receiptNo: res.data.firstPayment.receiptNo,
        paidAt: new Date().toISOString(),
        amount: Number(calculatedAmount.value),
        status: "success",
        zakatType: paymentForm.zakatType,
        financialYear: paymentForm.financialYear,
        paymentChannel: `${selectedMethod.value.label} (Berjadual ${res.data.scheduleRef})`,
        collectionPoint: paymentForm.collectionPoint,
      });
    } else {
      const res = await createCounterPayment({
        guestName: props.payerName,
        identityNo: props.payerIdentityNo,
        email: props.payerEmail || undefined,
        phone: props.payerPhone || undefined,
        zakatType: paymentForm.zakatType,
        financialYear: paymentForm.financialYear,
        amount: Number(calculatedAmount.value),
        paymentChannel: paymentForm.paymentChannel,
        collectionPoint: paymentForm.collectionPoint,
        terminalRef: showTerminalRef.value
          ? { rrn: paymentForm.rrn, authCode: paymentForm.authCode, tid: paymentForm.tid, mid: paymentForm.mid }
          : undefined,
        notes: paymentForm.notes || undefined,
      });
      emit("success", {
        ...res.data,
        amount: Number(calculatedAmount.value),
        zakatType: paymentForm.zakatType,
        financialYear: paymentForm.financialYear,
        paymentChannel: selectedMethod.value.label,
        collectionPoint: paymentForm.collectionPoint,
      });
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Bayaran gagal. Sila cuba lagi.";
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await getZakatTypes();
    zakatTypes.value = (res.data.types || []).filter((x) => x.isActive !== false);
  } catch {
    // no-op
  }
});
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-2xl">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="$emit('back')">
        &larr;
      </button>
      <h2 class="text-xl font-bold text-slate-800">Bayaran</h2>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Payer info bar -->
    <div class="mb-6 rounded-xl bg-slate-100 p-4 text-center">
      <p class="text-sm text-slate-500">Pembayar</p>
      <p class="text-xl font-bold text-slate-900">{{ payerName }}</p>
      <p class="text-sm text-slate-500">{{ payerIdentityNo }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="submitPayment">
      <!-- Payment method cards -->
      <div>
        <label class="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">Kaedah Bayaran</label>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="method in paymentMethods"
            :key="method.code"
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all"
            :class="paymentForm.paymentMethodCode === method.code ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'"
            @click="paymentForm.paymentMethodCode = method.code; paymentForm.paymentChannel = method.value; if (method.code !== 'CARD') paymentForm.paymentMode = 'sekali'"
          >
            <component :is="method.icon" class="h-4 w-4" />
            {{ method.label }}
          </button>
        </div>
      </div>

      <!-- Payment mode (only for CARD) -->
      <div v-if="showScheduleOption" class="space-y-3">
        <label class="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
          <CalendarClock class="mr-1 inline h-4 w-4" />
          Mod Bayaran
        </label>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all"
            :class="paymentForm.paymentMode === 'sekali' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'"
            @click="paymentForm.paymentMode = 'sekali'"
          >
            Bayaran Sekali
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all"
            :class="paymentForm.paymentMode === 'berjadual' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'"
            @click="paymentForm.paymentMode = 'berjadual'"
          >
            Bayaran Berjadual
          </button>
        </div>
        <div v-if="paymentForm.paymentMode === 'berjadual'" class="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-500">Kekerapan</label>
              <select v-model="paymentForm.scheduleFrequency" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-semibold focus:border-blue-500 focus:outline-none">
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Suku Tahunan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-500">Bil. Ansuran</label>
              <div class="flex items-center rounded-lg border border-slate-300 bg-white">
                <button type="button" class="px-3 py-2.5 text-lg font-bold text-slate-700 hover:bg-blue-50" @click="paymentForm.scheduleTotalInstalments = Math.max(2, paymentForm.scheduleTotalInstalments - 1)">-</button>
                <input v-model.number="paymentForm.scheduleTotalInstalments" min="2" max="120" type="number" class="stepper-input w-full border-0 bg-transparent text-center text-base font-semibold focus:outline-none" />
                <button type="button" class="px-3 py-2.5 text-lg font-bold text-slate-700 hover:bg-blue-50" @click="paymentForm.scheduleTotalInstalments = Math.min(120, paymentForm.scheduleTotalInstalments + 1)">+</button>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-500">Jenama Kad</label>
              <div class="flex gap-2">
                <button type="button" class="flex-1 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition" :class="paymentForm.cardBrand === 'VISA' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'" @click="paymentForm.cardBrand = 'VISA'">VISA</button>
                <button type="button" class="flex-1 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition" :class="paymentForm.cardBrand === 'MASTERCARD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'" @click="paymentForm.cardBrand = 'MASTERCARD'">MC</button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-500">4 Digit Terakhir</label>
              <input v-model="paymentForm.cardLast4" maxlength="4" pattern="\d{4}" placeholder="1234" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-base tracking-widest focus:border-blue-500 focus:outline-none" @input="paymentForm.cardLast4 = paymentForm.cardLast4.replace(/\D/g, '').slice(0, 4)" />
            </div>
          </div>
          <div v-if="calculatedAmount > 0 && paymentForm.scheduleTotalInstalments >= 2" class="rounded-lg border border-blue-200 bg-white p-3 text-sm text-slate-700">
            Ringkasan: <span class="font-bold text-blue-700">RM {{ calculatedAmount.toFixed(2) }}</span> x
            <span class="font-bold">{{ paymentForm.scheduleTotalInstalments }}</span> ansuran =
            <span class="font-bold text-emerald-700">RM {{ (calculatedAmount * paymentForm.scheduleTotalInstalments).toFixed(2) }}</span>
            ({{ paymentForm.scheduleFrequency === 'monthly' ? 'bulanan' : paymentForm.scheduleFrequency === 'quarterly' ? 'suku tahunan' : 'tahunan' }})
          </div>
        </div>
      </div>

      <!-- Zakat type + Amount -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Jenis Zakat</label>
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-lg font-semibold transition-all"
            :class="paymentForm.zakatType ? 'border border-slate-300 bg-white hover:border-blue-400' : 'border border-dashed border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100/70'"
            @click="showZakatModal = true"
          >
            <span :class="paymentForm.zakatType ? 'text-slate-900' : 'text-blue-400'">
              {{ paymentForm.zakatType || "Sila Pilih" }}
            </span>
            <ChevronRight class="h-5 w-5" :class="paymentForm.zakatType ? 'text-slate-400' : 'text-blue-400'" />
          </button>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Tahun Bayaran Zakat</label>
          <select
            v-model="paymentForm.financialYear"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option v-for="y in Array.from({ length: 11 }, (_, idx) => new Date().getFullYear() - idx)" :key="y" :value="String(y)">{{ y }}</option>
          </select>
        </div>
        <template v-if="isFidyah">
          <div>
            <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Bilangan Hari Tinggal Puasa</label>
            <div class="flex items-center rounded-lg border border-slate-300 bg-white">
              <button
                type="button"
                class="px-4 py-3 text-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                @click="paymentForm.fidyahDays = Math.max(1, Number(paymentForm.fidyahDays || 1) - 1)"
              >
                -
              </button>
              <input
                v-model.number="paymentForm.fidyahDays"
                min="1"
                max="365"
                type="number"
                class="stepper-input w-full border-0 bg-transparent px-2 py-3 text-center text-lg font-semibold text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                class="px-4 py-3 text-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                @click="paymentForm.fidyahDays = Math.min(365, Number(paymentForm.fidyahDays || 1) + 1)"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Tahun Gandaan</label>
            <div class="flex items-center rounded-lg border border-slate-300 bg-white">
              <button
                type="button"
                class="px-4 py-3 text-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                @click="paymentForm.fidyahYears = Math.max(1, Number(paymentForm.fidyahYears || 1) - 1)"
              >
                -
              </button>
              <input
                v-model.number="paymentForm.fidyahYears"
                min="1"
                max="100"
                type="number"
                class="stepper-input w-full border-0 bg-transparent px-2 py-3 text-center text-lg font-semibold text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                class="px-4 py-3 text-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                @click="paymentForm.fidyahYears = Math.min(100, Number(paymentForm.fidyahYears || 1) + 1)"
              >
                +
              </button>
            </div>
          </div>
        </template>
        <template v-if="isFidyah">
          <div>
            <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Kadar Fidyah (RM / hari)</label>
            <input
              :value="amountDisplay"
              inputmode="numeric"
              readonly
              class="w-full cursor-text rounded-lg border border-slate-300 px-4 py-3 text-right text-2xl font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              @keydown="onAmountKeydown"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Jumlah Bayaran (RM)</label>
            <div class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-right text-2xl font-bold text-slate-900">
              {{ calculatedAmount.toFixed(2) }}
            </div>
          </div>
        </template>
        <div v-else>
          <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Jumlah (RM)</label>
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
        <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Pusat Kutipan</label>
        <input
          v-model="paymentForm.collectionPoint"
          required
          class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <!-- Terminal ref -->
      <template v-if="showTerminalRef">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500">RRN</label>
            <input v-model="paymentForm.rrn" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500">Auth Code</label>
            <input v-model="paymentForm.authCode" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500">Terminal ID (TID)</label>
            <input v-model="paymentForm.tid" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500">Merchant ID (MID)</label>
            <input v-model="paymentForm.mid" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
      </template>

      <!-- Submit -->
      <button
        :disabled="submitting || calculatedAmount <= 0"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        <Wallet class="h-5 w-5" />
        {{ submitting ? "Memproses..." : paymentForm.paymentMode === 'berjadual' ? "Mulakan Bayaran Berjadual" : "Bayar" }}
      </button>
    </form>

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
            <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="showZakatModal = false">
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="zt in zakatTypes"
                :key="zt.code"
                class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-center text-sm font-semibold transition-all"
                :class="paymentForm.zakatType === zt.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'"
                @click="selectZakatType(zt.name)"
              >
                <Check v-if="paymentForm.zakatType === zt.name" class="h-4 w-4 shrink-0 text-blue-600" />
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
.stepper-input {
  appearance: textfield;
  -moz-appearance: textfield;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
