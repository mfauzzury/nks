<script setup lang="ts">
import { useRouter } from "vue-router";
import { FileUp, Layers, RefreshCw, AlertTriangle, BarChart3, Plug } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

const router = useRouter();

const modules = [
  { id: "file-upload", label: "File Upload", desc: "Upload and receive encrypted files from external systems. Supports FTP auto-polling and manual upload.", to: "/integration/3rd-party/file-upload", icon: FileUp },
  { id: "batch-processing", label: "Batch Processing", desc: "Process batch transactions via async queue. Validate, decrypt, and insert into staging.", to: "/integration/3rd-party/batch-processing", icon: Layers },
  { id: "reconciliation", label: "Reconciliation", desc: "Perform reconciliation with internal NKS records. Match external transactions with internal records.", to: "/integration/3rd-party/reconciliation", icon: RefreshCw },
  { id: "exceptions", label: "Exceptions", desc: "Review exceptions and approve/reprocess transactions.", to: "/integration/3rd-party/exceptions", icon: AlertTriangle },
  { id: "reports", label: "Reports", desc: "View processing and reconciliation reports.", to: "/integration/3rd-party/reports", icon: BarChart3 },
];
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Plug class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-slate-900">Integration 3rd Party</h1>
            <p class="mt-0.5 text-sm text-slate-600">Module overview for FTP-based file exchange, bulk processing, reconciliation, and reporting with external systems (JAN, PSP, Bank Islam, Maybank).</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="m in modules"
          :key="m.id"
          class="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          @click="router.push(m.to)"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <component :is="m.icon" class="h-5 w-5 text-slate-600" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-slate-900">{{ m.label }}</h2>
            <p class="mt-1 text-xs text-slate-500">{{ m.desc }}</p>
          </div>
        </button>
      </div>
    </div>
  </AdminLayout>
</template>
