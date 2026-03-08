<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Search, UserPlus } from "lucide-vue-next";
import { lookupPayerByIc, quickRegisterPayer } from "@/api/cms";

const emit = defineEmits<{
  found: [payer: { id: number; displayName: string; identityNo: string; email: string; phone: string }];
  back: [];
}>();

const icNo = ref("");
const icDisplay = computed(() => {
  const digits = icNo.value;
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
});

function onIcInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, "");
  icNo.value = raw;
  input.value = icDisplay.value;
}

const lookupLoading = ref(false);
const lookupResult = ref<{
  id: number;
  displayName: string;
  identityNo: string;
  email: string | null;
  phone: string | null;
  individual: { fullName: string } | null;
} | null>(null);
const lookupNotFound = ref(false);
const error = ref("");

const showQuickRegister = ref(false);
const regForm = reactive({ fullName: "", phone: "", email: "", password: "" });
const registering = ref(false);

async function doLookup() {
  if (!icNo.value.trim()) return;
  lookupLoading.value = true;
  lookupNotFound.value = false;
  lookupResult.value = null;
  showQuickRegister.value = false;
  error.value = "";
  try {
    const res = await lookupPayerByIc(icNo.value.trim());
    lookupResult.value = res.data;
  } catch {
    lookupNotFound.value = true;
  } finally {
    lookupLoading.value = false;
  }
}

function emitPayer(payer: { id: number; displayName: string; identityNo: string; email: string; phone: string }) {
  emit("found", payer);
}

function goToPayment() {
  if (!lookupResult.value) return;
  emitPayer({
    id: lookupResult.value.id,
    displayName: lookupResult.value.individual?.fullName || lookupResult.value.displayName,
    identityNo: lookupResult.value.identityNo,
    email: lookupResult.value.email || "",
    phone: lookupResult.value.phone || "",
  });
}

function continueWithoutRegister() {
  emitPayer({
    id: 0,
    displayName: icNo.value,
    identityNo: icNo.value,
    email: "",
    phone: "",
  });
}

function startQuickRegister() {
  showQuickRegister.value = true;
  Object.assign(regForm, { fullName: "", phone: "", email: "", password: "" });
}

async function submitQuickRegister() {
  if (!regForm.fullName.trim()) return;
  registering.value = true;
  error.value = "";
  try {
    const res = await quickRegisterPayer({
      fullName: regForm.fullName.trim(),
      mykadOrPassport: icNo.value.trim(),
      phone: regForm.phone || undefined,
      email: regForm.email || undefined,
      password: regForm.password || undefined,
    });
    emitPayer({
      id: res.data.id,
      displayName: res.data.displayName,
      identityNo: icNo.value.trim(),
      email: regForm.email,
      phone: regForm.phone,
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
      <h2 class="text-2xl font-bold text-slate-800">
        Masukkan No. Kad Pengenalan
      </h2>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="doLookup">
      <input
        :value="icDisplay"
        inputmode="numeric"
        placeholder="000000-00-0000"
        autofocus
        class="w-full rounded-xl border-2 border-slate-200 px-5 py-4 text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        @input="onIcInput"
      />
      <button
        :disabled="lookupLoading || !icNo.trim()"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Search class="h-5 w-5" />
        {{ lookupLoading ? "Mencari..." : "Cari" }}
      </button>
    </form>

    <!-- Found result -->
    <div v-if="lookupResult" class="mt-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
      <p class="text-sm font-medium text-emerald-600">Pembayar dijumpai</p>
      <p class="mt-1 text-3xl font-bold text-slate-900">
        {{ lookupResult.individual?.fullName || lookupResult.displayName }}
      </p>
      <p class="mt-1 text-sm text-slate-500">{{ lookupResult.identityNo }}</p>
      <button
        class="mt-4 rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
        @click="goToPayment"
      >
        Seterusnya
      </button>
    </div>

    <!-- Not found -->
    <div v-if="lookupNotFound && !showQuickRegister" class="mt-6 text-center">
      <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
        <p class="text-lg font-semibold text-amber-800">Tiada rekod dijumpai</p>
        <p class="mt-1 text-sm text-amber-600">
          No. Kad Pengenalan {{ icDisplay }} tidak berdaftar dalam sistem.
        </p>
        <div class="mt-4 flex items-center justify-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            @click="startQuickRegister"
          >
            <UserPlus class="h-5 w-5" />
            Daftar
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
        <h3 class="mb-4 text-center text-lg font-bold text-slate-800">Pendaftaran Pantas</h3>
        <form class="space-y-3" @submit.prevent="submitQuickRegister">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Nama Penuh</label>
            <input
              v-model="regForm.fullName"
              required
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
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Email</label>
            <input
              v-model="regForm.email"
              type="email"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Kata Laluan</label>
            <input
              v-model="regForm.password"
              type="password"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            :disabled="registering || !regForm.fullName.trim()"
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
