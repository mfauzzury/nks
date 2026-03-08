<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { deletePage, listPages } from "@/api/cms";
import type { Page } from "@/types";

const router = useRouter();
const rows = ref<Page[]>([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const fromRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const toRow = computed(() => Math.min(total.value, page.value * limit.value));

async function load() {
  const response = await listPages(`?page=${page.value}&limit=${limit.value}`);
  rows.value = response.data;
  const meta = (response.meta || {}) as { total?: number };
  total.value = Number(meta.total || 0);
}

async function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
  await load();
}

async function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await load();
}

async function remove(id: number) {
  await deletePage(id);
  await load();
}

function statusColor(status: string) {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "draft":
      return "bg-amber-100 text-amber-700";
    case "archived":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <!-- ───── Hero Header ───── -->
      <div class="flex items-center justify-between">
        <h1 class="page-title">Pages</h1>
        <button
          class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          @click="router.push('/pages/new')"
        >
          <Plus class="h-4 w-4" />
          Add Page
        </button>
      </div>

      <!-- ───── Table Card ───── -->
      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-2.5">
          <div class="flex items-center gap-2">
            <FileText class="h-4 w-4 text-emerald-600" />
            <h2 class="text-sm font-semibold text-slate-900">All Pages</h2>
            <span class="text-xs text-slate-500 ml-1">{{ rows.length }} page{{ rows.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in rows" :key="item.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-900">{{ item.title }}</td>
                <td class="px-4 py-2">
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusColor(item.status)">{{ item.status }}</span>
                </td>
                <td class="px-4 py-2 font-mono text-xs text-slate-500">{{ item.slug }}</td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      @click="router.push(`/pages/${item.id}`)"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Edit</span>
                    </button>
                    <button
                      class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      @click="remove(item.id)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-400">No pages found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
          <p class="text-xs text-slate-500">Showing {{ fromRow }}-{{ toRow }} of {{ total }} pages</p>
          <div class="flex items-center gap-1.5">
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page <= 1" @click="prevPage">Previous</button>
            <span class="px-2 text-xs text-slate-500">Page {{ page }} / {{ totalPages }}</span>
            <button class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" :disabled="page >= totalPages" @click="nextPage">Next</button>
          </div>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
