<script setup lang="ts">
import { computed } from "vue"

import { useUiStore } from "@/stores/ui"

const ui = useUiStore()

const label = computed(() => {
  if (ui.themeMode === "system") {
    return "Tema: sistema"
  }

  if (ui.themeMode === "dark") {
    return "Tema: escuro"
  }

  return "Tema: claro"
})
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="label" @click="ui.cycleTheme()">
    <span class="theme-toggle-icon">{{ ui.resolvedTheme === "dark" ? "◐" : "◑" }}</span>
    <span>{{ label }}</span>
  </button>
</template>
