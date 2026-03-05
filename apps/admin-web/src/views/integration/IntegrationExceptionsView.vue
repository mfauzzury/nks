<script setup lang="ts">
import { AlertTriangle, Filter } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Integration 3rd Party - Exceptions</h1>
        <p class="mt-1 text-sm text-slate-600">Review exceptions and approve/reprocess transactions.</p>
      </div>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle class="h-4 w-4 text-amber-500" />
            Exception Queue
          </h2>
          <div class="flex items-center gap-2">
            <select class="rounded-lg border border-slate-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Semua status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter class="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td colspan="5" class="px-4 py-12 text-center text-sm text-slate-500">Tiada pengecualian.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
