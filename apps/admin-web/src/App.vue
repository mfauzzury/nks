<template>
  <router-view />
  <AppToastRegion />
  <AppConfirmDialog />
</template>

<script setup lang="ts">
import AppToastRegion from "@/components/AppToastRegion.vue";
import AppConfirmDialog from "@/components/AppConfirmDialog.vue";
</script>
