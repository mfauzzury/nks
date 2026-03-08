<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { AlertCircle, ArrowRight, Bot, CheckCircle2, FileUp, Layers, Loader2, RefreshCw, Settings2, Upload } from "lucide-vue-next";
import { useRouter } from "vue-router";

import {
  analyzeFileStructure,
  listIntegrationSources,
  uploadIntegrationFile,
} from "@/api/integration";
import type { AIFileAnalysisResult, IntegrationSource } from "@/api/integration";
import AdminLayout from "@/layouts/AdminLayout.vue";

const sourceOptions = ref<{ value: string; label: string }[]>([
  { value: "", label: "— Pilih sumber —" },
]);

const fileTypeOptions = [
  { value: "", label: "— Pilih jenis fail —" },
  { value: "ENCRYPTED_TXT", label: "Encrypted .txt" },
  { value: "TXT", label: "Plain .txt" },
  { value: "CSV", label: "CSV" },
  { value: "EXCEL", label: "Excel (.xlsx)" },
];

const mode = ref<"intelligent" | "manual">("intelligent");

const form = ref({
  source: "",
  transferMethod: "MANUAL" as const,
  fileType: "",
  description: "",
});

const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const analyzing = ref(false);
const error = ref("");
const successMessage = ref("");

const aiResult = ref<AIFileAnalysisResult | null>(null);
const showPreview = ref(false);

const router = useRouter();

const isFormValid = computed(
  () => !!form.value.source && !!form.value.fileType,
);

const currentStep = computed(() => {
  if (successMessage.value) return 2;
  return 1;
});

const steps = [
  { num: 1, label: "Upload" },
  { num: 2, label: "Batch" },
  { num: 3, label: "Reconciliation" },
  { num: 4, label: "Report" },
];

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFileSelected(file);
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) handleFileSelected(file);
  input.value = "";
}

async function handleFileSelected(file: File) {
  selectedFile.value = file;
  error.value = "";
  successMessage.value = "";
  aiResult.value = null;
  showPreview.value = false;

  if (mode.value === "intelligent") {
    analyzing.value = true;
    try {
      const res = await analyzeFileStructure(file);
      const data = (res as { data: AIFileAnalysisResult }).data;
      aiResult.value = data;
      form.value.source = data.suggestedSource ?? "";
      form.value.fileType = data.fileType;
      showPreview.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "AI analysis failed";
      form.value.source = "";
      form.value.fileType = inferFileTypeFromExt(file.name);
      showPreview.value = true;
    } finally {
      analyzing.value = false;
    }
  } else {
    form.value.fileType = inferFileTypeFromExt(file.name) || "";
    showPreview.value = true;
  }
}

function inferFileTypeFromExt(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "xlsx" || ext === "xls") return "EXCEL";
  if (ext === "csv") return "CSV";
  if (ext === "gpg" || ext === "enc") return "ENCRYPTED_TXT";
  if (ext === "txt") return "TXT";
  return "";
}

async function loadSources() {
  try {
    const res = await listIntegrationSources();
    const sources = (res as { data: IntegrationSource[] }).data ?? [];
    sourceOptions.value = [
      { value: "", label: "— Pilih sumber —" },
      ...sources.map((s) => ({
        value: s.code,
        label: `${s.name} (${s.category?.code ?? ""})`,
      })),
    ];
  } catch {
    sourceOptions.value = [
      { value: "", label: "— Pilih sumber —" },
      { value: "JAN", label: "Jabatan Akauntan Negara (SPG)" },
      { value: "BILPIZ", label: "BilPiz (PSP)" },
      { value: "BANK_ISLAM", label: "Bank Islam (Bank)" },
      { value: "MAYBANK", label: "Maybank (Bank)" },
    ];
  }
}

