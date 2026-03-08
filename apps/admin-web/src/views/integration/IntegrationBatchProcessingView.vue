<script setup lang="ts">
import { onMounted, ref, unref } from "vue";
import { Layers, Clock, Eye, Loader2, Play, Trash2, X } from "lucide-vue-next";

import {
  deleteIntegrationFile,
  getIntegrationFileStaging,
  listIntegrationFiles,
  processIntegrationFile,
} from "@/api/integration";
import type { IntegrationFile, IntegrationStagingRow } from "@/api/integration";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";

const files = ref<IntegrationFile[]>([]);
const loading = ref(true);
const error = ref("");
const processingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const viewModalOpen = ref(false);
const dragViewModal = useDraggableModal();
const viewFile = ref<IntegrationFile | null>(null);
const viewRows = ref<IntegrationStagingRow[]>([]);
const viewTotal = ref(0);
const viewLoading = ref(false);

const fileTypeLabels: Record<string, string> = {
  ENCRYPTED_TXT: "Encrypted .txt",
  TXT: "Plain .txt",
  CSV: "CSV",
  EXCEL: "Excel",
};

const channelLabels: Record<string, string> = {
  MANUAL: "Manual",
  FTP: "FTP",
  SFTP: "SFTP",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ms-MY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function recordCount(file: IntegrationFile) {
  return file.totalRecordsParsed ?? file.totalRecordsDeclared ?? "—";
}

async function loadFiles() {
  loading.value = true;
  error.value = "";
  try {
    const res = await listIntegrationFiles({ limit: 50 });
    const data = (res as { data: IntegrationFile[] }).data ?? [];
    files.value = data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load batch jobs";
    files.value = [];
  } finally {
    loading.value = false;
  }
}

function canProcess(file: IntegrationFile): boolean {
  return file.processingStatus === "PENDING" && !!file.filePath;
}

function canRemove(file: IntegrationFile): boolean {
  return file.processingStatus === "PENDING" || file.processingStatus === "FAILED";
}

async function handleRemove(file: IntegrationFile) {
  if (!canRemove(file)) return;
  if (!confirm(`Remove "${file.fileName}"? This will delete the file and cannot be undone.`)) return;
  deletingId.value = file.id;
  error.value = "";
  try {
    await deleteIntegrationFile(file.id);
    await loadFiles();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to remove file";
  } finally {
    deletingId.value = null;
  }
}

const successMessage = ref("");

async function handleProcess(file: IntegrationFile) {
  if (!canProcess(file)) return;
  processingId.value = file.id;
  error.value = "";
  successMessage.value = "";
  try {
    const res = await processIntegrationFile(file.id);
    const payload = res as {
      data?: { success: boolean; recordsParsed: number; duplicatesDetected?: number; file?: IntegrationFile };
    };
    if (payload.data?.success) {
      const updated = payload.data.file;
      if (updated) {
        const idx = files.value.findIndex((f) => f.id === file.id);
        if (idx >= 0) files.value[idx] = { ...files.value[idx], ...updated };
      }
      const dup = payload.data.duplicatesDetected ?? 0;
      successMessage.value =
        dup > 0
          ? `Processed ${payload.data.recordsParsed} records. ${dup} duplicate(s) detected.`
          : `Processed ${payload.data.recordsParsed} records.`;
      setTimeout(() => { successMessage.value = ""; }, 5000);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Processing failed";
  } finally {
    processingId.value = null;
  }
}

async function handleView(file: IntegrationFile) {
  viewModalOpen.value = true;
  viewFile.value = file;
  viewRows.value = [];
  viewTotal.value = 0;
  viewLoading.value = true;
  try {
    const res = await getIntegrationFileStaging(file.id, { limit: 200 });
    const payload = res as {
      data?: { file: IntegrationFile; data: IntegrationStagingRow[]; meta: { total: number } };
    };
    if (payload.data) {
      viewRows.value = payload.data.data ?? [];
      viewTotal.value = payload.data.meta?.total ?? 0;
    }
  } catch {
    viewRows.value = [];
    viewTotal.value = 0;
  } finally {
    viewLoading.value = false;
  }
}

function closeViewModal() {
  viewModalOpen.value = false;
  viewFile.value = null;
  viewRows.value = [];
  dragViewModal.resetPosition();
}

function formatStagingDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ms-MY");
}

onMounted(loadFiles);
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Batch Processing</h1>
        <p class="mt-1 text-sm text-slate-600">Process batch transactions via async queue. Validate, decrypt, and insert into staging.</p>
      </div>

      <div v-if="successMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {{ successMessage }}
      </div>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Layers class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Batch Jobs</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Job ID</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">File</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Sumber</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kaedah Pemindahan</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis Fail</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Records</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="9" class="px-4 py-8 text-center text-slate-500">Loading...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="9" class="px-4 py-8 text-center text-red-600">{{ error }}</td>
              </tr>
              <tr v-else-if="files.length === 0">
                <td colspan="9" class="px-4 py-12 text-center">
                  <div class="inline-flex flex-col items-center gap-2 text-slate-500">
                    <Clock class="h-10 w-10 text-slate-300" />
                    <p class="text-sm">No batch jobs yet</p>
                    <p class="text-xs">Upload files to start processing</p>
                  </div>
                </td>
              </tr>
              <tr v-for="file in files" :key="file.id">
                <td class="px-4 py-2 font-mono text-slate-700">{{ file.id }}</td>
                <td class="px-4 py-2 text-slate-800">{{ file.fileName }}</td>
                <td class="px-4 py-2 text-slate-700">{{ file.source?.name ?? "—" }}</td>
                <td class="px-4 py-2 text-slate-700">{{ channelLabels[file.receivedChannel] ?? file.receivedChannel }}</td>
                <td class="px-4 py-2 text-slate-700">{{ fileTypeLabels[file.fileType] ?? file.fileType }}</td>
                <td class="px-4 py-2">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="{
                    'bg-amber-100 text-amber-800': file.processingStatus === 'PENDING',
                    'bg-blue-100 text-blue-800': file.processingStatus === 'PROCESSING',
                    'bg-green-100 text-green-800': file.processingStatus === 'SUCCESS' || file.processingStatus === 'COMPLETED',
                    'bg-red-100 text-red-800': file.processingStatus === 'FAILED' || file.processingStatus === 'ERROR',
                    'bg-slate-100 text-slate-700': !['PENDING','PROCESSING','SUCCESS','COMPLETED','FAILED','ERROR'].includes(file.processingStatus),
                  }">{{ file.processingStatus }}</span>
                </td>
                <td class="px-4 py-2 text-slate-700">{{ recordCount(file) }}</td>
                <td class="px-4 py-2 text-slate-600">{{ formatDate(file.receivedAt) }}</td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      title="View data"
                      :disabled="processingId !== null || deletingId !== null"
                      @click="handleView(file)"
                    >
                      <Eye class="h-3.5 w-3.5" />
                    </button>
                    <button
                      v-if="canProcess(file)"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                      :disabled="processingId !== null || deletingId !== null"
                      @click="handleProcess(file)"
                    >
                      <Loader2 v-if="processingId === file.id" class="h-3 w-3 animate-spin" />
                      <Play v-else class="h-3 w-3" />
                      {{ processingId === file.id ? "Processing..." : "Process" }}
                    </button>
                    <button
                      v-if="canRemove(file)"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      :disabled="processingId !== null || deletingId !== null"
                      title="Remove uploaded file"
                      @click="handleRemove(file)"
                    >
                      <Trash2 class="h-3 w-3" />
                      {{ deletingId === file.id ? "Removing..." : "Remove" }}
                    </button>
                  </div>
                  <span v-if="!canProcess(file) && !canRemove(file) && file.processingStatus === 'PROCESSING'" class="text-xs text-slate-500">Processing...</span>
                  <span v-else-if="file.processingStatus === 'SUCCESS' || file.processingStatus === 'COMPLETED'" class="text-xs text-green-600">Done</span>
                  <span v-else-if="file.processingStatus === 'FAILED'" class="text-xs text-red-600">Failed</span>
                  <span v-else-if="!file.filePath" class="text-xs text-slate-400">No file</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- View Data Modal -->
      <Teleport to="body">
        <div
          v-if="viewModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="closeViewModal"
        >
          <div
            :ref="dragViewModal.modalRef"
            :style="unref(dragViewModal.modalStyle)"
            class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div
              class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3"
              @mousedown="dragViewModal.onHandleMouseDown"
            >
              <h3 class="text-sm font-semibold text-slate-900">
                View Data — {{ viewFile?.fileName ?? "" }}
              </h3>
              <button
                type="button"
                class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                @click="closeViewModal"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="overflow-y-auto p-4" style="max-height: calc(90vh - 120px)">
              <p v-if="viewLoading" class="py-8 text-center text-slate-500">Loading...</p>
              <template v-else-if="viewRows.length === 0">
                <p class="py-8 text-center text-slate-500">
                  No data to view. Process the file first to see parsed records.
                </p>
              </template>
              <template v-else>
                <p class="mb-3 text-xs text-slate-500">
                  Showing {{ viewRows.length }} of {{ viewTotal }} records (view only)
                </p>
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-slate-200 bg-slate-50 text-left">
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">#</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">IC</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Name</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Date</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Reference</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600 text-right">Amount (RM)</th>
                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="(row, i) in viewRows" :key="row.id" class="hover:bg-slate-50" :class="{ 'bg-amber-50': row.stagingStatus === 'DUPLICATE' }">
                        <td class="px-3 py-2 font-mono text-slate-500">{{ i + 1 }}</td>
                        <td class="px-3 py-2 text-slate-700">{{ row.payerIc ?? "—" }}</td>
                        <td class="px-3 py-2 text-slate-700">{{ row.payerName ?? "—" }}</td>
                        <td class="px-3 py-2 text-slate-700">{{ formatStagingDate(row.txDate) }}</td>
                        <td class="px-3 py-2 text-slate-700">{{ row.sourceTxRef ?? "—" }}</td>
                        <td class="px-3 py-2 text-right font-medium text-slate-800">
                          {{ Number(row.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 }) }}
                        </td>
                        <td class="px-3 py-2">
                          <span v-if="row.stagingStatus === 'DUPLICATE'" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Duplicate</span>
                          <span v-else class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{{ row.stagingStatus ?? "NEW" }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AdminLayout>
</template>
