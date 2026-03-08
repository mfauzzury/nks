<script setup lang="ts">
import { Banknote, Users } from "lucide-vue-next";

defineProps<{
  registered: boolean;
  companyName: string;
}>();

defineEmits<{
  select: [purpose: "zakat_korporat" | "spg"];
  back: [];
}>();
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-2xl">
    <div class="mb-4 flex items-center gap-3">
      <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="$emit('back')">
        &larr;
      </button>
      <h2 class="text-2xl font-bold text-slate-800">Tujuan Bayaran</h2>
    </div>

    <p class="mb-6 text-center text-sm text-slate-500">{{ companyName }}</p>

    <div class="grid grid-cols-2 gap-4">
      <button
        class="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 px-6 py-8 text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50"
        @click="$emit('select', 'zakat_korporat')"
      >
        <Banknote class="h-10 w-10" />
        <span class="text-lg font-bold">Zakat Korporat</span>
        <span class="text-sm text-slate-500">Bayaran zakat syarikat</span>
      </button>
      <button
        :disabled="!registered"
        class="flex flex-col items-center gap-3 rounded-xl border-2 px-6 py-8 transition-all"
        :class="
          registered
            ? 'border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
            : 'cursor-not-allowed border-slate-100 text-slate-300'
        "
        @click="registered && $emit('select', 'spg')"
      >
        <Users class="h-10 w-10" />
        <span class="text-lg font-bold">Skim Potongan Gaji</span>
        <span v-if="registered" class="text-sm text-slate-500">Potongan gaji pekerja</span>
        <span v-else class="text-xs text-red-400">Perlu daftar syarikat dahulu</span>
      </button>
    </div>
  </div>
</template>
