<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Users, Pencil, Trash2, Eye, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

type SortKey = "kategori" | "jawatan" | "institusi" | null;
type SortDir = "asc" | "desc";

// Placeholder: replace with API when backend is ready
const amils = ref<
  { id: number; name: string; code: string; noKp: string; status: string; kategori?: string; jawatan?: string; institusi?: string }[]
>([]);
const sortKey = ref<SortKey>(null);
const sortDir = ref<SortDir>("asc");

const sortedAmils = computed(() => {
  if (!sortKey.value) return amils.value;
  return [...amils.value].sort((a, b) => {
    const aVal = a[sortKey.value!] ?? "";
    const bVal = b[sortKey.value!] ?? "";
    const cmp = String(aVal).localeCompare(String(bVal), "ms");
    return sortDir.value === "asc" ? cmp : -cmp;
  });
});

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

async function load() {
  // TODO: const res = await listAmils(); amils.value = res.data;
  amils.value = [];
}

async function remove(id: number) {
  // TODO: await deleteAmil(id); await load();
  if (confirm("Delete this Amil?")) await load();
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Amil - Senarai</h1>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <Users class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Senarai Amil</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-left">
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kod</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                <th
                  class="cursor-pointer select-none px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                  @click="toggleSort('kategori')"
                >
                  <span class="inline-flex items-center gap-1">
                    Kategori
                    <ChevronUp v-if="sortKey === 'kategori' && sortDir === 'asc'" class="h-3.5 w-3.5" />
                    <ChevronDown v-else-if="sortKey === 'kategori' && sortDir === 'desc'" class="h-3.5 w-3.5" />
                    <ArrowUpDown v-else class="h-3.5 w-3.5 opacity-50" />
                  </span>
                </th>
                <th
                  class="cursor-pointer select-none px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                  @click="toggleSort('jawatan')"
                >
                  <span class="inline-flex items-center gap-1">
                    Jawatan
                    <ChevronUp v-if="sortKey === 'jawatan' && sortDir === 'asc'" class="h-3.5 w-3.5" />
                    <ChevronDown v-else-if="sortKey === 'jawatan' && sortDir === 'desc'" class="h-3.5 w-3.5" />
                    <ArrowUpDown v-else class="h-3.5 w-3.5 opacity-50" />
                  </span>
                </th>
                <th
                  class="cursor-pointer select-none px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                  @click="toggleSort('institusi')"
                >
                  <span class="inline-flex items-center gap-1">
                    Institusi
                    <ChevronUp v-if="sortKey === 'institusi' && sortDir === 'asc'" class="h-3.5 w-3.5" />
                    <ChevronDown v-else-if="sortKey === 'institusi' && sortDir === 'desc'" class="h-3.5 w-3.5" />
                    <ArrowUpDown v-else class="h-3.5 w-3.5 opacity-50" />
                  </span>
                </th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">No Kp</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="amil in sortedAmils" :key="amil.id" class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-900">
                  <router-link :to="'/integration/3rd-party/amil/' + amil.id" class="hover:text-violet-600">{{ amil.code }}</router-link>
                </td>
                <td class="px-4 py-2 text-slate-600">{{ amil.name }}</td>
                <td class="px-4 py-2 text-slate-600">{{ amil.kategori || "-" }}</td>
                <td class="px-4 py-2 text-slate-600">{{ amil.jawatan || "-" }}</td>
                <td class="px-4 py-2 text-slate-600">{{ amil.institusi || "-" }}</td>
                <td class="px-4 py-2 text-slate-600">{{ amil.noKp }}</td>
                <td class="px-4 py-2">
                  <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{{ amil.status }}</span>
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link :to="'/integration/3rd-party/amil/' + amil.id" class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                      <Eye class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">View</span>
                    </router-link>
                    <router-link :to="'/integration/3rd-party/amil/' + amil.id + '/edit'" class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                      <Pencil class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Edit</span>
                    </router-link>
                    <button class="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" @click="remove(amil.id)">
                      <Trash2 class="h-3.5 w-3.5" />
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="amils.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-sm text-slate-400">
                  Tiada rekod Amil.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
