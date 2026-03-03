<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createIndividualPayer } from "@/api/cms";

const router = useRouter();
const saving = ref(false);
const form = reactive({
  displayName: "",
  fullName: "",
  mykadOrPassport: "",
  email: "",
  phone: "",
  occupation: "",
  incomeSource: "",
});

async function submit() {
  saving.value = true;
  try {
    const res = await createIndividualPayer({
      displayName: form.displayName || form.fullName,
      fullName: form.fullName,
      mykadOrPassport: form.mykadOrPassport,
      identityNo: form.mykadOrPassport,
      identityType: "mykad",
      email: form.email || undefined,
      phone: form.phone || undefined,
      occupation: form.occupation || undefined,
      incomeSource: form.incomeSource || undefined,
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
      <h1 class="page-title">Daftar Pembayar Individu</h1>
      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input v-model="form.fullName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama penuh" />
          <input v-model="form.displayName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Display name (optional)" />
          <input v-model="form.mykadOrPassport" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No MyKad/Passport" />
          <input v-model="form.email" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Email" />
          <input v-model="form.phone" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No telefon" />
          <input v-model="form.occupation" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Pekerjaan" />
          <input v-model="form.incomeSource" class="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Sumber pendapatan" />
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
