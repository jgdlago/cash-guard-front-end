<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-header">
    <div class="page-header-copy">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-description">{{ description }}</p>
      <slot name="meta" />
    </div>

    <div class="page-header-actions">
      <slot />
    </div>
  </header>
</template>
