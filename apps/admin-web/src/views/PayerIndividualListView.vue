<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Plus, Search, UserRound, Eye } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listIndividualDirectory } from "@/api/cms";
import type { IndividualDirectoryCategory, IndividualDirectoryRow } from "@/types";

const rows = ref<IndividualDirectoryRow[]>([]);
const loading = ref(false);
const q = ref("");
const category = ref<IndividualDirectoryCategory>("all");

async function load() {
  loading.value = true;
  try {
    const res = await listIndividualDirectory({
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
        <h1 class="page-title">Individu - Senarai</h1>
        <router-link
          to="/payers/individual/new"
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
              <UserRound class="h-4 w-4 text-blue-600" />
              <h2 class="text-sm font-semibold text-slate-900">Senarai Pembayar Individu</h2>
              <span class="ml-1 text-xs text-slate-500">{{ rows.length }} rekod</span>
            </div>
            <div class="flex items-center gap-2">
              <select v-model="category" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm">
                <option value="all">Semua</option>
                <option value="registered">Berdaftar</option>
                <option value="unregistered">Tidak Berdaftar (Ada Sumbangan)</option>
              </select>
              <div class="relative">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="q"
                  placeholder="Carian IC / nama / emel..."
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
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">IC/Passport</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kategori</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Sumber</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id ?? `unregistered-${row.identityNo}`" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 text-slate-600">{{ row.identityNo || "-" }}</td>
                <td class="px-4 py-2 text-slate-800">{{ row.displayName }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.email || "-" }}</td>
                <td class="px-4 py-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="row.registrationState === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ row.registrationState === "registered" ? "Berdaftar" : "Tidak Berdaftar" }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1.5">
                    <span v-if="row.hasDirectContribution" class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Direct Pay ({{ row.directContributionCount }})
                    </span>
                    <span v-if="row.hasEmployerContribution" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                      Majikan/SPG ({{ row.employerContributionCount }})
                    </span>
                    <span v-if="!row.hasDirectContribution && !row.hasEmployerContribution" class="text-xs text-slate-400">-</span>
                  </div>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link
                      v-if="row.id"
                      :to="`/payers/${row.id}`"
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Lihat</span>
                    </router-link>
                    <span v-else class="text-xs text-slate-400">-</span>
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
