<script setup lang="ts">
import { onMounted, ref, unref } from "vue";
import {
  Settings,
  Globe,
  Image,
  Search,
  Save,
  CheckCircle2,
  Upload,
  Trash2,
  FolderOpen,
  X,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";
import { getSettings, updateSettings, uploadMedia, listMedia } from "@/api/cms";
import { API_BASE_URL } from "@/env";
import { useSiteStore } from "@/stores/site";
import { useRoute } from "vue-router";
import type { Media, SettingsPayload } from "@/types";

const site = useSiteStore();
const route = useRoute();

const form = ref<SettingsPayload>({
  siteTitle: "",
  tagline: "",
  titleFormat: "%page% | %site%",
  metaDescription: "",
  siteIconUrl: "",
  sidebarLogoUrl: "",
  portalLogoUrl: "",
  faviconUrl: "",
  language: "en",
  timezone: "UTC",
  footerText: "",
});

const saved = ref(false);
const saving = ref(false);
const error = ref("");
const uploadingSiteIcon = ref(false);
const uploadingSidebarLogo = ref(false);
const uploadingPortalLogo = ref(false);
const uploadingFavicon = ref(false);

const mediaPickerOpen = ref(false);
const mediaPickerTarget = ref<"siteIconUrl" | "faviconUrl" | "sidebarLogoUrl" | "portalLogoUrl">("siteIconUrl");
const mediaPickerItems = ref<Media[]>([]);
const mediaPickerLoading = ref(false);

async function openMediaPicker(target: typeof mediaPickerTarget.value) {
  mediaPickerTarget.value = target;
  mediaPickerOpen.value = true;
  mediaPickerLoading.value = true;
  try {
    const res = await listMedia();
    mediaPickerItems.value = res.data.filter((m: Media) => m.mimeType.startsWith("image/"));
  } catch {
    mediaPickerItems.value = [];
  } finally {
    mediaPickerLoading.value = false;
  }
}

function selectFromLibrary(item: Media) {
  form.value[mediaPickerTarget.value] = item.url;
  mediaPickerOpen.value = false;
  dragMediaPicker.resetPosition();
}

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

async function onSiteIconUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingSiteIcon.value = true;
  error.value = "";
  try {
    const res = await uploadMedia(file);
    form.value.siteIconUrl = res.data.url;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to upload site icon";
  } finally {
    uploadingSiteIcon.value = false;
    (event.target as HTMLInputElement).value = "";
  }
}

async function onFaviconUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingFavicon.value = true;
  error.value = "";
  try {
    const res = await uploadMedia(file);
    form.value.faviconUrl = res.data.url;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to upload favicon";
  } finally {
    uploadingFavicon.value = false;
    (event.target as HTMLInputElement).value = "";
  }
}

async function onSidebarLogoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingSidebarLogo.value = true;
  error.value = "";
  try {
    const res = await uploadMedia(file);
    form.value.sidebarLogoUrl = res.data.url;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to upload sidebar logo";
  } finally {
    uploadingSidebarLogo.value = false;
    (event.target as HTMLInputElement).value = "";
  }
}

async function onPortalLogoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingPortalLogo.value = true;
  error.value = "";
  try {
    const res = await uploadMedia(file);
    form.value.portalLogoUrl = res.data.url;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to upload portal logo";
  } finally {
    uploadingPortalLogo.value = false;
    (event.target as HTMLInputElement).value = "";
  }
}

