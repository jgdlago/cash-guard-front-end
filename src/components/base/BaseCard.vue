<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "muted" | "subtle"
    padded?: boolean
  }>(),
  {
    variant: "default",
    padded: true,
  },
)
</script>

<template>
  <section :class="['base-card', `is-${variant}`, { 'is-padded': padded }]">
    <slot />
  </section>
</template>
