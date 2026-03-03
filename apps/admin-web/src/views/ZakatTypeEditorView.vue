<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { getZakatTypes, saveZakatTypes } from "@/api/cms";
import type { ZakatTypeConfig } from "@/types";

const route = useRoute();
const router = useRouter();
const code = computed(() => String(route.params.code || ""));
const isNew = computed(() => code.value === "new");

const allTypes = ref<ZakatTypeConfig[]>([]);
const model = ref<ZakatTypeConfig>({
  code: "",
  name: "",
  formula: "tahun + jumlah_manual",
  notes: "",
  isActive: true,
  uiTemplate: "standard_year_amount",
  codeSnippet: "",
  calculator: { mode: "none", expression: "", inputs: [] },
});

const saving = ref(false);
const error = ref("");

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

function addInputField() {
  model.value.calculator = model.value.calculator || { mode: "none", expression: "", inputs: [] };
  model.value.calculator.inputs.push({
    key: "",
    label: "",
    inputType: "number",
    required: true,
    defaultValue: "",
    notes: "",
  });
}

function removeInputField(index: number) {
  if (!model.value.calculator) return;
  model.value.calculator.inputs.splice(index, 1);
}

const isSpecialTemplate = computed(() => {
  const template = model.value.uiTemplate || "standard_year_amount";
  return template === "fitrah" || template === "fidyah";
});

async function load() {
  const res = await getZakatTypes();
  allTypes.value = res.data.types;

  if (isNew.value) return;
  const existing = allTypes.value.find((item) => item.code === code.value);
  if (!existing) {
    error.value = `Jenis zakat '${code.value}' tidak ditemui`;
    return;
  }
  model.value = JSON.parse(JSON.stringify(existing));
  model.value.uiTemplate = existing.uiTemplate || "standard_year_amount";
  model.value.codeSnippet = existing.codeSnippet || "";
  model.value.calculator = existing.calculator || { mode: "none", expression: "", inputs: [] };
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload: ZakatTypeConfig = {
      ...model.value,
      code: normalizeCode(model.value.code),
      name: model.value.name.trim().toUpperCase(),
      formula: model.value.formula.trim() || "tahun + jumlah_manual",
      notes: (model.value.notes || "").trim(),
      isActive: model.value.isActive,
      uiTemplate: model.value.uiTemplate || "standard_year_amount",
      codeSnippet: model.value.codeSnippet || "",
      calculator: {
        mode: model.value.calculator?.mode || "none",
        expression: (model.value.calculator?.expression || "").trim(),
        inputs: (model.value.calculator?.inputs || [])
          .map((item) => ({
            ...item,
            key: normalizeCode(item.key),
            label: item.label.trim(),
            defaultValue: (item.defaultValue || "").trim(),
            notes: (item.notes || "").trim(),
          }))
          .filter((item) => item.key && item.label),
      },
    };

    if (payload.uiTemplate === "standard_year_amount") {
      payload.formula = "tahun + jumlah_manual";
      payload.codeSnippet = "";
      payload.calculator = { mode: "none", expression: "", inputs: [] };
    }

    if (!payload.code || !payload.name) {
      error.value = "Kod dan nama jenis zakat adalah wajib.";
      return;
    }

    const next = [...allTypes.value];
    const index = next.findIndex((item) => item.code === code.value);
    if (index >= 0) {
      next[index] = payload;
    } else {
      const duplicate = next.find((item) => item.code === payload.code);
      if (duplicate) {
        error.value = "Kod jenis zakat sudah wujud.";
        return;
      }
      next.push(payload);
    }

    await saveZakatTypes(next);
    await router.push("/zakat-config/types");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Gagal menyimpan konfigurasi jenis zakat";
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
        <h1 class="page-title">Jenis Zakat - {{ isNew ? "Tambah Baru" : "Edit Detail" }}</h1>
        <button class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" @click="router.push('/zakat-config/types')">Kembali ke Senarai</button>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Kod</label>
            <input v-model="model.code" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="ZEMAS" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Nama</label>
            <input v-model="model.name" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="ZAKAT EMAS" />
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Formula Ringkas</label>
            <input v-model="model.formula" class="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono" :disabled="!isSpecialTemplate" placeholder="Formula untuk template khas" />
            <p v-if="!isSpecialTemplate" class="mt-1 text-xs text-slate-500">Template standard menggunakan input tetap: Tahun + Jumlah (RM).</p>
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Penerangan</label>
            <textarea v-model="model.notes" rows="4" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Penerangan ringkas tentang jenis zakat ini untuk dipaparkan di chatbot portal"></textarea>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Aktif</label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="model.isActive" type="checkbox" />
              <span>{{ model.isActive ? "Ya" : "Tidak" }}</span>
            </label>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Mod Kalkulator</label>
            <select v-model="model.calculator!.mode" class="w-full rounded border border-slate-300 px-3 py-2 text-sm" :disabled="!isSpecialTemplate">
              <option value="none">Tiada Kalkulator</option>
              <option value="formula">Formula Dinamik</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Template Borang</label>
            <select v-model="model.uiTemplate" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
              <option value="standard_year_amount">Standard (Tahun + Jumlah)</option>
              <option value="fitrah">Khas: Zakat Fitrah</option>
              <option value="fidyah">Khas: Fidyah Puasa</option>
            </select>
          </div>
        </div>
      </article>

      <article v-if="isSpecialTemplate" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Code Area (Template Khas)</h2>
        <textarea
          v-model="model.codeSnippet"
          rows="6"
          class="w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
          placeholder="// Tulis logik tambahan untuk borang khas di sini"
        ></textarea>
      </article>

      <article v-if="isSpecialTemplate && model.calculator?.mode === 'formula'" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Konfigurasi Kalkulator</h2>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-slate-700">Expression</label>
          <input v-model="model.calculator!.expression" class="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono" placeholder="max(0, berat_emas_gram - nisab_emas_gram) * harga_emas_segram * 0.025" />
        </div>

        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-medium text-slate-800">Input Fields</h3>
          <button class="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50" @click="addInputField">Tambah Input</button>
        </div>

        <div class="space-y-3">
          <div v-for="(input, idx) in model.calculator!.inputs" :key="idx" class="rounded border border-slate-200 p-3">
            <div class="grid grid-cols-1 gap-2 md:grid-cols-4">
              <input v-model="input.key" class="rounded border border-slate-300 px-2 py-1.5 text-sm" placeholder="Key (e.g. berat_emas_gram)" />
              <input v-model="input.label" class="rounded border border-slate-300 px-2 py-1.5 text-sm" placeholder="Label" />
              <select v-model="input.inputType" class="rounded border border-slate-300 px-2 py-1.5 text-sm">
                <option value="number">number</option>
                <option value="integer">integer</option>
                <option value="currency">currency</option>
                <option value="percentage">percentage</option>
                <option value="text">text</option>
              </select>
              <input v-model="input.defaultValue" class="rounded border border-slate-300 px-2 py-1.5 text-sm" placeholder="Default value" />
            </div>
            <div class="mt-2 flex items-center justify-between">
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model="input.required" type="checkbox" />
                <span>Wajib diisi</span>
              </label>
              <button class="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50" @click="removeInputField(idx)">Buang</button>
            </div>
          </div>
          <div v-if="model.calculator!.inputs.length === 0" class="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Tiada input dikonfigurasi.
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
