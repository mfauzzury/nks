<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createSpgEmployee, getPayer, importSpgEmployees, listSpgEmployees, updateSpgEmployee } from "@/api/cms";
import type { SpgEmployee } from "@/types";

const route = useRoute();
const payerId = computed(() => Number(route.params.payerId));
const employerName = ref("");
const allRows = ref<SpgEmployee[]>([]);
const page = ref(1);
const limit = ref(20);
const total = computed(() => allRows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));
const rows = computed(() => {
  const start = (page.value - 1) * limit.value;
  return allRows.value.slice(start, start + limit.value);
});
const employee = reactive({
  employeeIdentityNo: "",
  employeeName: "",
  employeeEmail: "",
  employeePhone: "",
  deductionAmount: "",
  employmentStatus: "",
});
const bulkText = ref("");

// Inline edit state
const editingId = ref<number | null>(null);
const editAmount = ref("");

function startEdit(row: SpgEmployee) {
  editingId.value = row.id;
  editAmount.value = row.deductionAmount ? String(Number(row.deductionAmount)) : "";
}

async function saveDeductionAmount(id: number) {
  await updateSpgEmployee(id, {
    deductionAmount: editAmount.value ? Number(editAmount.value) : undefined,
  });
  editingId.value = null;
  await load();
}

async function load() {
  const [res, payerRes] = await Promise.all([
    listSpgEmployees(payerId.value),
    !employerName.value ? getPayer(payerId.value) : Promise.resolve(null),
  ]);
  allRows.value = res.data;
  if (payerRes) employerName.value = payerRes.data.displayName;
  if (page.value > totalPages.value) page.value = totalPages.value;
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

function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
}

function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Pekerja SPG - {{ employerName || `Majikan #${payerId}` }}</h1>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-2 font-semibold">Tambah Pekerja</h3>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input v-model="employee.employeeIdentityNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No IC/Passport" />
          <input v-model="employee.employeeName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama" />
          <input v-model="employee.employeeEmail" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Email" />
          <input v-model="employee.employeePhone" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Telefon" />
          <input v-model="employee.deductionAmount" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Potongan (RM)" type="number" step="0.01" />
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
                <th class="px-4 py-2">Potongan (RM)</th>
                <th class="px-4 py-2">Linked Payer</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="r in rows" :key="r.id">
                <td class="px-4 py-2">{{ r.employeeIdentityNo }}</td>
                <td class="px-4 py-2">{{ r.employeeName }}</td>
                <td class="px-4 py-2">{{ r.employeeEmail || "-" }}</td>
                <td class="px-4 py-2">{{ r.employeePhone || "-" }}</td>
                <td class="px-4 py-2">
                  <template v-if="editingId === r.id">
                    <div class="flex items-center gap-1">
                      <input
                        v-model="editAmount"
                        class="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <button class="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700" @click="saveDeductionAmount(r.id)">Simpan</button>
                      <button class="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100" @click="editingId = null">Batal</button>
                    </div>
                  </template>
                  <template v-else>
                    <span
                      v-if="r.deductionAmount"
                      class="cursor-pointer hover:text-blue-600"
                      @click="startEdit(r)"
                    >
                      {{ Number(r.deductionAmount).toFixed(2) }}
                    </span>
                    <span
                      v-else
                      class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
                      @click="startEdit(r)"
                    >
                      Belum ditetapkan
                    </span>
                  </template>
                </td>
                <td class="px-4 py-2">{{ r.linkedIndividualPayerId || "-" }}</td>
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
