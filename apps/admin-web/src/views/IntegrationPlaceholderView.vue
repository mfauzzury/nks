<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Plug } from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";

const route = useRoute();
const pageTitle = computed(() => (route.meta.title as string) || "Integration 3rd Party");
const description = computed(() => (route.meta.integrationDescription as string) || "Page to be implemented.");
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
        <Plug class="mx-auto mb-4 h-16 w-16 text-slate-400" />
        <p class="text-lg font-medium text-slate-600">Page to be implemented</p>
        <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
      </div>
    </div>
  </AdminLayout>
</template>
