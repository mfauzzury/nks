<script setup lang="ts">
import { computed, ref } from "vue";
import { Braces, ChevronDown, Search, ShieldCheck } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type MethodTab = "ALL" | HttpMethod;

type Endpoint = {
  method: HttpMethod;
  path: string;
  summary: string;
  auth: "public" | "auth" | "auth+csrf";
  body?: string;
};

type Group = { label: string; endpoints: Endpoint[] };

const groups: Group[] = [
  {
    label: "Auth",
    endpoints: [
      { method: "POST", path: "/api/auth/login", summary: "Login and create session", auth: "public", body: '{ "email": "admin@zakatbantu.my", "password": "admin12345" }' },
      { method: "POST", path: "/api/auth/logout", summary: "Logout and clear session", auth: "auth+csrf" },
      { method: "GET", path: "/api/auth/me", summary: "Get current user and csrf token", auth: "auth" },
    ],
  },
  {
    label: "Content",
    endpoints: [
      { method: "GET", path: "/api/posts", summary: "List posts", auth: "auth" },
      { method: "POST", path: "/api/posts", summary: "Create post", auth: "auth+csrf" },
      { method: "PUT", path: "/api/posts/:id", summary: "Update post", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/posts/:id", summary: "Delete post", auth: "auth+csrf" },
      { method: "GET", path: "/api/pages", summary: "List pages", auth: "auth" },
      { method: "POST", path: "/api/pages", summary: "Create page", auth: "auth+csrf" },
      { method: "PUT", path: "/api/pages/:id", summary: "Update page", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/pages/:id", summary: "Delete page", auth: "auth+csrf" },
      { method: "GET", path: "/api/categories", summary: "List categories", auth: "auth" },
      { method: "POST", path: "/api/categories", summary: "Create category", auth: "auth+csrf" },
      { method: "PUT", path: "/api/categories/:id", summary: "Update category", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/categories/:id", summary: "Delete category", auth: "auth+csrf" },
    ],
  },
  {
    label: "Media",
    endpoints: [
      { method: "GET", path: "/api/media", summary: "List uploaded media", auth: "auth" },
      { method: "POST", path: "/api/media/upload", summary: "Upload media file", auth: "auth+csrf" },
      { method: "PUT", path: "/api/media/:id", summary: "Update media metadata", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/media/:id", summary: "Delete media", auth: "auth+csrf" },
    ],
  },
  {
    label: "Configuration",
    endpoints: [
      { method: "GET", path: "/api/settings", summary: "Get site settings", auth: "public" },
      { method: "PUT", path: "/api/settings", summary: "Update site settings", auth: "auth+csrf" },
      { method: "GET", path: "/api/settings/admin-menu-prefs", summary: "Get menu preferences", auth: "auth" },
      { method: "PUT", path: "/api/settings/admin-menu-prefs", summary: "Save menu preferences", auth: "auth+csrf" },
      { method: "GET", path: "/api/dashboard/summary", summary: "Dashboard summary stats", auth: "auth" },
      { method: "GET", path: "/api/health", summary: "Health check", auth: "public" },
    ],
  },
  {
    label: "Administration",
    endpoints: [
      { method: "GET", path: "/api/users", summary: "List users", auth: "auth" },
      { method: "POST", path: "/api/users", summary: "Create user", auth: "auth+csrf" },
      { method: "PUT", path: "/api/users/:id", summary: "Update user", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/users/:id", summary: "Delete user", auth: "auth+csrf" },
      { method: "GET", path: "/api/roles", summary: "List roles", auth: "auth" },
      { method: "POST", path: "/api/roles", summary: "Create role", auth: "auth+csrf" },
      { method: "PUT", path: "/api/roles/:id", summary: "Update role", auth: "auth+csrf" },
      { method: "DELETE", path: "/api/roles/:id", summary: "Delete role", auth: "auth+csrf" },
    ],
  },
];

const query = ref("");
const activeTab = ref<MethodTab>("ALL");

const allEndpoints = computed(() => groups.flatMap((group) => group.endpoints));

const tabStats = computed(() => ({
  ALL: allEndpoints.value.length,
  GET: allEndpoints.value.filter((endpoint) => endpoint.method === "GET").length,
  POST: allEndpoints.value.filter((endpoint) => endpoint.method === "POST").length,
  PUT: allEndpoints.value.filter((endpoint) => endpoint.method === "PUT").length,
  DELETE: allEndpoints.value.filter((endpoint) => endpoint.method === "DELETE").length,
}));

const tabs: MethodTab[] = ["ALL", "GET", "POST", "PUT", "DELETE"];

const filteredGroups = computed(() => {
  const q = query.value.trim().toLowerCase();

  return groups
    .map((group) => ({
      ...group,
      endpoints: group.endpoints.filter((endpoint) => {
        const tabOk = activeTab.value === "ALL" || endpoint.method === activeTab.value;
        if (!tabOk) return false;
        if (!q) return true;
        const hay = `${endpoint.method} ${endpoint.path} ${endpoint.summary} ${endpoint.auth}`.toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((group) => group.endpoints.length > 0);
});

function methodClass(method: HttpMethod) {
  if (method === "GET") return "bg-emerald-100 text-emerald-700";
  if (method === "POST") return "bg-blue-100 text-blue-700";
  if (method === "PUT") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function authLabel(auth: Endpoint["auth"]) {
  if (auth === "public") return "Public";
  if (auth === "auth") return "Auth";
  return "Auth + CSRF";
}
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="page-title">API Management</h1>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="space-y-3 border-b border-slate-100 px-4 py-3">
          <div class="flex items-center gap-2">
            <Braces class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">Endpoint Explorer</h2>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="tab in tabs"
              :key="tab"
              class="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
              :class="activeTab === tab ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'"
              @click="activeTab = tab"
            >
              <span>{{ tab }}</span>
              <span
                class="rounded-full px-1.5 py-0.5 text-[11px]"
                :class="activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
              >
                {{ tabStats[tab] }}
              </span>
            </button>
          </div>

          <div class="relative w-full max-w-sm">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              v-model="query"
              class="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search endpoint"
            />
          </div>
        </div>

        <div class="space-y-3 p-4">
          <details v-for="(group, index) in filteredGroups" :key="group.label" class="overflow-hidden rounded-lg border border-slate-200" :open="index === 0">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              <div class="flex items-center gap-2">
                <span>{{ group.label }}</span>
                <span class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">{{ group.endpoints.length }}</span>
              </div>
              <ChevronDown class="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>

            <div class="divide-y divide-slate-100">
              <details v-for="endpoint in group.endpoints" :key="`${endpoint.method}-${endpoint.path}`" class="group">
                <summary class="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-slate-50">
                  <div class="min-w-0 flex items-center gap-2">
                    <span class="rounded px-2 py-0.5 text-[11px] font-semibold" :class="methodClass(endpoint.method)">{{ endpoint.method }}</span>
                    <code class="truncate text-xs text-slate-700">{{ endpoint.path }}</code>
                    <span class="truncate text-slate-500">{{ endpoint.summary }}</span>
                  </div>
                  <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    <ShieldCheck class="h-3 w-3" />
                    {{ authLabel(endpoint.auth) }}
                  </span>
                </summary>
                <div class="space-y-2 border-t border-slate-100 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-600">
                  <p><span class="font-semibold text-slate-800">Auth:</span> {{ authLabel(endpoint.auth) }}</p>
                  <div v-if="endpoint.body" class="space-y-1">
                    <p class="font-semibold text-slate-800">Sample Body</p>
                    <pre class="overflow-x-auto rounded bg-slate-900 p-2 text-[11px] text-slate-100">{{ endpoint.body }}</pre>
                  </div>
                </div>
              </details>
            </div>
          </details>

          <div v-if="filteredGroups.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No endpoints match your filter.
          </div>
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
