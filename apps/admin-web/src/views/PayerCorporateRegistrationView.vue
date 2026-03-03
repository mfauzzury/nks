<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { createCorporatePayer } from "@/api/cms";

const router = useRouter();
const saving = ref(false);
const form = reactive({
  displayName: "",
  companyName: "",
  ssmNo: "",
  companyType: "",
  taxNo: "",
  taxBranch: "",
  repName: "",
  repIcNo: "",
  repPosition: "",
  repEmail: "",
  repPhone: "",
});

async function submit() {
  saving.value = true;
  try {
    const res = await createCorporatePayer({
      displayName: form.displayName || form.companyName,
      companyName: form.companyName,
      ssmNo: form.ssmNo,
      identityNo: form.ssmNo,
      identityType: "ssm",
      companyType: form.companyType || undefined,
      taxNo: form.taxNo || undefined,
      taxBranch: form.taxBranch || undefined,
      contactPersons: [
        {
          name: form.repName,
          icNo: form.repIcNo || undefined,
          position: form.repPosition || undefined,
          email: form.repEmail || undefined,
          phone: form.repPhone || undefined,
          isAuthorized: true,
        },
      ],
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
      <h1 class="page-title">Daftar Pembayar Korporat</h1>
      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Maklumat Syarikat</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input v-model="form.companyName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama syarikat" />
          <input v-model="form.displayName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Display name (optional)" />
          <input v-model="form.ssmNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No SSM" />
          <input v-model="form.companyType" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Jenis syarikat" />
          <input v-model="form.taxNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No cukai" />
          <input v-model="form.taxBranch" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Cawangan cukai" />
        </div>

        <h3 class="mb-2 mt-4 text-sm font-semibold text-slate-700">Wakil Syarikat</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input v-model="form.repName" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nama wakil" />
          <input v-model="form.repIcNo" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="No IC wakil" />
          <input v-model="form.repPosition" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Jawatan" />
          <input v-model="form.repEmail" class="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Email wakil" />
          <input v-model="form.repPhone" class="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="No telefon wakil" />
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
