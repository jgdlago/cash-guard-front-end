<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <label class="base-field">
    <span class="base-field-label">{{ label }}</span>
    <slot />
  </label>
</template>
