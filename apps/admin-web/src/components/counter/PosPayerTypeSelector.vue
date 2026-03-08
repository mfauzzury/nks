<script setup lang="ts">
import { Building2, User } from "lucide-vue-next";

defineEmits<{
  select: [type: "individu" | "korporat"];
}>();
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-2xl">
    <h2 class="mb-6 text-center text-2xl font-bold text-slate-800">
      Pilih Jenis Pembayar
    </h2>
    <div class="grid grid-cols-2 gap-4">
      <button
        class="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 px-6 py-8 text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50"
        @click="$emit('select', 'individu')"
      >
        <User class="h-10 w-10" />
        <span class="text-lg font-bold">Individu</span>
        <span class="text-sm text-slate-500">Pembayar perseorangan</span>
      </button>
      <button
        class="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 px-6 py-8 text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50"
        @click="$emit('select', 'korporat')"
      >
        <Building2 class="h-10 w-10" />
        <span class="text-lg font-bold">Syarikat</span>
        <span class="text-sm text-slate-500">Korporat / Majikan SPG</span>
      </button>
    </div>
  </div>
</template>
