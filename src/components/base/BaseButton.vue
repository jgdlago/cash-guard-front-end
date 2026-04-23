<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "ghost"
    type?: "button" | "submit" | "reset"
    block?: boolean
    disabled?: boolean
  }>(),
  {
    variant: "primary",
    type: "button",
    block: false,
    disabled: false,
  },
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['base-button', `is-${variant}`, { 'is-block': block }]">
    <slot />
  </button>
</template>
