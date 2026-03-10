<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Settings,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { listUsers, listRoles, deleteUser } from "@/api/cms";
import type { UserDetail, Role } from "@/types";

const allUsers = ref<UserDetail[]>([]);
const roles = ref<Role[]>([]);

const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
  admin: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  editor: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  auditor: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  viewer: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  penyelia: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  "eksekutif pemprosesan": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
  counter: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
};

const fallbackColor = { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" };

function getColor(role: string) {
  return roleColors[role.toLowerCase()] ?? fallbackColor;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// Group users by role
const usersByRole = computed(() => {
  const grouped: Record<string, UserDetail[]> = {};
  for (const user of allUsers.value) {
    const role = user.role || "unassigned";
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(user);
  }
  return Object.entries(grouped).sort(([a], [b]) => {
    if (a === "admin") return -1;
    if (b === "admin") return 1;
    return a.localeCompare(b);
  });
});

const totalUsers = computed(() => allUsers.value.length);
const activeUsers = computed(() => allUsers.value.filter((u) => u.isActive).length);
const totalRoles = computed(() => new Set(allUsers.value.map((u) => u.role)).size);

async function load() {
  const [usersRes, rolesRes] = await Promise.all([listUsers(), listRoles()]);
  allUsers.value = usersRes.data;
  roles.value = rolesRes.data;
}

async function remove(id: number) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  await deleteUser(id);
  await load();
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-3">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-sm text-slate-400">
        <router-link to="/settings" class="flex items-center gap-1 hover:text-slate-600">
          <Settings class="h-3.5 w-3.5" />
          Settings
        </router-link>
        <ChevronRight class="h-3.5 w-3.5" />
        <span class="font-medium text-slate-700">Users</span>
      </nav>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="page-title">User Matrix</h1>
        <router-link
          to="/settings/users/new"
          class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Plus class="h-4 w-4" />
          Add User
        </router-link>
      </div>

      <!-- Compact Stats -->
      <div class="flex items-center gap-4 text-sm">
        <span class="text-slate-400">{{ totalUsers }} users</span>
        <span class="text-slate-300">|</span>
        <span class="text-emerald-600">{{ activeUsers }} active</span>
        <span class="text-slate-300">|</span>
        <span class="text-violet-600">{{ totalRoles }} roles</span>
      </div>

      <!-- Matrix Table -->
      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
          <Users class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Users by Role</h2>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="[role, usersInRole] in usersByRole" :key="role">
            <!-- Role row -->
            <div class="flex items-center gap-2 bg-slate-50/70 px-4 py-1.5">
              <span class="h-2 w-2 rounded-full" :class="getColor(role).dot"></span>
              <span class="text-xs font-semibold uppercase tracking-wider" :class="getColor(role).text">{{ role }}</span>
              <span class="text-xs text-slate-400">({{ usersInRole.length }})</span>
            </div>

            <!-- User rows under this role -->
            <div class="divide-y divide-slate-50">
              <div
                v-for="user in usersInRole"
                :key="user.id"
                class="group flex items-center gap-3 px-4 py-1.5 pl-8 transition-colors hover:bg-slate-50"
              >
                <!-- Avatar -->
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  :class="[getColor(role).bg, getColor(role).text]"
                >
                  {{ getInitials(user.name) }}
                </div>

                <!-- Name -->
                <router-link
                  :to="'/settings/users/' + user.id"
                  class="w-40 truncate text-sm font-medium text-slate-900 hover:text-violet-600"
                >
                  {{ user.name }}
                </router-link>

                <!-- Email -->
                <span class="hidden flex-1 truncate text-xs text-slate-400 sm:block">{{ user.email }}</span>

                <!-- Status dot -->
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="user.isActive ? 'bg-emerald-500' : 'bg-slate-300'"
                  :title="user.isActive ? 'Active' : 'Inactive'"
                ></span>

                <!-- Actions -->
                <div class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <router-link
                    :to="'/settings/users/' + user.id"
                    class="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil class="h-3 w-3" />
                  </router-link>
                  <button
                    class="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    @click="remove(user.id)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="usersByRole.length === 0" class="px-4 py-8 text-center text-sm text-slate-400">
          No users found.
        </div>
      </article>
    </div>
  </AdminLayout>
</template>
