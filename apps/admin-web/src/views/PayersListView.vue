<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Search, UserPlus } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listPayers } from "@/api/cms";
import type { PayerProfile, PayerStatus, PayerType } from "@/types";

const rows = ref<PayerProfile[]>([]);
const loading = ref(false);
const q = ref("");
const type = ref<PayerType | "">("");
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
      page: page.value,
      limit: limit.value,
      q: q.value || undefined,
      type: type.value || undefined,
      status: status.value || undefined,
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
        <h1 class="page-title">Pengurusan Profil Pembayar</h1>
        <div class="flex gap-2">
          <router-link to="/payers/individual/new" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Daftar Individu</router-link>
          <router-link to="/payers/corporate/new" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Daftar Korporat</router-link>
          <router-link to="/payers/spg/new" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Daftar Majikan SPG</router-link>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-4">
          <input v-model="q" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Carian kod/nama/ID" />
          <select v-model="type" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua Jenis</option>
            <option value="individu">Individu</option>
            <option value="korporat">Korporat</option>
            <option value="majikan_spg">Majikan SPG</option>
          </select>
          <select v-model="status" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="suspended">Gantung</option>
            <option value="merged">Merged</option>
          </select>
          <button class="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800" @click="search">
            <Search class="h-4 w-4" /> Cari
          </button>
        </div>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2">Kod</th>
                <th class="px-4 py-2">Nama</th>
                <th class="px-4 py-2">Jenis</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2">Blacklist</th>
                <th class="px-4 py-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="payer in rows" :key="payer.id">
                <td class="px-4 py-2 font-medium">{{ payer.payerCode }}</td>
                <td class="px-4 py-2">{{ payer.displayName }}</td>
                <td class="px-4 py-2">{{ payer.payerType }}</td>
                <td class="px-4 py-2">{{ payer.status }}</td>
                <td class="px-4 py-2">{{ payer.isBlacklisted ? "Ya" : "Tidak" }}</td>
                <td class="px-4 py-2 text-right">
                  <router-link :to="`/payers/${payer.id}`" class="text-blue-600 hover:underline">Lihat</router-link>
                </td>
              </tr>
              <tr v-if="!loading && rows.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Tiada rekod</td>
              </tr>
              <tr v-if="loading">
                <td colspan="6" class="px-4 py-6 text-center text-slate-400">Memuatkan...</td>
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

      <div class="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        <router-link to="/duplicates" class="inline-flex items-center gap-2 text-blue-700 hover:underline">
          <UserPlus class="h-4 w-4" /> Pergi ke Senarai Potensi Pendua
        </router-link>
      </div>
    </div>
  </AdminLayout>
</template>
