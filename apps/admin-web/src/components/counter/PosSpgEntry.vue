<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Banknote, CreditCard, FileCheck, Landmark, Plus, QrCode, ReceiptText, Trash2, Upload, Users, Wallet } from "lucide-vue-next";
import { createCounterSpgBatch } from "@/api/cms";

const props = defineProps<{
  employerPayerId: number;
  companyName: string;
  ssmNo: string;
}>();

const emit = defineEmits<{
  success: [data: {
    batchId: number;
    referenceNo: string;
    totalAmount: number;
    rowCount: number;
    status: string;
    month: number;
    year: number;
    paymentChannel: string;
    collectionPoint: string;
    rows: Array<{ employeeName: string; employeeIdentityNo: string; amount: number }>;
  }];
  back: [];
}>();

const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const month = ref(currentMonth);
const year = ref(currentYear);
const paymentMethodCode = ref<"SLIP_BANK" | "FPX" | "JOMPAY" | "CARD" | "CHEQUE" | "CASH">("CASH");
const collectionPoint = ref("Kaunter Utama");
const notes = ref("");
const submitting = ref(false);
const error = ref("");
const paymentMethods = [
  { code: "SLIP_BANK", label: "Slip Bank", icon: ReceiptText },
  { code: "FPX", label: "FPX B2C/B2B", icon: Landmark },
  { code: "JOMPAY", label: "JomPAY", icon: QrCode },
  { code: "CARD", label: "Debit/Credit Card", icon: CreditCard },
  { code: "CHEQUE", label: "Cek", icon: FileCheck },
  { code: "CASH", label: "Tunai", icon: Banknote },
] as const;
const submitChannel = computed<"COUNTER_CASH" | "CHEQUE" | "FPX_B2B" | "CARD">(() => {
  if (paymentMethodCode.value === "SLIP_BANK") return "CHEQUE";
  if (paymentMethodCode.value === "FPX" || paymentMethodCode.value === "JOMPAY") return "FPX_B2B";
  if (paymentMethodCode.value === "CARD") return "CARD";
  if (paymentMethodCode.value === "CHEQUE") return "CHEQUE";
  return "COUNTER_CASH";
});
const selectedMethodLabel = computed(
  () => paymentMethods.find((m) => m.code === paymentMethodCode.value)?.label || paymentMethodCode.value,
);

type EmployeeRow = {
  id: number;
  employeeName: string;
  employeeIdentityNo: string;
  amount: string;
};

let nextId = 1;
function createRow(): EmployeeRow {
  return { id: nextId++, employeeName: "", employeeIdentityNo: "", amount: "" };
}

const rows = reactive<EmployeeRow[]>([createRow()]);

function addRow() {
  rows.push(createRow());
}

function removeRow(id: number) {
  const idx = rows.findIndex((r) => r.id === id);
  if (idx >= 0 && rows.length > 1) rows.splice(idx, 1);
}

// File upload
const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    rows.splice(0, rows.length);

    for (const raw of data) {
      const name = String(raw["Nama"] || raw["nama"] || raw["Name"] || raw["name"] || raw["NAMA"] || "").trim();
      const ic = String(raw["No KP"] || raw["No. KP"] || raw["no_kp"] || raw["IC"] || raw["ic"] || raw["NO KP"] || "").trim();
      const amt = String(raw["Amaun"] || raw["amaun"] || raw["Amount"] || raw["amount"] || raw["AMAUN"] || "0").replace(/,/g, "");

      if (name || ic) {
        rows.push({ id: nextId++, employeeName: name, employeeIdentityNo: ic, amount: amt });
      }
    }

    if (rows.length === 0) rows.push(createRow());
  } catch {
    error.value = "Gagal membaca fail. Pastikan fail XLSX/CSV yang sah.";
  }

  // Reset file input
  input.value = "";
}

// Validation
const validatedRows = computed(() =>
  rows.map((row) => {
    const errors: string[] = [];
    if (!row.employeeName.trim()) errors.push("Nama diperlukan");
    if (!row.employeeIdentityNo.trim() || row.employeeIdentityNo.trim().length < 3) errors.push("No KP tidak sah");
    const amt = Number(row.amount);
    if (!Number.isFinite(amt) || amt <= 0) errors.push("Amaun tidak sah");
    return { ...row, errors, amount: amt };
  }),
);

const validCount = computed(() => validatedRows.value.filter((r) => r.errors.length === 0).length);
const invalidCount = computed(() => validatedRows.value.filter((r) => r.errors.length > 0).length);
const totalAmount = computed(() =>
  validatedRows.value.reduce((sum, r) => sum + (r.errors.length === 0 ? r.amount : 0), 0),
);

