<script setup lang="ts">
import { BarChart3, FileText, TrendingUp } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

const reportTypes = [
  { id: "processing", label: "Processing Report", desc: "File intake, validation, and batch processing summary.", icon: FileText },
  { id: "reconciliation", label: "Reconciliation Report", desc: "Match status, unmatched items, and exception summary.", icon: BarChart3 },
  { id: "trends", label: "Trends & Analytics", desc: "Volume trends, source breakdown, and performance metrics.", icon: TrendingUp },
];
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Reports</h1>
        <p class="mt-1 text-sm text-slate-600">View processing and reconciliation reports.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="r in reportTypes"
          :key="r.id"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <component :is="r.icon" class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 class="font-semibold text-slate-900">{{ r.label }}</h2>
              <p class="mt-1 text-xs text-slate-500">{{ r.desc }}</p>
              <button
                class="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
                @click="() => {}"
              >
                Generate report →
              </button>
            </div>
          </div>
        </article>
      </div>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <BarChart3 class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Recent Reports</h2>
        </div>
        <div class="p-6">
          <p class="text-center text-sm text-slate-500">Tiada laporan dijana.</p>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
