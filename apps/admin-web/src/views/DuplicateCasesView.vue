<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listDuplicateCases } from "@/api/cms";
import type { DuplicateCase, DuplicateCaseStatus } from "@/types";

const rows = ref<DuplicateCase[]>([]);
const status = ref<DuplicateCaseStatus | "">("");
const page = ref(1);
const limit = ref(20);
const total = ref(0);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));

async function load() {
  const res = await listDuplicateCases({ status: status.value || undefined, page: page.value, limit: limit.value });
  rows.value = res.data;
  const meta = (res.meta || {}) as { total?: number };
  total.value = Number(meta.total || 0);
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
      <div class="flex items-center justify-between gap-2">
        <h1 class="page-title">Senarai Potensi Pendua (SPG vs Individu)</h1>
        <router-link
          to="/reconciliation/account-merge"
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Account Merge Page
        </router-link>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex gap-2">
          <select v-model="status" class="rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="open">open</option>
            <option value="reviewed">reviewed</option>
            <option value="merged">merged</option>
            <option value="rejected">rejected</option>
          </select>
          <button class="rounded bg-slate-900 px-3 py-2 text-sm text-white" @click="search">Tapis</button>
        </div>
      </div>
      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2">Case ID</th>
                <th class="px-4 py-2">Sumber</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2">Dikesan</th>
                <th class="px-4 py-2">Padanan</th>
                <th class="px-4 py-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in rows" :key="item.id">
                <td class="px-4 py-2 font-medium">#{{ item.id }}</td>
                <td class="px-4 py-2">{{ item.source }}</td>
                <td class="px-4 py-2">{{ item.status }}</td>
                <td class="px-4 py-2">{{ new Date(item.detectedAt).toLocaleString() }}</td>
                <td class="px-4 py-2">{{ item.matches.length }}</td>
                <td class="px-4 py-2 text-right">
                  <router-link :to="`/duplicates/${item.id}`" class="text-blue-600 hover:underline">Buka</router-link>
                </td>
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
