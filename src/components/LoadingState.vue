<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <p class="muted-text loading-state">{{ message ?? "Carregando..." }}</p>
</template>
