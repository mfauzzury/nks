<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getSourceCategories, saveSourceCategories } from "@/api/cms";
import type { SourceCategoryConfig } from "@/types";

const router = useRouter();
const rows = ref<SourceCategoryConfig[]>([]);
const saving = ref(false);
const saved = ref(false);
const error = ref("");

async function load() {
  try {
    const res = await getSourceCategories();
    rows.value = res.data.categories;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan kategori sumber";
  }
}

function addRow() {
  rows.value.push({ code: "", name: "", isActive: true, notes: "" });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload = rows.value
      .map((r) => ({ ...r, code: r.code.trim().toUpperCase(), name: r.name.trim(), notes: (r.notes || "").trim() }))
      .filter((r) => r.code && r.name);
    await saveSourceCategories(payload);
    rows.value = payload;
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal menyimpan kategori sumber";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="page-title">Konfigurasi Zakat - Kategori Sumber</h1>
        <div class="flex items-center gap-2">
          <button class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="router.push('/zakat-config/source-data')">Sumber Data</button>
          <button class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="addRow">Tambah Kategori</button>
        </div>
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
              <tr v-for="(row, idx) in rows" :key="idx">
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
                <td colspan="5" class="px-3 py-6 text-center text-slate-400">Tiada rekod kategori sumber.</td>
              </tr>
            </tbody>
          </table>
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
