<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getPaymentGateways, savePaymentGateways } from "@/api/cms";
import type { PaymentGatewayConfig } from "@/types";

const rows = ref<PaymentGatewayConfig[]>([]);
const saving = ref(false);
const saved = ref(false);
const error = ref("");
const page = ref(1);
const limit = ref(20);
const total = computed(() => rows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value;
  return rows.value.slice(start, start + limit.value);
});

async function load() {
  try {
    const res = await getPaymentGateways();
    rows.value = res.data.gateways;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan gerbang pembayaran";
  }
}

function addRow() {
  rows.value.push({ code: "", name: "", isActive: true, notes: "" });
}

function removeRow(index: number) {
  const absoluteIndex = (page.value - 1) * limit.value + index;
  rows.value.splice(absoluteIndex, 1);
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload = rows.value
      .map((r) => ({ ...r, code: r.code.trim().toUpperCase(), name: r.name.trim(), notes: (r.notes || "").trim() }))
      .filter((r) => r.code && r.name);
    await savePaymentGateways(payload);
    rows.value = payload;
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal menyimpan gerbang pembayaran";
  } finally {
    saving.value = false;
  }
}

function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
}

function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Konfigurasi Zakat - Gerbang Pembayaran</h1>
        <button class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="addRow">Tambah Gerbang</button>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-3 py-2">Kod</th>
                <th class="px-3 py-2">Nama</th>
                <th class="px-3 py-2">Aktif</th>
                <th class="px-3 py-2">Nota</th>
                <th class="px-3 py-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in pagedRows" :key="(page - 1) * limit + idx">
                <td class="px-3 py-2"><input v-model="row.code" class="w-full rounded border border-slate-300 px-2 py-1.5" /></td>
                <td class="px-3 py-2"><input v-model="row.name" class="w-full rounded border border-slate-300 px-2 py-1.5" /></td>
                <td class="px-3 py-2">
                  <label class="inline-flex items-center gap-2">
                    <input v-model="row.isActive" type="checkbox" />
                    <span>{{ row.isActive ? "Ya" : "Tidak" }}</span>
                  </label>
                </td>
                <td class="px-3 py-2"><input v-model="row.notes" class="w-full rounded border border-slate-300 px-2 py-1.5" /></td>
                <td class="px-3 py-2 text-right">
                  <button class="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50" @click="removeRow(idx)">Buang</button>
                </td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="5" class="px-3 py-6 text-center text-slate-400">Tiada rekod gerbang pembayaran.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-xs text-slate-500">Papar {{ total === 0 ? 0 : (page - 1) * limit + 1 }}-{{ Math.min(total, page * limit) }} daripada {{ total }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="page <= 1" @click="prevPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ page }} / {{ totalPages }}</span>
            <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 disabled:opacity-50" :disabled="page >= totalPages" @click="nextPage">Next</button>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <button class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" :disabled="saving" @click="save">
            {{ saving ? "Menyimpan..." : "Simpan" }}
          </button>
          <span v-if="saved" class="text-sm text-emerald-700">Disimpan</span>
          <span v-if="error" class="text-sm text-rose-700">{{ error }}</span>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
