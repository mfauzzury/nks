<script setup lang="ts">
import { Printer, ReceiptText, RefreshCw, Wallet } from "lucide-vue-next";
import { downloadReceiptPdf } from "@/utils/receipt-pdf";

export type IndividualReceipt = {
  type: "individual" | "corporate";
  paymentId: number;
  receiptNo: string;
  paidAt: string;
  amount: number;
  status: string;
  payerName: string;
  payerIdentityNo: string;
  zakatType: string;
  financialYear: string;
  paymentChannel: string;
  collectionPoint: string;
};

export type SpgReceipt = {
  type: "spg";
  batchId: number;
  referenceNo: string;
  payerName: string;
  payerIdentityNo: string;
  month: number;
  year: number;
  rowCount: number;
  totalAmount: number;
  status: string;
  paymentChannel: string;
  collectionPoint: string;
  rows: Array<{ employeeName: string; employeeIdentityNo: string; amount: number }>;
};

export type ReceiptData = IndividualReceipt | SpgReceipt;

const props = defineProps<{ receipt: ReceiptData }>();
const emit = defineEmits<{ reset: [] }>();

const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

function handleDownloadPdf() {
  if (props.receipt.type === "individual" || props.receipt.type === "corporate") {
    downloadReceiptPdf({
      receiptNo: props.receipt.receiptNo,
      paidAt: props.receipt.paidAt,
      amount: props.receipt.amount,
      status: props.receipt.status,
      payerName: props.receipt.payerName,
      payerIc: props.receipt.payerIdentityNo,
      zakatType: props.receipt.zakatType,
      financialYear: props.receipt.financialYear,
      paymentChannel: props.receipt.paymentChannel,
      collectionPoint: props.receipt.collectionPoint,
    });
  }
  // SPG PDF can be enhanced later
}

function printReceipt() {
  window.print();
}

function moneyFormat(value: number) {
  return `RM ${Number(value).toFixed(2)}`;
}
</script>

<template>
  <div class="space-y-4">
    <div id="pos-receipt-print-area" class="rounded-2xl bg-white p-8 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-2">
          <ReceiptText class="h-5 w-5 text-blue-600" />
          <h2 class="text-lg font-bold text-slate-900">
            {{ receipt.type === "spg" ? "Resit Batch SPG" : "Resit Bayaran" }}
          </h2>
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
            v-if="receipt.type !== 'spg'"
            class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            @click="handleDownloadPdf"
          >
            Muat Turun PDF
          </button>
        </div>
      </div>

      <!-- Individual / Corporate Receipt -->
      <template v-if="receipt.type === 'individual' || receipt.type === 'corporate'">
        <table class="mt-4 w-full text-base">
          <tbody>
            <tr>
              <td class="w-40 py-1.5 align-top font-semibold text-slate-500">No. Resit</td>
              <td class="w-4 py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.receiptNo }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Status</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.status }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Nama</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.payerName }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">
                {{ receipt.type === "corporate" ? "No. SSM" : "No. Kad Pengenalan" }}
              </td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.payerIdentityNo }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Jenis Zakat</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.zakatType }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Tahun Zakat</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.financialYear }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Kaedah</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.paymentChannel }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Pusat Kutipan</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.collectionPoint }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Tarikh</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ new Date(receipt.paidAt).toLocaleString("ms-MY") }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
          <span class="text-base font-semibold text-slate-700">Jumlah Bayaran</span>
          <span class="text-2xl font-bold text-emerald-700">{{ moneyFormat(receipt.amount) }}</span>
        </div>
      </template>

      <!-- SPG Receipt -->
      <template v-if="receipt.type === 'spg'">
        <table class="mt-4 w-full text-base">
          <tbody>
            <tr>
              <td class="w-40 py-1.5 align-top font-semibold text-slate-500">No. Rujukan</td>
              <td class="w-4 py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.referenceNo }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Majikan</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.payerName }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">No. SSM</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.payerIdentityNo }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Tempoh</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ MONTHS[receipt.month - 1] }} {{ receipt.year }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Bil. Pekerja</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.rowCount }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Kaedah</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.paymentChannel }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Pusat Kutipan</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">{{ receipt.collectionPoint }}</td>
            </tr>
            <tr>
              <td class="py-1.5 align-top font-semibold text-slate-500">Status</td>
              <td class="py-1.5 text-slate-400">:</td>
              <td class="py-1.5 text-slate-900">Menunggu Pengesahan</td>
            </tr>
          </tbody>
        </table>

        <!-- Employee line items -->
        <div v-if="receipt.rows.length" class="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50 text-left">
                <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">No.</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">No. KP</th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Amaun</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(row, idx) in receipt.rows" :key="idx">
                <td class="px-3 py-2 text-slate-600">{{ idx + 1 }}</td>
                <td class="px-3 py-2 text-slate-900">{{ row.employeeName }}</td>
                <td class="px-3 py-2 text-slate-600">{{ row.employeeIdentityNo }}</td>
                <td class="px-3 py-2 text-right font-semibold text-slate-900">{{ moneyFormat(row.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
          <span class="text-base font-semibold text-slate-700">Jumlah Keseluruhan</span>
          <span class="text-2xl font-bold text-emerald-700">{{ moneyFormat(receipt.totalAmount) }}</span>
        </div>
      </template>

      <div class="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Wallet class="h-4 w-4" />
        <span>
          {{ receipt.type === "spg"
            ? "Batch SPG telah dihantar. Menunggu pengesahan daripada pihak pengurusan."
            : "Pembayaran telah diterima dan direkodkan. Terima kasih."
          }}
        </span>
      </div>
    </div>

    <!-- New payment button -->
    <button
      class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-xl font-bold text-blue-700 shadow-2xl hover:bg-blue-50"
      @click="$emit('reset')"
    >
      <RefreshCw class="h-6 w-6" />
      Bayaran Baru
    </button>
  </div>
</template>
