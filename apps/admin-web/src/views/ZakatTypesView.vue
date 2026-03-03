<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, ScrollText, Pencil } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getZakatTypes } from "@/api/cms";
import type { ZakatTypeConfig } from "@/types";

const router = useRouter();
const rows = ref<ZakatTypeConfig[]>([]);
const error = ref("");

async function load() {
  try {
    const res = await getZakatTypes();
    rows.value = res.data.types;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan jenis zakat";
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Konfigurasi Zakat - Jenis Zakat</h1>
        <button
          class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          @click="router.push('/zakat-config/types/new')"
        >
          <Plus class="h-4 w-4" />
          Tambah Jenis
        </button>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <ScrollText class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Senarai Jenis Zakat</h2>
          <span class="ml-1 text-xs text-slate-500">{{ rows.length }} rekod</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kod</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Template</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kalkulator</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in rows" :key="idx" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-900">{{ row.code }}</td>
                <td class="px-4 py-2 text-slate-800">{{ row.name }}</td>
                <td class="px-4 py-2">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ row.uiTemplate || "standard_year_amount" }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="rounded-full px-2 py-0.5 text-xs" :class="(row.calculator?.mode || 'none') === 'formula' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                    {{ (row.calculator?.mode || 'none') === 'formula' ? 'Ya' : 'Tidak' }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <span :class="row.isActive ? 'text-emerald-700' : 'text-slate-500'" class="text-sm font-medium">
                    {{ row.isActive ? "Ya" : "Tidak" }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      @click="router.push(`/zakat-config/types/${row.code}`)"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-sm text-slate-400">Tiada jenis zakat.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="error" class="mt-3 text-sm text-rose-700">{{ error }}</div>
      </article>
    </div>
  </AdminLayout>
</template>