async function load() {
  try {
    const response = await getSettings();
    form.value = response.data;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load settings";
  }
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    await updateSettings(form.value);
    site.applyFrom(form.value);
    site.setDocumentTitle((route.meta.title as string) || "Settings");
    saved.value = true;
    setTimeout(() => {
      saved.value = false;
    }, 2000);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to save settings";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-7xl space-y-4">
      <!-- ───── Hero Header ───── -->
      <div class="flex items-center justify-between">
        <h1 class="page-title">Settings</h1>
      </div>

      <div class="space-y-4">
        <!-- ═══════ GENERAL ═══════ -->
        <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
            <Globe class="h-4 w-4 text-violet-600" />
            <h2 class="text-sm font-semibold text-slate-900">General</h2>
          </div>
          <div class="p-4">
            <div class="grid gap-3 md:grid-cols-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">Site Title</label>
                <input v-model="form.siteTitle" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">Tagline</label>
                <input v-model="form.tagline" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">Language</label>
                <input v-model="form.language" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">Timezone</label>
                <input v-model="form.timezone" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div class="space-y-1.5 md:col-span-2">
                <label class="text-sm font-medium text-slate-700">Footer Text</label>
                <input v-model="form.footerText" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="e.g. © 2026 My Company" />
                <p class="text-xs text-slate-400">Displayed at the bottom of the sidebar.</p>
              </div>
            </div>
          </div>
        </article>

        <!-- ═══════ SEO ═══════ -->
        <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
            <Search class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-slate-900">SEO</h2>
          </div>
          <div class="p-4">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-1.5 md:col-span-2">
                <label class="text-sm font-medium text-slate-700">Title Format</label>
                <input v-model="form.titleFormat" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
                <p class="text-xs text-slate-400">Use <code class="rounded bg-slate-100 px-1 py-0.5 text-xs">%page%</code> and <code class="rounded bg-slate-100 px-1 py-0.5 text-xs">%site%</code> as placeholders.</p>
              </div>
              <div class="space-y-1.5 md:col-span-2">
                <label class="text-sm font-medium text-slate-700">Meta Description</label>
                <textarea v-model="form.metaDescription" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
            </div>
          </div>
        </article>

        <!-- ═══════ BRANDING ═══════ -->
        <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
            <Image class="h-4 w-4 text-amber-600" />
            <h2 class="text-sm font-semibold text-slate-900">Branding</h2>
          </div>
          <div class="p-4">
            <div class="grid gap-3 md:grid-cols-2">
              <!-- Site Icon -->
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700">Site Icon</label>
                <div class="flex items-start gap-4">
                  <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <img v-if="form.siteIconUrl" :src="resolveUrl(form.siteIconUrl)" alt="Site icon" class="h-full w-full object-contain" />
                    <Image v-else class="h-8 w-8 text-slate-300" />
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        <Upload class="h-4 w-4" />
                        {{ uploadingSiteIcon ? 'Uploading...' : 'Upload' }}
                        <input type="file" accept="image/*" class="hidden" @change="onSiteIconUpload" :disabled="uploadingSiteIcon" />
                      </label>
                      <button class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50" @click="openMediaPicker('siteIconUrl')">
                        <FolderOpen class="h-4 w-4" />
                        Library
                      </button>
                    </div>
                    <button v-if="form.siteIconUrl" class="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-rose-500" @click="form.siteIconUrl = ''">
                      <Trash2 class="h-3 w-3" />
                      Remove
                    </button>
                    <p class="text-xs text-slate-400">Recommended: 512x512px PNG</p>
                  </div>
                </div>
              </div>

              <!-- Favicon -->
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700">Favicon</label>
                <div class="flex items-start gap-4">
                  <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <img v-if="form.faviconUrl" :src="resolveUrl(form.faviconUrl)" alt="Favicon" class="h-full w-full object-contain" />
                    <Image v-else class="h-8 w-8 text-slate-300" />
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        <Upload class="h-4 w-4" />
                        {{ uploadingFavicon ? 'Uploading...' : 'Upload' }}
                        <input type="file" accept="image/*,.ico" class="hidden" @change="onFaviconUpload" :disabled="uploadingFavicon" />
                      </label>
                      <button class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50" @click="openMediaPicker('faviconUrl')">
                        <FolderOpen class="h-4 w-4" />
                        Library
                      </button>
                    </div>
                    <button v-if="form.faviconUrl" class="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-rose-500" @click="form.faviconUrl = ''">
                      <Trash2 class="h-3 w-3" />
                      Remove
                    </button>
                    <p class="text-xs text-slate-400">Recommended: 32x32px ICO or PNG</p>
                  </div>
                </div>
              </div>

              <!-- Sidebar Logo -->
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700">Sidebar Logo (Secondary)</label>
                <div class="flex items-start gap-4">
                  <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <img v-if="form.sidebarLogoUrl" :src="resolveUrl(form.sidebarLogoUrl)" alt="Sidebar logo" class="h-full w-full object-contain" />
                    <Image v-else class="h-8 w-8 text-slate-300" />
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        <Upload class="h-4 w-4" />
                        {{ uploadingSidebarLogo ? 'Uploading...' : 'Upload' }}
                        <input type="file" accept="image/*" class="hidden" @change="onSidebarLogoUpload" :disabled="uploadingSidebarLogo" />
                      </label>
                      <button class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50" @click="openMediaPicker('sidebarLogoUrl')">
                        <FolderOpen class="h-4 w-4" />
                        Library
                      </button>
                    </div>
                    <button v-if="form.sidebarLogoUrl" class="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-rose-500" @click="form.sidebarLogoUrl = ''">
                      <Trash2 class="h-3 w-3" />
                      Remove
                    </button>
                    <p class="text-xs text-slate-400">Shown at top of sidebar when provided.</p>
                  </div>
                </div>
              </div>

              <!-- Portal Logo -->
              <div class="space-y-3">
                <label class="text-sm font-medium text-slate-700">Portal Logo</label>
                <div class="flex items-start gap-4">
                  <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <img v-if="form.portalLogoUrl" :src="resolveUrl(form.portalLogoUrl)" alt="Portal logo" class="h-full w-full object-contain" />
                    <Image v-else class="h-8 w-8 text-slate-300" />
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        <Upload class="h-4 w-4" />
                        {{ uploadingPortalLogo ? 'Uploading...' : 'Upload' }}
                        <input type="file" accept="image/*" class="hidden" @change="onPortalLogoUpload" :disabled="uploadingPortalLogo" />
                      </label>
                      <button class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50" @click="openMediaPicker('portalLogoUrl')">
                        <FolderOpen class="h-4 w-4" />
                        Library
                      </button>
                    </div>
                    <button v-if="form.portalLogoUrl" class="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-rose-500" @click="form.portalLogoUrl = ''">
                      <Trash2 class="h-3 w-3" />
                      Remove
                    </button>
                    <p class="text-xs text-slate-400">Displayed on storefront header, portal navigation, and POS screen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- ═══════ ACTIONS ═══════ -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <button
              class="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
              :disabled="saving"
              @click="save"
            >
              <Save class="h-4 w-4" />
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="saved" class="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 class="h-4 w-4" />
                Saved
              </span>
            </Transition>
          </div>
          <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- ═══════ MEDIA PICKER MODAL ═══════ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="mediaPickerOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="mediaPickerOpen = false; dragMediaPicker.resetPosition()">
          <div
            :ref="dragMediaPicker.modalRef"
            :style="unref(dragMediaPicker.modalStyle)"
            class="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div
              class="flex cursor-move items-center justify-between border-b border-slate-100 px-5 py-3"
              @mousedown="dragMediaPicker.onHandleMouseDown"
            >
              <div class="flex items-center gap-2">
                <FolderOpen class="h-4 w-4 text-amber-600" />
                <h3 class="text-sm font-semibold text-slate-900">Select from Library</h3>
              </div>
              <button class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" @click="mediaPickerOpen = false; dragMediaPicker.resetPosition()">
                <X class="h-4 w-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <p v-if="mediaPickerLoading" class="py-10 text-center text-sm text-slate-400">Loading...</p>
              <p v-else-if="mediaPickerItems.length === 0" class="py-10 text-center text-sm text-slate-400">No images in library.</p>
              <div v-else class="grid grid-cols-4 gap-3 sm:grid-cols-5">
                <button
                  v-for="item in mediaPickerItems"
                  :key="item.id"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition-all hover:border-[var(--accent-400)] hover:ring-1 hover:ring-[var(--accent-200)]"
                  @click="selectFromLibrary(item)"
                >
                  <img :src="resolveUrl(item.url)" :alt="item.altText || item.originalName" class="absolute inset-0 h-full w-full object-cover" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>
