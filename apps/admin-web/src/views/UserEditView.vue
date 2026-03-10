<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  User,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  Upload,
  Trash2,
  ArrowLeft,
  Shield,
  ChevronRight,
  Settings,
  Check,
  X,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { getUser, createUser, updateUser, listRoles } from "@/api/cms";
import { API_BASE_URL } from "@/env";
import type { Role } from "@/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isNew = computed(() => route.params.id === "new");
const userId = computed(() => (isNew.value ? null : Number(route.params.id)));
const isSelf = computed(() => userId.value !== null && userId.value === auth.user?.id);

const profileForm = ref({ name: "", email: "", role: "admin", isActive: true });
const passwordForm = ref({ currentPassword: "", newPassword: "", confirmPassword: "" });
const roles = ref<Role[]>([]);

const loading = ref(true);
const savingProfile = ref(false);
const savingPassword = ref(false);
const uploadingAvatar = ref(false);
const profileSaved = ref(false);
const passwordChanged = ref(false);
const profileError = ref("");
const passwordError = ref("");
const avatarError = ref("");

// For displaying avatar of the user being edited
const userPhotoUrl = ref<string | null>(null);

const userInitials = computed(() => {
  const name = profileForm.value.name;
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Matched role and permissions
const matchedRole = computed(() => roles.value.find((r) => r.name === profileForm.value.role));
const userPermissions = computed(() => matchedRole.value?.permissions ?? []);

const allPermissions = [
  "pembayar.view", "pembayar.create", "pembayar.edit", "pembayar.delete",
  "spg.view", "spg.create", "spg.edit",
  "kaunter.view", "kaunter.create", "kaunter.reconcile",
  "zakat.view", "zakat.create", "zakat.edit", "zakat.delete",
  "posts.view", "posts.create", "posts.edit", "posts.delete",
  "pages.view", "pages.create", "pages.edit", "pages.delete",
  "media.view", "media.upload", "media.delete",
  "users.view", "users.create", "users.edit", "users.delete",
  "roles.view", "roles.create", "roles.edit", "roles.delete",
  "settings.view", "settings.edit",
  "menus.view", "menus.edit",
  "integration.view", "integration.upload", "integration.process",
  "integration.reconcile", "integration.exceptions", "integration.reports",
  "development.view",
];

const groupedPermissions = allPermissions.reduce<Record<string, string[]>>((acc, p) => {
  const group = p.split(".")[0];
  if (!acc[group]) acc[group] = [];
  acc[group].push(p);
  return acc;
}, {});

const pageTitle = computed(() => {
  if (isNew.value) return "New User";
  if (isSelf.value) return "My Profile";
  return profileForm.value.name || "Edit User";
});

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

async function load() {
  loading.value = true;
  try {
    const rolesRes = await listRoles();
    roles.value = rolesRes.data;

    if (!isNew.value && userId.value) {
      const res = await getUser(userId.value);
      const u = res.data;
      profileForm.value = { name: u.name, email: u.email, role: u.role, isActive: u.isActive };

      // For self, use auth store's photoUrl (more up-to-date)
      if (isSelf.value) {
        userPhotoUrl.value = auth.user?.photoUrl || null;
      }
    }
  } catch (e: unknown) {
    profileError.value = e instanceof Error ? e.message : "Failed to load user";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  savingProfile.value = true;
  profileError.value = "";
  try {
    if (isNew.value) {
      // Create new user
      if (!passwordForm.value.newPassword) {
        profileError.value = "Password is required for new users";
        savingProfile.value = false;
        return;
      }
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        profileError.value = "Passwords do not match";
        savingProfile.value = false;
        return;
      }
      await createUser({
        name: profileForm.value.name,
        email: profileForm.value.email,
        password: passwordForm.value.newPassword,
        role: profileForm.value.role,
        isActive: profileForm.value.isActive,
      });
      router.push("/settings/users");
      return;
    }

    if (isSelf.value) {
      await auth.updateProfile({ name: profileForm.value.name, email: profileForm.value.email });
    } else {
      await updateUser(userId.value!, {
        name: profileForm.value.name,
        email: profileForm.value.email,
        role: profileForm.value.role,
        isActive: profileForm.value.isActive,
      });
    }
    profileSaved.value = true;
    setTimeout(() => { profileSaved.value = false; }, 2000);
  } catch (e: unknown) {
    profileError.value = e instanceof Error ? e.message : "Failed to save";
  } finally {
    savingProfile.value = false;
  }
}

async function savePassword() {
  passwordError.value = "";

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "New password and confirmation do not match";
    return;
  }

  if (isSelf.value) {
    if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
      passwordError.value = "Please fill in all password fields";
      return;
    }
  } else {
    if (!passwordForm.value.newPassword) {
      passwordError.value = "Please enter a new password";
      return;
    }
  }

  savingPassword.value = true;
  try {
    if (isSelf.value) {
      await auth.changePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      });
    } else {
      await updateUser(userId.value!, {
        name: profileForm.value.name,
        email: profileForm.value.email,
        password: passwordForm.value.newPassword,
        role: profileForm.value.role,
        isActive: profileForm.value.isActive,
      });
    }
    passwordChanged.value = true;
    passwordForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
    setTimeout(() => { passwordChanged.value = false; }, 2000);
  } catch (e: unknown) {
    passwordError.value = e instanceof Error ? e.message : "Failed to change password";
  } finally {
    savingPassword.value = false;
  }
}

