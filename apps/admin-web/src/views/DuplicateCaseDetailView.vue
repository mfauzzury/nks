<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { executeMerge, getDuplicateCase, rejectDuplicateCase } from "@/api/cms";
import type { DuplicateCase } from "@/types";

const route = useRoute();
const router = useRouter();
const row = ref<DuplicateCase | null>(null);
const notes = ref("");
const masterPayerId = ref("");
const mergedPayerId = ref("");

const caseId = computed(() => Number(route.params.id));

async function load() {
  const res = await getDuplicateCase(caseId.value);
  row.value = res.data;
}

async function mergeNow() {
  if (!row.value) return;
  await executeMerge({
    masterPayerId: Number(masterPayerId.value),
    mergedPayerId: Number(mergedPayerId.value),
    duplicateCaseId: row.value.id,
    conflictResolution: {},
  });
  await router.push("/duplicates");
}

async function rejectCase() {
  await rejectDuplicateCase(caseId.value, notes.value || undefined);
  await router.push("/duplicates");
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Perbandingan Kes Pendua</h1>
      <article v-if="row" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 text-sm text-slate-600">Case #{{ row.id }} | Status: {{ row.status }}</div>
        <div class="space-y-4">
          <div v-for="match in row.matches" :key="match.id" class="rounded border border-slate-200 p-3">
            <div class="text-sm">Skor: {{ match.matchScore }}</div>
            <div class="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded border border-slate-100 p-2">
                <div class="text-xs text-slate-500">SPG Employee</div>
                <div class="font-medium">{{ match.matchedSpgEmployee.employeeName }}</div>
                <div class="text-sm text-slate-600">{{ match.matchedSpgEmployee.employeeIdentityNo }}</div>
              </div>
              <div class="rounded border border-slate-100 p-2">
                <div class="text-xs text-slate-500">Individu Candidate</div>
                <div class="font-medium">{{ match.candidatePayer.displayName }}</div>
                <div class="text-sm text-slate-600">{{ match.candidatePayer.identityNo }}</div>
              </div>
            </div>
            <div class="mt-3">
              <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
                <input v-model="masterPayerId" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Master Payer ID" />
                <input v-model="mergedPayerId" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Merged Payer ID" />
                <button class="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white" @click="mergeNow">Execute Merge</button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-slate-100 pt-4">
          <textarea v-model="notes" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" rows="3" placeholder="Catatan penolakan"></textarea>
          <button class="mt-2 rounded bg-rose-600 px-3 py-2 text-sm text-white" @click="rejectCase">Reject Case</button>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
