<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Briefcase, Eye, Plus, Search, Users } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listPayers } from "@/api/cms";
import type { PayerProfile, PayerStatus } from "@/types";

const rows = ref<PayerProfile[]>([]);
const loading = ref(false);
const q = ref("");
const status = ref<PayerStatus | "">("");
const page = ref(1);
const limit = ref(20);
const total = ref(0);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));

async function load() {
  loading.value = true;
  try {
    const res = await listPayers({
      type: "majikan_spg",
      q: q.value || undefined,
      status: status.value || undefined,
      limit: limit.value,
      page: page.value,
    });
    rows.value = res.data;
    const meta = (res.meta || {}) as { total?: number };
    total.value = Number(meta.total || 0);
  } finally {
    loading.value = false;
  }
}

async function search() {
  page.value = 1;
  await load();
}

async function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
  await load();
}

async function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await load();
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="page-title">Skim Potongan Gaji (SPG) - Senarai</h1>
        <router-link
          to="/payers/spg/new"
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
              <Briefcase class="h-4 w-4 text-blue-600" />
              <h2 class="text-sm font-semibold text-slate-900">Senarai Majikan SPG</h2>
              <span class="ml-1 text-xs text-slate-500">{{ rows.length }} rekod</span>
            </div>
            <div class="flex items-center gap-2">
              <select v-model="status" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm">
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="suspended">Gantung</option>
                <option value="merged">Merged</option>
              </select>
              <div class="relative">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="q"
                  placeholder="Carian majikan / kod pembayar..."
                  class="w-64 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  @keyup.enter="search"
                />
              </div>
              <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50" @click="search">
                Cari
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kod</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Majikan</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-700">{{ row.payerCode }}</td>
                <td class="px-4 py-2 text-slate-800">{{ row.displayName }}</td>
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
                      :to="`/spg/employers/${row.id}/employees`"
                      class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Users class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Pekerja</span>
                    </router-link>
                    <router-link
                      :to="`/payers/${row.id}`"
                      class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Lihat</span>
                    </router-link>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="4" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
              </tr>
              <tr v-if="!loading && rows.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-slate-400">Tiada rekod</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
          <p class="text-xs text-slate-500">Papar {{ fromRow }}-{{ toRow }} daripada {{ total }} rekod</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page <= 1" @click="prevPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ page }} / {{ totalPages }}</span>
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page >= totalPages" @click="nextPage">Next</button>
          </div>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
