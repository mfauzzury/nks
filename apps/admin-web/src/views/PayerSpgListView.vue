<script setup lang="ts">
import { onMounted, ref } from "vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listPayers } from "@/api/cms";
import type { PayerProfile } from "@/types";

const rows = ref<PayerProfile[]>([]);
const loading = ref(false);
const q = ref("");

async function load() {
  loading.value = true;
  try {
    const res = await listPayers({ type: "majikan_spg", q: q.value || undefined, limit: 100, page: 1 });
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
        <h1 class="page-title">Skim Potongan Gaji (SPG) - Senarai</h1>
        <router-link to="/payers/spg/new" class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Daftar Baru</router-link>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex gap-2">
          <input v-model="q" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Carian majikan / kod pembayar" />
          <button class="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="load">Cari</button>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2">Kod</th>
                <th class="px-4 py-2">Nama Majikan</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in rows" :key="row.id">
                <td class="px-4 py-2">{{ row.payerCode }}</td>
                <td class="px-4 py-2">{{ row.displayName }}</td>
                <td class="px-4 py-2">{{ row.status }}</td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <router-link :to="`/spg/employers/${row.id}/employees`" class="text-emerald-700 hover:underline">Pekerja</router-link>
                    <router-link :to="`/payers/${row.id}`" class="text-blue-600 hover:underline">Lihat</router-link>
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
      </article>
    </div>
  </AdminLayout>
</template>