async function handleUpload() {
  if (!form.value.source || !form.value.fileType || !selectedFile.value) return;
  error.value = "";
  successMessage.value = "";
  uploading.value = true;
  try {
    const aiMetadata =
      aiResult.value && Object.keys(aiResult.value.columnMapping || {}).length > 0
        ? {
            columnMappingJson: JSON.stringify(aiResult.value.columnMapping),
            aiDetectedSource: aiResult.value.suggestedSource ?? undefined,
            aiConfidence: aiResult.value.confidence,
          }
        : undefined;

    await uploadIntegrationFile(
      selectedFile.value,
      form.value.source,
      form.value.fileType,
      form.value.description || undefined,
      aiMetadata,
    );
    successMessage.value = `Fail "${selectedFile.value.name}" berjaya dimuat naik.`;
    selectedFile.value = null;
    aiResult.value = null;
    showPreview.value = false;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Upload gagal";
  } finally {
    uploading.value = false;
  }
}

function clearFile() {
  selectedFile.value = null;
  aiResult.value = null;
  showPreview.value = false;
  error.value = "";
}

onMounted(() => loadSources());
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - File Upload</h1>
        <p class="mt-1 text-sm text-slate-600">
          Upload and receive encrypted files from external systems. Supports FTP auto-polling and manual upload.
        </p>
      </div>

      <!-- Flow Stepper -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Aliran Fail / Data</p>
        <div class="flex flex-nowrap items-center gap-1 overflow-x-auto sm:gap-2">
          <template v-for="(step, idx) in steps" :key="step.num">
            <div
              :class="[
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 sm:px-3',
                currentStep === step.num ? 'bg-violet-100 text-violet-800' : currentStep > step.num ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500',
              ]"
            >
              <span
                :class="[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  currentStep === step.num ? 'bg-violet-600 text-white' : currentStep > step.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
                ]"
              >
                <CheckCircle2 v-if="currentStep > step.num" class="h-3.5 w-3.5" />
                <span v-else>{{ step.num }}</span>
              </span>
              <span class="whitespace-nowrap text-sm font-medium">{{ step.label }}</span>
            </div>
            <ArrowRight
              v-if="idx < steps.length - 1"
              class="h-4 w-4 shrink-0 text-slate-300"
              :class="{ 'text-violet-400': currentStep > step.num }"
            />
          </template>
        </div>
        <!-- Next steps links (when upload complete) -->
        <div v-if="successMessage" class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <span class="text-xs text-slate-500">Seterusnya:</span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="router.push('/integration/3rd-party/batch-processing')"
          >
            <Layers class="h-3.5 w-3.5" />
            Batch Processing
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="router.push('/integration/3rd-party/reconciliation')"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            Reconciliation
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="router.push('/integration/3rd-party/reports')"
          >
            Report
          </button>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          :class="[
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            mode === 'intelligent'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          ]"
          @click="mode = 'intelligent'"
        >
          <img src="/aina-mascot.png" alt="AINA" class="h-7 w-7 object-contain" />
          Intelligent (AI)
        </button>
        <button
          type="button"
          :class="[
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            mode === 'manual'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          ]"
          @click="mode = 'manual'"
        >
          <Settings2 class="h-4 w-4" />
          Manual
        </button>
      </div>

      <!-- Manual Upload Details (shown when mode is manual, or when no file selected yet) -->
      <article
        v-if="mode === 'manual' && !selectedFile"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="border-b border-slate-100 px-4 py-3">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Settings2 class="h-4 w-4 text-slate-600" />
            Upload Details
          </h2>
          <p class="mt-1 text-xs text-slate-500">Sila isi maklumat berikut sebelum memuat naik fail.</p>
        </div>
        <div class="p-6">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="space-y-1.5">
              <label for="source" class="block text-sm font-medium text-slate-700">Sumber <span class="text-rose-500">*</span></label>
              <select
                id="source"
                v-model="form.source"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label for="fileType" class="block text-sm font-medium text-slate-700">Jenis Fail <span class="text-rose-500">*</span></label>
              <select
                id="fileType"
                v-model="form.fileType"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option v-for="opt in fileTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
          <div class="mt-4 space-y-1.5">
            <label for="description" class="block text-sm font-medium text-slate-700">Catatan (pilihan)</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="2"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Nota tambahan jika perlu..."
            />
          </div>
        </div>
      </article>

      <!-- Upload Zone -->
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-3">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileUp class="h-4 w-4 text-blue-600" />
            {{ mode === "intelligent" ? "Intelligent Upload" : "Manual Upload" }}
          </h2>
          <p v-if="mode === 'intelligent'" class="mt-1 text-xs text-slate-500">
            Drop file first. AI will detect structure, source, and column mapping automatically.
          </p>
        </div>
        <div class="p-6">
          <!-- No file: show drop zone -->
          <div
            v-if="!selectedFile"
            :class="[
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer',
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300',
            ]"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
            @click="fileInputRef?.click()"
          >
            <Upload class="mb-4 h-12 w-12 text-slate-400" />
            <p class="text-sm font-medium text-slate-600">Drag and drop file here, or click to browse</p>
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              accept=".txt,.enc,.gpg,.csv,.xlsx,.xls"
              @change="onFileSelect"
              @click.stop
            />
          </div>

          <!-- File selected: show preview and form -->
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="flex items-center gap-3">
                <FileUp class="h-8 w-8 text-slate-500" />
                <div>
                  <p class="font-medium text-slate-800">{{ selectedFile?.name }}</p>
                  <p class="text-xs text-slate-500">{{ ((selectedFile?.size ?? 0) / 1024).toFixed(1) }} KB</p>
                </div>
              </div>
              <button
                type="button"
                class="text-sm text-slate-500 hover:text-rose-600"
                @click="clearFile"
              >
                Remove
              </button>
            </div>

            <div v-if="analyzing" class="flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 py-8">
              <Loader2 class="h-5 w-5 animate-spin text-violet-600" />
              <span class="text-sm font-medium text-violet-700">AI analyzing file structure...</span>
            </div>

            <div v-else-if="showPreview" class="space-y-4">
              <!-- AI Result Summary -->
              <div
                v-if="aiResult && mode === 'intelligent'"
                class="rounded-lg border border-violet-200 bg-violet-50/50 p-4"
              >
                <div class="flex items-center gap-2 text-sm font-medium text-violet-800">
                  <Bot class="h-4 w-4" />
                  AI Detection
                </div>
                <p class="mt-1 text-xs text-violet-600">
                  Confidence: {{ (aiResult.confidence * 100).toFixed(0) }}%
                  <span v-if="aiResult.suggestedSource"> • Suggested source: {{ aiResult.suggestedSource }}</span>
                </p>
                <div v-if="aiResult.warnings?.length" class="mt-2 text-xs text-rose-600">
                  {{ aiResult.warnings.join("; ") }}
                </div>
              </div>

              <!-- Editable form -->
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-1.5">
                  <label for="preview-source" class="block text-sm font-medium text-slate-700">Sumber <span class="text-rose-500">*</span></label>
                  <select
                    id="preview-source"
                    v-model="form.source"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label for="preview-fileType" class="block text-sm font-medium text-slate-700">Jenis Fail <span class="text-rose-500">*</span></label>
                  <select
                    id="preview-fileType"
                    v-model="form.fileType"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option v-for="opt in fileTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>
              </div>
              <div class="space-y-1.5">
                <label for="preview-description" class="block text-sm font-medium text-slate-700">Catatan (pilihan)</label>
                <textarea
                  id="preview-description"
                  v-model="form.description"
                  rows="2"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Nota tambahan jika perlu..."
                />
              </div>

              <!-- Column mapping preview -->
              <div v-if="aiResult?.columnMapping && Object.keys(aiResult.columnMapping).length > 0" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p class="text-xs font-medium text-slate-600">Column mapping (AI detected)</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="(header, field) in aiResult.columnMapping"
                    :key="field"
                    class="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700"
                  >
                    {{ field }} ← {{ header }}
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="w-full rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                :disabled="!isFormValid || uploading"
                @click="handleUpload"
              >
                {{ uploading ? "Memuat naik..." : "Simpan & Muat Naik" }}
              </button>
            </div>
          </div>

          <p v-if="!selectedFile" class="mt-4 text-xs text-slate-500">
            Supported: .txt, .enc, .gpg, .csv, .xlsx, .xls.
          </p>
          <div v-if="error" class="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>
          <div v-if="successMessage" class="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 class="h-4 w-4 shrink-0" />
            {{ successMessage }}
          </div>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
