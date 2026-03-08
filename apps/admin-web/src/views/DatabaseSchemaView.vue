<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Database, Link2, RefreshCw, Search } from "lucide-vue-next";

import { getDatabaseSchema } from "@/api/cms";
import AdminLayout from "@/layouts/AdminLayout.vue";
import type { DatabaseSchemaPayload } from "@/types";

const loading = ref(false);
const error = ref("");
const query = ref("");
const schema = ref<DatabaseSchemaPayload | null>(null);

const filteredTables = computed(() => {
  const payload = schema.value;
  if (!payload) return [];

  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return payload.tables;

  return payload.tables.filter((table) => {
    if (table.name.toLowerCase().includes(keyword)) return true;
    return table.columns.some((column) => `${column.name} ${column.type}`.toLowerCase().includes(keyword));
  });
});

const visibleRelationships = computed(() => {
  const payload = schema.value;
  if (!payload) return [];

  const visibleTableNames = new Set(filteredTables.value.map((table) => table.name));
  return payload.relationships.filter((relationship) =>
    visibleTableNames.has(relationship.sourceTable) || visibleTableNames.has(relationship.targetTable)
  );
});

const diagramMetrics = {
  cardWidth: 320,
  cardHeight: 170,
  colGap: 56,
  rowGap: 42,
  paddingX: 28,
  paddingY: 28,
  columns: 3,
};

const diagramNodes = computed(() => {
  return filteredTables.value.map((table, index) => {
    const col = index % diagramMetrics.columns;
    const row = Math.floor(index / diagramMetrics.columns);
    const x = diagramMetrics.paddingX + col * (diagramMetrics.cardWidth + diagramMetrics.colGap);
    const y = diagramMetrics.paddingY + row * (diagramMetrics.cardHeight + diagramMetrics.rowGap);
    return {
      id: table.name,
      table,
      x,
      y,
      cx: x + diagramMetrics.cardWidth / 2,
      cy: y + diagramMetrics.cardHeight / 2,
    };
  });
});

const diagramNodeMap = computed(() => new Map(diagramNodes.value.map((node) => [node.id, node])));

const diagramWidth = computed(() => {
  const count = filteredTables.value.length;
  const cols = Math.min(diagramMetrics.columns, Math.max(count, 1));
  return diagramMetrics.paddingX * 2 + cols * diagramMetrics.cardWidth + Math.max(0, cols - 1) * diagramMetrics.colGap;
});

const diagramHeight = computed(() => {
  const count = filteredTables.value.length;
  const rows = Math.max(1, Math.ceil(count / diagramMetrics.columns));
  return diagramMetrics.paddingY * 2 + rows * diagramMetrics.cardHeight + Math.max(0, rows - 1) * diagramMetrics.rowGap;
});

const diagramEdges = computed(() => {
  return visibleRelationships.value
    .map((rel) => {
      const source = diagramNodeMap.value.get(rel.sourceTable);
      const target = diagramNodeMap.value.get(rel.targetTable);
      if (!source || !target) return null;
      return {
        key: `${rel.constraintName}-${rel.sourceTable}-${rel.sourceColumn}`,
        rel,
        x1: source.cx,
        y1: source.cy,
        x2: target.cx,
        y2: target.cy,
      };
    })
    .filter((edge): edge is NonNullable<typeof edge> => edge !== null);
});

async function loadSchema() {
  loading.value = true;
  error.value = "";
  try {
    const res = await getDatabaseSchema();
    schema.value = res.data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load database schema";
  } finally {
    loading.value = false;
  }
}

