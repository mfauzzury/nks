<script setup lang="ts">
import { onMounted, ref } from "vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listDuplicateCases } from "@/api/cms";
import type { DuplicateCase, DuplicateCaseStatus } from "@/types";

const rows = ref<DuplicateCase[]>([]);
const status = ref<DuplicateCaseStatus | "">("");

async function load() {
  const res = await listDuplicateCases(status.value || undefined);
  rows.value = res.data;
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Senarai Potensi Pendua (SPG vs Individu)</h1>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex gap-2">
          <select v-model="status" class="rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="open">open</option>
            <option value="reviewed">reviewed</option>
            <option value="merged">merged</option>
            <option value="rejected">rejected</option>
          </select>
          <button class="rounded bg-slate-900 px-3 py-2 text-sm text-white" @click="load">Tapis</button>
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
      </article>
    </div>
  </AdminLayout>
</template>
