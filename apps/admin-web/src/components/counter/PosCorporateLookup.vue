<script setup lang="ts">
import { reactive, ref } from "vue";
import { Building2, Search, UserPlus } from "lucide-vue-next";
import { lookupPayerBySsm, quickRegisterCorporate } from "@/api/cms";

export type CorporatePayer = {
  id: number;
  displayName: string;
  identityNo: string;
  email: string;
  phone: string;
  payerType: string;
  companyName: string;
  ssmNo: string;
  registered: boolean;
};

const emit = defineEmits<{
  found: [payer: CorporatePayer];
  back: [];
}>();

const ssmNo = ref("");
const lookupLoading = ref(false);
const lookupNotFound = ref(false);
const error = ref("");

const lookupResult = ref<{
  id: number;
  displayName: string;
  identityNo: string;
  email: string | null;
  phone: string | null;
  payerType: string;
  corporate: { companyName: string; ssmNo: string; companyType: string | null } | null;
} | null>(null);

const showQuickRegister = ref(false);
const regForm = reactive({ companyName: "", representativeName: "", email: "", phone: "" });
const registering = ref(false);

async function doLookup() {
  if (!ssmNo.value.trim()) return;
  lookupLoading.value = true;
  lookupNotFound.value = false;
  lookupResult.value = null;
  showQuickRegister.value = false;
  error.value = "";
  try {
    const res = await lookupPayerBySsm(ssmNo.value.trim());
    lookupResult.value = res.data;
  } catch {
    lookupNotFound.value = true;
  } finally {
    lookupLoading.value = false;
  }
}

function emitFromResult() {
  if (!lookupResult.value) return;
  emit("found", {
    id: lookupResult.value.id,
    displayName: lookupResult.value.corporate?.companyName || lookupResult.value.displayName,
    identityNo: lookupResult.value.corporate?.ssmNo || lookupResult.value.identityNo,
    email: lookupResult.value.email || "",
    phone: lookupResult.value.phone || "",
    payerType: lookupResult.value.payerType,
    companyName: lookupResult.value.corporate?.companyName || lookupResult.value.displayName,
    ssmNo: lookupResult.value.corporate?.ssmNo || lookupResult.value.identityNo,
    registered: true,
  });
}

function continueWithoutRegister() {
  emit("found", {
    id: 0,
    displayName: ssmNo.value,
    identityNo: ssmNo.value,
    email: "",
    phone: "",
    payerType: "korporat",
    companyName: ssmNo.value,
    ssmNo: ssmNo.value,
    registered: false,
  });
}

function startQuickRegister() {
  showQuickRegister.value = true;
  Object.assign(regForm, { companyName: "", representativeName: "", email: "", phone: "" });
}

async function submitQuickRegister() {
  if (!regForm.companyName.trim()) return;
  registering.value = true;
  error.value = "";
  try {
    const res = await quickRegisterCorporate({
      companyName: regForm.companyName.trim(),
      ssmNo: ssmNo.value.trim(),
      representativeName: regForm.representativeName || undefined,
      email: regForm.email || undefined,
      phone: regForm.phone || undefined,
    });
    emit("found", {
      id: res.data.id,
      displayName: regForm.companyName.trim(),
      identityNo: ssmNo.value.trim(),
      email: regForm.email,
      phone: regForm.phone,
      payerType: res.data.payerType || "korporat",
      companyName: regForm.companyName.trim(),
      ssmNo: ssmNo.value.trim(),
      registered: true,
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Pendaftaran gagal. Sila cuba lagi.";
  } finally {
    registering.value = false;
  }
}
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-2xl">
    <div class="mb-4 flex items-center gap-3">
      <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="$emit('back')">
        &larr;
      </button>
      <h2 class="text-2xl font-bold text-slate-800">Carian Syarikat</h2>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="doLookup">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600">No. Pendaftaran SSM</label>
        <input
          v-model="ssmNo"
          placeholder="Cth: 202301012345 / 12345-A"
          autofocus
          class="w-full rounded-xl border-2 border-slate-200 px-5 py-4 text-center text-xl tracking-wider focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <button
        :disabled="lookupLoading || !ssmNo.trim()"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Search class="h-5 w-5" />
        {{ lookupLoading ? "Mencari..." : "Cari" }}
      </button>
    </form>

    <!-- Found result -->
    <div v-if="lookupResult" class="mt-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
      <p class="text-sm font-medium text-emerald-600">Syarikat dijumpai</p>
      <div class="mt-2 flex items-center justify-center gap-2">
        <Building2 class="h-6 w-6 text-emerald-600" />
        <p class="text-2xl font-bold text-slate-900">
          {{ lookupResult.corporate?.companyName || lookupResult.displayName }}
        </p>
      </div>
      <p class="mt-1 text-sm text-slate-500">SSM: {{ lookupResult.corporate?.ssmNo || lookupResult.identityNo }}</p>
      <button
        class="mt-4 rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
        @click="emitFromResult"
      >
        Seterusnya
      </button>
    </div>

    <!-- Not found -->
    <div v-if="lookupNotFound && !showQuickRegister" class="mt-6 text-center">
      <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
        <p class="text-lg font-semibold text-amber-800">Tiada rekod dijumpai</p>
        <p class="mt-1 text-sm text-amber-600">
          No. SSM {{ ssmNo }} tidak berdaftar dalam sistem.
        </p>
        <div class="mt-4 flex items-center justify-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            @click="startQuickRegister"
          >
            <UserPlus class="h-5 w-5" />
            Daftar Syarikat
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
            @click="continueWithoutRegister"
          >
            Teruskan Tanpa Daftar
          </button>
        </div>
      </div>
    </div>

    <!-- Quick registration form -->
    <div v-if="showQuickRegister" class="mt-6">
      <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
        <h3 class="mb-4 text-center text-lg font-bold text-slate-800">Pendaftaran Syarikat</h3>
        <form class="space-y-3" @submit.prevent="submitQuickRegister">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Nama Syarikat</label>
            <input
              v-model="regForm.companyName"
              required
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Nama Wakil</label>
            <input
              v-model="regForm.representativeName"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Email</label>
            <input
              v-model="regForm.email"
              type="email"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">No. Telefon</label>
            <input
              v-model="regForm.phone"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            :disabled="registering || !regForm.companyName.trim()"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus class="h-5 w-5" />
            {{ registering ? "Mendaftar..." : "Daftar & Teruskan" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
