<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CreditCard, Monitor, Printer, ReceiptText, Save, Wallet } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createCounterPayment, getZakatTypes } from "@/api/cms";
import type { CounterPaymentChannel, ZakatTypeConfig } from "@/types";
import { downloadReceiptPdf as downloadPdf } from "@/utils/receipt-pdf";

const submitting = ref(false);
const message = ref("");
const error = ref("");
const receipt = ref<{ paymentId: number; receiptNo: string; paidAt: string; amount: number; status: string } | null>(null);
const zakatTypes = ref<ZakatTypeConfig[]>([]);

const form = ref({
  guestName: "",
  identityNo: "",
  email: "",
  phone: "",
  zakatType: "",
  financialYear: String(new Date().getFullYear()),
  amount: 0,
  paymentChannel: "COUNTER_CASH" as CounterPaymentChannel,
  collectionPoint: "Kaunter Utama",
  rrn: "",
  authCode: "",
  tid: "",
  mid: "",
  notes: "",
});

const showTerminalRef = computed(() => form.value.paymentChannel === "COUNTER_CARD_TERMINAL");

const channelLabels: Record<string, string> = {
  COUNTER_CASH: "Tunai",
  COUNTER_CARD_TERMINAL: "Kad Terminal",
  COUNTER_CHEQUE: "Cek",
  COUNTER_DEBIT: "Debit",
  COUNTER_QR: "QR",
};

function downloadReceiptPdf() {
  if (!receipt.value) return;
  downloadPdf({
    receiptNo: receipt.value.receiptNo,
    paidAt: receipt.value.paidAt,
    amount: receipt.value.amount,
    status: receipt.value.status,
    payerName: form.value.guestName,
    payerIc: form.value.identityNo,
    zakatType: form.value.zakatType,
    financialYear: form.value.financialYear,
    paymentChannel: channelLabels[form.value.paymentChannel] || form.value.paymentChannel,
    collectionPoint: form.value.collectionPoint,
  });
}

function printReceipt() {
  window.print();
}

function openPos() {
  window.open("/counter/pos", "_blank");
}

async function submitForm() {
  submitting.value = true;
  message.value = "";
  error.value = "";
  receipt.value = null;
  try {
    const res = await createCounterPayment({
      guestName: form.value.guestName,
      identityNo: form.value.identityNo,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      zakatType: form.value.zakatType,
      financialYear: form.value.financialYear,
      amount: Number(form.value.amount),
      paymentChannel: form.value.paymentChannel,
      collectionPoint: form.value.collectionPoint,
      terminalRef: showTerminalRef.value
        ? {
            rrn: form.value.rrn,
            authCode: form.value.authCode,
            tid: form.value.tid,
            mid: form.value.mid,
          }
        : undefined,
      notes: form.value.notes || undefined,
    });

    receipt.value = res.data;
    message.value = `Bayaran berjaya direkodkan. No resit: ${res.data.receiptNo}`;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal merekodkan bayaran kaunter";
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await getZakatTypes();
    zakatTypes.value = (res.data.types || []).filter((x) => x.isActive !== false);
    if (!form.value.zakatType && zakatTypes.value.length > 0) {
      form.value.zakatType = zakatTypes.value[0].name;
    }
  } catch {
    // no-op
  }
});
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Bayaran Kaunter</h1>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          @click="openPos"
        >
          <Monitor class="h-4 w-4" />
          Mod POS
        </button>
      </div>

      <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{{ message }}</div>
      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form class="grid grid-cols-1 gap-3 md:grid-cols-2" @submit.prevent="submitForm">
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Nama Pembayar</label>
            <input v-model="form.guestName" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">IC / Passport</label>
            <input v-model="form.identityNo" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
            <input v-model="form.email" type="email" class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Telefon</label>
            <input v-model="form.phone" class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Jenis Zakat</label>
            <select v-model="form.zakatType" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option v-for="item in zakatTypes" :key="item.code" :value="item.name">{{ item.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Tahun Bayaran Zakat</label>
            <select v-model="form.financialYear" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option v-for="y in Array.from({ length: 11 }, (_, idx) => new Date().getFullYear() - idx)" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Jumlah (RM)</label>
            <input v-model.number="form.amount" min="0.01" step="0.01" type="number" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Kaedah Bayaran</label>
            <select v-model="form.paymentChannel" class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="COUNTER_CASH">Tunai</option>
              <option value="COUNTER_CARD_TERMINAL">Kad Terminal</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Pusat Kutipan</label>
            <input v-model="form.collectionPoint" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>

          <template v-if="showTerminalRef">
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">RRN</label>
              <input v-model="form.rrn" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Auth Code</label>
              <input v-model="form.authCode" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Terminal ID (TID)</label>
              <input v-model="form.tid" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Merchant ID (MID)</label>
              <input v-model="form.mid" required class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            </div>
          </template>

          <div class="md:col-span-2">
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Catatan</label>
            <textarea v-model="form.notes" rows="2" class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2 flex justify-end">
            <button :disabled="submitting" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              <Save class="h-4 w-4" />
              {{ submitting ? "Menyimpan..." : "Simpan & Jana Resit" }}
            </button>
          </div>
        </form>
      </article>

      <article v-if="receipt" id="counter-receipt-print-area" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <ReceiptText class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">Resit Bayaran</h2>
          </div>
          <div class="flex items-center gap-2">
            <button class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" @click="printReceipt">
              <Printer class="h-4 w-4" /> Cetak
            </button>
            <button class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-black" @click="downloadReceiptPdf">
              Muat Turun PDF
            </button>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <p><span class="font-medium">No. Resit:</span> {{ receipt.receiptNo }}</p>
          <p><span class="font-medium">Status:</span> {{ receipt.status }}</p>
          <p><span class="font-medium">Nama:</span> {{ form.guestName }}</p>
          <p><span class="font-medium">IC / Passport:</span> {{ form.identityNo }}</p>
          <p><span class="font-medium">Jenis Zakat:</span> {{ form.zakatType }}</p>
          <p><span class="font-medium">Tahun Zakat:</span> {{ form.financialYear }}</p>
          <p><span class="font-medium">Kaedah:</span> {{ form.paymentChannel }}</p>
          <p><span class="font-medium">Pusat Kutipan:</span> {{ form.collectionPoint }}</p>
          <p><span class="font-medium">Tarikh:</span> {{ new Date(receipt.paidAt).toLocaleString("ms-MY") }}</p>
          <p class="md:col-span-2 text-base font-semibold">Jumlah: RM {{ Number(receipt.amount).toFixed(2) }}</p>
        </div>

        <div class="mt-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <Wallet class="h-4 w-4" />
          <span v-if="form.paymentChannel === 'COUNTER_CASH'">Pembayaran tunai telah diterima dan direkodkan.</span>
          <span v-else class="inline-flex items-center gap-1"><CreditCard class="h-4 w-4" /> Pembayaran kad terminal telah direkodkan.</span>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>

<style scoped>
@media print {
  body * { visibility: hidden; }
  #counter-receipt-print-area, #counter-receipt-print-area * { visibility: visible; }
  #counter-receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
