<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createSpgEmployee, importSpgEmployees, listSpgEmployees } from "@/api/cms";
import type { SpgEmployee } from "@/types";

const route = useRoute();
const payerId = computed(() => Number(route.params.payerId));
const rows = ref<SpgEmployee[]>([]);
const employee = reactive({
  employeeIdentityNo: "",
  employeeName: "",
  employeeEmail: "",
  employeePhone: "",
  deductionAmount: "",
  employmentStatus: "",
});
const bulkText = ref("");

async function load() {
  const res = await listSpgEmployees(payerId.value);
  rows.value = res.data;
}

async function addOne() {
  await createSpgEmployee(payerId.value, {
    employeeIdentityNo: employee.employeeIdentityNo,
    employeeName: employee.employeeName,
    employeeEmail: employee.employeeEmail || undefined,
    employeePhone: employee.employeePhone || undefined,
    deductionAmount: employee.deductionAmount ? Number(employee.deductionAmount) : undefined,
    employmentStatus: employee.employmentStatus || undefined,
  });
  await load();
}

async function importBulk() {
  const parsed = bulkText.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [employeeIdentityNo, employeeName, employeeEmail, employeePhone] = line.split(",");
      return { employeeIdentityNo, employeeName, employeeEmail, employeePhone };
    });
  await importSpgEmployees(payerId.value, parsed);
  await load();
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">SPG Employees - Employer {{ payerId }}</h1>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-2 font-semibold">Tambah Pekerja</h3>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input v-model="employee.employeeIdentityNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No IC/Passport" />
          <input v-model="employee.employeeName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama" />
          <input v-model="employee.employeeEmail" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Email" />
          <input v-model="employee.employeePhone" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Telefon" />
          <input v-model="employee.deductionAmount" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Potongan" />
          <input v-model="employee.employmentStatus" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Status kerja" />
        </div>
        <button class="mt-3 rounded bg-slate-900 px-3 py-2 text-sm text-white" @click="addOne">Tambah</button>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-2 font-semibold">Bulk Import (CSV per line)</h3>
        <p class="mb-2 text-xs text-slate-500">Format: identity_no,name,email,phone</p>
        <textarea v-model="bulkText" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" rows="5"></textarea>
        <button class="mt-2 rounded bg-blue-700 px-3 py-2 text-sm text-white" @click="importBulk">Import</button>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2">Identity</th>
                <th class="px-4 py-2">Nama</th>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Telefon</th>
                <th class="px-4 py-2">Linked Payer</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="r in rows" :key="r.id">
                <td class="px-4 py-2">{{ r.employeeIdentityNo }}</td>
                <td class="px-4 py-2">{{ r.employeeName }}</td>
                <td class="px-4 py-2">{{ r.employeeEmail || "-" }}</td>
                <td class="px-4 py-2">{{ r.employeePhone || "-" }}</td>
                <td class="px-4 py-2">{{ r.linkedIndividualPayerId || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
