<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Building2, Eye, Plus, Search } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listCorporateDirectory } from "@/api/cms";
import type { CorporateDirectoryCategory, CorporateDirectoryRow } from "@/types";

const rows = ref<CorporateDirectoryRow[]>([]);
const loading = ref(false);
const q = ref("");
const category = ref<CorporateDirectoryCategory>("all");

async function load() {
  loading.value = true;
  try {
    const res = await listCorporateDirectory({
      q: q.value || undefined,
      category: category.value,
      limit: 100,
      page: 1,
    });
    rows.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="page-title">Korporat / Syarikat - Senarai</h1>
        <router-link
          to="/payers/corporate/new"
          class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Plus class="h-4 w-4" />
          Daftar Baru
        </router-link>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Building2 class="h-4 w-4 text-blue-600" />
              <h2 class="text-sm font-semibold text-slate-900">Senarai Pembayar Korporat / SPG</h2>
              <span class="ml-1 text-xs text-slate-500">{{ rows.length }} rekod</span>
            </div>
            <div class="flex items-center gap-2">
              <select v-model="category" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm">
                <option value="all">Semua</option>
                <option value="payer">Payer</option>
                <option value="spg">SPG</option>
                <option value="both">Payer &amp; SPG</option>
              </select>
              <div class="relative">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="q"
                  placeholder="Carian SSM / nama / emel..."
                  class="w-64 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  @keyup.enter="load"
                />
              </div>
              <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50" @click="load">Cari</button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">SSM</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Syarikat</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kategori</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 text-slate-600">{{ row.ssmNo || "-" }}</td>
                <td class="px-4 py-2 text-slate-800">{{ row.companyName }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.email || "-" }}</td>
                <td class="px-4 py-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="row.category === 'both' ? 'bg-indigo-100 text-indigo-700' : row.category === 'spg' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ row.category === "both" ? "Payer & SPG" : row.category === "spg" ? "SPG" : "Payer" }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : row.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'"
                  >
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link
                      :to="`/payers/${row.id}`"
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Lihat</span>
                    </router-link>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && rows.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Tiada rekod</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
