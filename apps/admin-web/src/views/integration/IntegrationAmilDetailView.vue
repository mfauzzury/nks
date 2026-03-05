<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Pencil, Users } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

const route = useRoute();
const amilId = computed(() => Number(route.params.id));

const amil = ref<{ code: string; name: string; noKp: string; status: string } | null>(null);
const loading = ref(true);
const error = ref("");

async function load() {
  loading.value = true;
  try {
    // TODO: const res = await getAmil(amilId.value); amil.value = res.data;
    amil.value = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link
            to="/integration/3rd-party/amil"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft class="h-4 w-4" />
          </router-link>
          <h1 class="page-title">View Amil</h1>
        </div>
        <router-link
          v-if="amil"
          :to="'/integration/3rd-party/amil/' + amilId + '/edit'"
          class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Pencil class="h-4 w-4" />
          Edit
        </router-link>
      </div>

      <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>

      <article v-if="amil && !loading" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Users class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900">Maklumat Amil</h2>
        </div>
        <dl class="mt-4 space-y-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Kod Amil</dt>
            <dd class="mt-1 font-medium text-slate-900">{{ amil.code }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Nama</dt>
            <dd class="mt-1 text-slate-900">{{ amil.name }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">No Kp</dt>
            <dd class="mt-1 text-slate-900">{{ amil.noKp || "-" }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Status</dt>
            <dd class="mt-1">
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{{ amil.status }}</span>
            </dd>
          </div>
        </dl>
      </article>
      <div v-else-if="!amil && !loading" class="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Amil tidak dijumpai.
      </div>
      <div v-else class="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Loading...
      </div>
    </div>
  </AdminLayout>
</template>
