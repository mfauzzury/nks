<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getSourceData, getSourceCategories, saveSourceData } from "@/api/cms";
import type { SourceDataConfig } from "@/types";

const route = useRoute();
const router = useRouter();
const code = computed(() => String(route.params.code || ""));
const isNew = computed(() => code.value === "new");

const allItems = ref<SourceDataConfig[]>([]);
const categories = ref<{ code: string; name: string }[]>([]);
const model = ref<SourceDataConfig>({
  code: "",
  name: "",
  categoryCode: "",
  isActive: true,
  notes: "",
});

const saving = ref(false);
const error = ref("");

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

async function load() {
  const [dataRes, catRes] = await Promise.all([getSourceData(), getSourceCategories()]);
  allItems.value = dataRes.data.items;
  categories.value = catRes.data.categories.map((c) => ({ code: c.code, name: c.name }));

  if (isNew.value) return;
  const existing = allItems.value.find((item) => item.code === code.value);
  if (!existing) {
    error.value = `Sumber data '${code.value}' tidak ditemui`;
    return;
  }
  model.value = JSON.parse(JSON.stringify(existing));
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload: SourceDataConfig = {
      ...model.value,
      code: isNew.value ? normalizeCode(model.value.code) : code.value,
      name: model.value.name.trim(),
      categoryCode: model.value.categoryCode.trim().toUpperCase(),
      isActive: model.value.isActive,
      notes: (model.value.notes || "").trim(),
    };

    if (!payload.code || !payload.name || !payload.categoryCode) {
      error.value = "Kod, nama dan kategori sumber adalah wajib.";
      return;
    }

    const next = [...allItems.value];
    const index = next.findIndex((item) => item.code === code.value);
    if (index >= 0) {
      next[index] = payload;
    } else {
      const duplicate = next.find((item) => item.code === payload.code);
      if (duplicate) {
        error.value = "Kod sumber data sudah wujud.";
        return;
      }
      next.push(payload);
    }

    await saveSourceData(next);
    await router.push("/zakat-config/source-data");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal menyimpan sumber data";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Sumber Data - {{ isNew ? "Tambah Baru" : "Edit Detail" }}</h1>
        <button class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="router.push('/zakat-config/source-data')">Kembali ke Senarai</button>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Kod</label>
            <input v-model="model.code" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="cth. JAN, BILPIZ" :readonly="!isNew" />
            <p v-if="!isNew" class="mt-1 text-xs text-slate-500">Kod tidak boleh diubah selepas dicipta.</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Nama</label>
            <input v-model="model.name" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="cth. Jabatan Akauntan Negara" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Kategori Sumber</label>
            <select v-model="model.categoryCode" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
              <option value="">-- Pilih Kategori --</option>
              <option v-for="cat in categories" :key="cat.code" :value="cat.code">{{ cat.name }}</option>
            </select>
            <p class="mt-1 text-xs text-slate-500">
              <router-link to="/zakat-config/source-categories" class="text-blue-600 hover:underline">Urus Kategori Sumber</router-link>
            </p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Aktif</label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="model.isActive" type="checkbox" />
              <span>{{ model.isActive ? "Ya" : "Tidak" }}</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Nota</label>
            <textarea v-model="model.notes" rows="3" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Nota atau penerangan tambahan"></textarea>
          </div>
        </div>
      </article>

      <div class="flex items-center gap-3">
        <button class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white" :disabled="saving" @click="save">
          {{ saving ? "Menyimpan..." : "Simpan" }}
        </button>
        <span v-if="error" class="text-sm text-rose-700">{{ error }}</span>
      </div>
    </div>
  </AdminLayout>
</template>