async function onAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingAvatar.value = true;
  avatarError.value = "";
  try {
    await auth.uploadAvatar(file);
    userPhotoUrl.value = auth.user?.photoUrl || null;
  } catch (e: unknown) {
    avatarError.value = e instanceof Error ? e.message : "Failed to upload photo";
  } finally {
    uploadingAvatar.value = false;
    (event.target as HTMLInputElement).value = "";
  }
}

async function onRemoveAvatar() {
  avatarError.value = "";
  try {
    await auth.removeAvatar();
    userPhotoUrl.value = null;
  } catch (e: unknown) {
    avatarError.value = e instanceof Error ? e.message : "Failed to remove photo";
  }
}

watch(() => route.params.id, load);
onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <!-- Breadcrumb -->
      <nav v-if="!isSelf" class="flex items-center gap-1.5 text-sm text-slate-400">
        <router-link to="/settings" class="flex items-center gap-1 hover:text-slate-600">
          <Settings class="h-3.5 w-3.5" />
          Settings
        </router-link>
        <ChevronRight class="h-3.5 w-3.5" />
        <router-link to="/settings/users" class="hover:text-slate-600">Users</router-link>
        <ChevronRight class="h-3.5 w-3.5" />
        <span class="font-medium text-slate-700">{{ isNew ? 'New' : profileForm.name }}</span>
      </nav>

      <!-- ───── Page Header ───── -->
      <div class="flex items-center justify-between">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div v-if="!loading" class="grid gap-4 lg:grid-cols-[1fr_280px]">
        <!-- ═══════ LEFT COLUMN ═══════ -->
        <div class="space-y-4">
          <!-- ── User Information ── -->
          <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
              <User class="h-4 w-4 text-violet-600" />
              <h2 class="text-sm font-semibold text-slate-900">{{ isNew ? 'User Details' : 'Profile Information' }}</h2>
            </div>
            <div class="p-4">
              <div v-if="profileError" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ profileError }}
              </div>
              <div v-if="profileSaved" class="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 class="h-4 w-4" />
                Saved successfully
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    v-model="profileForm.name"
                    type="text"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Full name"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="user@example.com"
                  />
                </div>
                <!-- Admin-only fields -->
                <div v-if="!isSelf || isNew" class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Role</label>
                  <select
                    v-model="profileForm.role"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
                    <option v-if="roles.length === 0" value="admin">admin</option>
                  </select>
                </div>
                <div v-if="!isSelf || isNew" class="flex items-end pb-1">
                  <label class="relative inline-flex cursor-pointer items-center gap-3">
                    <input v-model="profileForm.isActive" type="checkbox" class="peer sr-only" />
                    <div class="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-violet-600 peer-checked:after:translate-x-full" />
                    <span class="text-sm text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <!-- Password fields for new user (inline) -->
              <div v-if="isNew" class="mt-3 grid gap-3 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Password</label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="••••••••"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Confirm Password</label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <button
                  class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  :disabled="savingProfile || !profileForm.name || !profileForm.email"
                  @click="saveProfile"
                >
                  <Save class="h-3.5 w-3.5" />
                  {{ isNew ? (savingProfile ? 'Creating...' : 'Create User') : (savingProfile ? 'Saving...' : 'Save Changes') }}
                </button>
              </div>
            </div>
          </article>

          <!-- ── Access & Permissions ── -->
          <article v-if="!isNew" class="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <div class="flex items-center gap-2">
                <Shield class="h-4 w-4 text-indigo-600" />
                <h2 class="text-sm font-semibold text-slate-900">Access & Permissions</h2>
              </div>
              <span v-if="matchedRole" class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                {{ matchedRole.name }}
              </span>
            </div>
            <div class="p-4">
              <p v-if="matchedRole" class="mb-3 text-xs text-slate-400">{{ matchedRole.description }}</p>
              <p v-else class="mb-3 text-xs text-slate-400">No matching role found for "{{ profileForm.role }}"</p>

              <div class="rounded-lg border border-slate-200 divide-y divide-slate-100">
                <div v-for="(perms, group) in groupedPermissions" :key="group" class="px-3 py-2">
                  <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ group }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="perm in perms"
                      :key="perm"
                      class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium"
                      :class="userPermissions.includes(perm)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-50 text-slate-300'"
                    >
                      <Check v-if="userPermissions.includes(perm)" class="h-3 w-3" />
                      <X v-else class="h-3 w-3" />
                      {{ perm.split('.')[1] }}
                    </span>
                  </div>
                </div>
              </div>

              <p class="mt-3 text-[11px] text-slate-400">
                {{ userPermissions.length }} of {{ allPermissions.length }} permissions granted
              </p>
            </div>
          </article>

          <!-- ── Change Password (edit mode only) ── -->
          <article v-if="!isNew" class="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
              <Lock class="h-4 w-4 text-amber-600" />
              <h2 class="text-sm font-semibold text-slate-900">{{ isSelf ? 'Change Password' : 'Set New Password' }}</h2>
            </div>
            <div class="p-4">
              <div v-if="passwordError" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ passwordError }}
              </div>
              <div v-if="passwordChanged" class="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 class="h-4 w-4" />
                Password {{ isSelf ? 'changed' : 'updated' }} successfully
              </div>
              <div class="space-y-3">
                <!-- Current password (self only) -->
                <div v-if="isSelf" class="space-y-1.5">
                  <label class="text-sm font-medium text-slate-700">Current Password</label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div class="grid gap-3 md:grid-cols-2">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-slate-700">New Password</label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button
                  class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  :disabled="savingPassword"
                  @click="savePassword"
                >
                  <Lock class="h-3.5 w-3.5" />
                  {{ savingPassword ? 'Saving...' : (isSelf ? 'Change Password' : 'Set Password') }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- ═══════ RIGHT COLUMN ═══════ -->
        <div class="space-y-4">
          <!-- ── Profile Photo (self only) ── -->
          <article v-if="isSelf" class="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
              <Camera class="h-4 w-4 text-indigo-600" />
              <h2 class="text-sm font-semibold text-slate-900">Profile Photo</h2>
            </div>
            <div class="flex flex-col items-center p-4">
              <div v-if="avatarError" class="mb-3 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ avatarError }}
              </div>
              <!-- Avatar preview -->
              <div class="mb-4">
                <img
                  v-if="auth.user?.photoUrl"
                  :src="resolveUrl(auth.user.photoUrl)"
                  alt="Profile photo"
                  class="h-24 w-24 rounded-full border-2 border-slate-200 object-cover"
                />
                <div
                  v-else
                  class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-semibold text-white"
                >
                  {{ userInitials }}
                </div>
              </div>
              <!-- Upload / Remove -->
              <div class="flex items-center gap-2">
                <label
                  class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  :class="uploadingAvatar ? 'opacity-50 pointer-events-none' : ''"
                >
                  <Upload class="h-4 w-4" />
                  {{ uploadingAvatar ? 'Uploading...' : 'Upload' }}
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="uploadingAvatar"
                    @change="onAvatarUpload"
                  />
                </label>
                <button
                  v-if="auth.user?.photoUrl"
                  class="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  @click="onRemoveAvatar"
                >
                  <Trash2 class="h-4 w-4" />
                  Remove
                </button>
              </div>
              <p class="mt-3 text-center text-xs text-slate-400">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
