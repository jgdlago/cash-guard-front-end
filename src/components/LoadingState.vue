<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="loading-state" role="status" aria-live="polite">
    <span class="sr-only">{{ message ?? "Carregando..." }}</span>
    <div class="skeleton-row skeleton-row-wide"></div>
    <div class="skeleton-row"></div>
    <div class="skeleton-row skeleton-row-short"></div>
  </div>
</template>
