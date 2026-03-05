<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Save, Users } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

const route = useRoute();
const router = useRouter();

const isNew = computed(() => route.path.endsWith("/new") || route.params.id === "new");
const amilId = computed(() => {
  const id = route.params.id;
  if (!id || id === "new") return null;
  return Number(id);
});

const form = ref({ code: "", name: "", noKp: "", status: "active" });
const loading = ref(true);
const saving = ref(false);
const error = ref("");

const pageTitle = computed(() => (isNew.value ? "Daftar Amil Baru" : "Edit Amil"));

async function load() {
  if (isNew.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    // TODO: const res = await getAmil(amilId.value!); form.value = res.data;
    form.value = { code: "", name: "", noKp: "", status: "active" };
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load";
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    // TODO: if (isNew.value) await createAmil(form.value); else await updateAmil(amilId.value!, form.value);
    router.push("/integration/3rd-party/amil");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to save";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex items-center gap-4">
        <router-link
          to="/integration/3rd-party/amil"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft class="h-4 w-4" />
        </router-link>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>

      <article v-if="!loading" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Users class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Maklumat Amil</h2>
        </div>
        <form class="mt-4 space-y-4" @submit.prevent="save">
          <div>
            <label class="block text-sm font-medium text-slate-700">Kod Amil</label>
            <input v-model="form.code" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. AM001" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Nama</label>
            <input v-model="form.name" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Nama Amil" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">No Kp</label>
            <input v-model="form.noKp" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. 900101011234" maxlength="12" inputmode="numeric" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Status</label>
            <select v-model="form.status" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
          <div class="flex gap-2 pt-4">
            <button type="submit" class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50" :disabled="saving">
              <Save class="h-4 w-4" />
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
            <router-link to="/integration/3rd-party/amil" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Batal
            </router-link>
          </div>
        </form>
      </article>
      <div v-else class="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Loading...
      </div>
    </div>
  </AdminLayout>
</template>
