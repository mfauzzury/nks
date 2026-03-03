<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createSpgEmployer } from "@/api/cms";

const router = useRouter();
const saving = ref(false);
const form = reactive({
  displayName: "",
  identityNo: "",
  email: "",
  phone: "",
  agreementNo: "",
  agreementEffectiveDate: "",
  agreementExpiryDate: "",
  deductionMode: "fixed" as "fixed" | "percent",
  deductionValue: "",
  deductionCap: "",
});

async function submit() {
  saving.value = true;
  try {
    const res = await createSpgEmployer({
      displayName: form.displayName,
      identityNo: form.identityNo || undefined,
      identityType: "other",
      email: form.email || undefined,
      phone: form.phone || undefined,
      agreementNo: form.agreementNo || undefined,
      agreementEffectiveDate: form.agreementEffectiveDate ? new Date(form.agreementEffectiveDate).toISOString() : undefined,
      agreementExpiryDate: form.agreementExpiryDate ? new Date(form.agreementExpiryDate).toISOString() : undefined,
      deductionMode: form.deductionMode,
      deductionValue: form.deductionValue ? Number(form.deductionValue) : undefined,
      deductionCap: form.deductionCap ? Number(form.deductionCap) : undefined,
    });
    await router.push(`/payers/${res.data.id}`);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <h1 class="page-title">Daftar Majikan SPG</h1>
      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input v-model="form.displayName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama majikan" />
          <input v-model="form.identityNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No rujukan majikan" />
          <input v-model="form.email" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Email" />
          <input v-model="form.phone" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No telefon" />
          <input v-model="form.agreementNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No perjanjian SPG" />
          <select v-model="form.deductionMode" class="rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="fixed">fixed</option>
            <option value="percent">percent</option>
          </select>
          <input v-model="form.agreementEffectiveDate" type="date" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input v-model="form.agreementExpiryDate" type="date" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input v-model="form.deductionValue" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nilai potongan" />
          <input v-model="form.deductionCap" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Had potongan" />
        </div>
        <div class="mt-4">
          <button class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" :disabled="saving" @click="submit">
            {{ saving ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