onMounted(loadSchema);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">Database Schema</h1>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          :disabled="loading"
          @click="loadSchema"
        >
          <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div>

      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <div class="flex items-center gap-2">
            <Database class="h-4 w-4 text-emerald-600" />
            <h2 class="text-sm font-semibold text-slate-900">Tables</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {{ schema?.database || "unknown_db" }} · {{ schema?.tableCount || 0 }} tables
          </span>
        </div>
        <div class="space-y-3 border-b border-slate-100 px-4 py-3">
          <div class="relative w-full max-w-sm">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              v-model="query"
              class="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Filter table or column"
            />
          </div>
        </div>
        <div class="p-4">
          <div v-if="loading" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Loading schema...
          </div>
          <div v-else-if="!schema || schema.tables.length === 0" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
            No tables found in this database yet.
          </div>
          <div v-else-if="filteredTables.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No tables match your filter.
          </div>
          <div v-else class="grid gap-4 lg:grid-cols-2">
            <article v-for="table in filteredTables" :key="table.name" class="rounded-lg border border-slate-200 bg-white">
              <div class="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ table.name }}</p>
                  <p class="text-xs text-slate-500">{{ table.columnCount }} columns</p>
                </div>
                <span class="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">{{ table.engine || "n/a" }}</span>
              </div>
              <div class="max-h-72 divide-y divide-slate-100 overflow-auto">
                <div v-for="column in table.columns" :key="`${table.name}-${column.name}`" class="flex items-center justify-between gap-3 px-4 py-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-900">
                      {{ column.name }}
                      <span v-if="column.key" class="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{{ column.key }}</span>
                    </p>
                    <p class="truncate text-xs text-slate-400">
                      {{ column.nullable ? "nullable" : "not null" }}
                      <span v-if="column.default !== null"> · default {{ column.default }}</span>
                      <span v-if="column.extra"> · {{ column.extra }}</span>
                    </p>
                  </div>
                  <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono text-slate-600">{{ column.type }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <div class="flex items-center gap-2">
            <Link2 class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">ERD Relationships</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {{ schema?.relationshipCount || 0 }} foreign keys
          </span>
        </div>
        <div class="p-4">
          <div v-if="loading" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Loading relationships...
          </div>
          <div v-else-if="!schema || schema.relationships.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No foreign-key relationships found.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="rel in visibleRelationships"
              :key="`${rel.constraintName}-${rel.sourceTable}-${rel.sourceColumn}`"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <code class="font-mono text-xs text-slate-500">{{ rel.constraintName }}</code>
              <p class="mt-1">
                <span class="font-semibold text-slate-900">{{ rel.sourceTable }}.{{ rel.sourceColumn }}</span>
                <span class="mx-1 text-slate-400">-></span>
                <span class="font-semibold text-slate-900">{{ rel.targetTable }}.{{ rel.targetColumn }}</span>
              </p>
              <p class="mt-0.5 text-xs text-slate-500">on update {{ rel.onUpdateRule }} · on delete {{ rel.onDeleteRule }}</p>
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <Link2 class="h-4 w-4 text-indigo-600" />
          <h2 class="text-sm font-semibold text-slate-900">ERD Diagram</h2>
        </div>
        <div class="p-4">
          <div v-if="loading" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Building diagram...
          </div>
          <div v-else-if="!schema || schema.tables.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Add tables first, then the ERD diagram will appear here.
          </div>
          <div v-else-if="filteredTables.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No diagram nodes match your filter.
          </div>
          <div v-else class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div class="relative" :style="{ width: `${diagramWidth}px`, height: `${diagramHeight}px` }">
              <svg class="absolute inset-0" :width="diagramWidth" :height="diagramHeight" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="erd-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
                  </marker>
                </defs>
                <line
                  v-for="edge in diagramEdges"
                  :key="edge.key"
                  :x1="edge.x1"
                  :y1="edge.y1"
                  :x2="edge.x2"
                  :y2="edge.y2"
                  stroke="#94a3b8"
                  stroke-width="1.4"
                  marker-end="url(#erd-arrow)"
                />
              </svg>

              <div
                v-for="node in diagramNodes"
                :key="node.id"
                class="absolute rounded-lg border border-slate-300 bg-white shadow-sm"
                :style="{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${diagramMetrics.cardWidth}px`,
                  height: `${diagramMetrics.cardHeight}px`,
                }"
              >
                <div class="border-b border-slate-100 px-3 py-2">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ node.table.name }}</p>
                  <p class="text-[11px] text-slate-500">{{ node.table.columnCount }} cols · {{ node.table.foreignKeys.length }} fk</p>
                </div>
                <div class="space-y-1 px-3 py-2">
                  <p
                    v-for="column in node.table.columns.slice(0, 5)"
                    :key="`${node.table.name}-${column.name}-mini`"
                    class="truncate text-[11px] text-slate-600"
                  >
                    <span class="font-medium text-slate-800">{{ column.name }}</span>: {{ column.type }}
                  </p>
                  <p v-if="node.table.columns.length > 5" class="text-[11px] text-slate-400">+{{ node.table.columns.length - 5 }} more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