async function submitBatch() {
  error.value = "";
  if (invalidCount.value > 0) {
    error.value = "Sila betulkan semua baris yang tidak sah sebelum menghantar.";
    return;
  }
  if (validCount.value === 0) {
    error.value = "Sila tambah sekurang-kurangnya seorang pekerja.";
    return;
  }

  submitting.value = true;
  try {
    const res = await createCounterSpgBatch({
      employerPayerId: props.employerPayerId,
      month: month.value,
      year: year.value,
      paymentChannel: submitChannel.value,
      collectionPoint: collectionPoint.value,
      rows: validatedRows.value.map((r) => ({
        employeeName: r.employeeName.trim(),
        employeeIdentityNo: r.employeeIdentityNo.trim(),
        amount: r.amount,
      })),
      notes: notes.value || undefined,
    });
    emit("success", {
      ...res.data,
      month: month.value,
      year: year.value,
      paymentChannel: selectedMethodLabel.value,
      collectionPoint: collectionPoint.value,
      rows: validatedRows.value.map((r) => ({
        employeeName: r.employeeName.trim(),
        employeeIdentityNo: r.employeeIdentityNo.trim(),
        amount: r.amount,
      })),
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Penghantaran gagal. Sila cuba lagi.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-2xl">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="$emit('back')">
        &larr;
      </button>
      <div>
        <h2 class="text-xl font-bold text-slate-800">Skim Potongan Gaji (SPG)</h2>
        <p class="text-sm text-slate-500">{{ companyName }} &middot; {{ ssmNo }}</p>
      </div>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Month/Year -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Bulan</label>
        <select
          v-model.number="month"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option v-for="(m, idx) in MONTHS" :key="idx" :value="idx + 1">{{ m }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Tahun</label>
        <select
          v-model.number="year"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option v-for="y in Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i)" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Collection point -->
    <div class="mb-6">
      <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Pusat Kutipan</label>
      <input
        v-model="collectionPoint"
        required
        class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <!-- Employee list header -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Users class="h-4 w-4 text-slate-500" />
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Senarai Pekerja</h3>
      </div>
      <div class="flex items-center gap-2">
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="triggerUpload"
        >
          <Upload class="h-4 w-4" />
          Muat Naik Excel
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="addRow"
        >
          <Plus class="h-4 w-4" />
          Tambah
        </button>
      </div>
    </div>

    <!-- Warning if > 50 rows -->
    <div v-if="rows.length > 50" class="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
      {{ rows.length }} baris — disyorkan tidak melebihi 50 baris untuk kemasukan kaunter.
    </div>

    <!-- Employee table -->
    <div class="mb-4 overflow-x-auto rounded-lg border border-slate-200">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50 text-left">
            <th class="w-12 px-3 py-2 text-xs font-semibold uppercase text-slate-500">No.</th>
            <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama Pekerja</th>
            <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">No. KP</th>
            <th class="w-36 px-3 py-2 text-xs font-semibold uppercase text-slate-500">Amaun (RM)</th>
            <th class="w-12 px-3 py-2" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="(row, idx) in rows" :key="row.id" :class="validatedRows[idx]?.errors.length ? 'bg-red-50/50' : ''">
            <td class="px-3 py-2 text-slate-500">{{ idx + 1 }}</td>
            <td class="px-3 py-1">
              <input
                v-model="row.employeeName"
                placeholder="Nama"
                class="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </td>
            <td class="px-3 py-1">
              <input
                v-model="row.employeeIdentityNo"
                placeholder="No. KP"
                class="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </td>
            <td class="px-3 py-1">
              <input
                v-model="row.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-blue-400 focus:outline-none"
              />
            </td>
            <td class="px-3 py-1 text-center">
              <button
                v-if="rows.length > 1"
                type="button"
                class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                @click="removeRow(row.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary footer -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
      <div class="flex items-center gap-4">
        <span class="text-slate-500">Jumlah baris: <strong class="text-slate-800">{{ rows.length }}</strong></span>
        <span class="text-emerald-600">Sah: <strong>{{ validCount }}</strong></span>
        <span v-if="invalidCount > 0" class="text-red-600">Tidak sah: <strong>{{ invalidCount }}</strong></span>
      </div>
      <div class="text-lg font-bold text-slate-900">
        RM {{ totalAmount.toFixed(2) }}
      </div>
    </div>

    <!-- Payment channel -->
    <div class="mb-6">
      <label class="mb-1 block text-sm font-semibold uppercase tracking-wide text-slate-500">Kaedah Bayaran</label>
      <div class="flex gap-2 overflow-x-auto pt-1 pb-1">
        <button
          v-for="method in paymentMethods"
          :key="method.code"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition"
          :class="paymentMethodCode === method.code ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
          @click="paymentMethodCode = method.code"
        >
          <component :is="method.icon" class="h-4 w-4" :class="paymentMethodCode === method.code ? 'text-blue-600' : 'text-slate-400'" />
          {{ method.label }}
        </button>
      </div>
    </div>

    <!-- Notes -->
    <div class="mb-6">
      <label class="mb-1 block text-sm font-medium text-slate-500">Nota (pilihan)</label>
      <textarea
        v-model="notes"
        rows="2"
        class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <!-- Submit -->
    <button
      :disabled="submitting || validCount === 0"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
      @click="submitBatch"
    >
      <Wallet class="h-5 w-5" />
      {{ submitting ? "Menghantar..." : "Hantar Batch SPG" }}
    </button>
  </div>
</template>
