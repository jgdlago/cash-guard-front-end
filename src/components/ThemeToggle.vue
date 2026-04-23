<script setup lang="ts">
import { computed } from "vue"

import { useUiStore } from "@/stores/ui"

const ui = useUiStore()

const buttonText = computed(() => {
  if (ui.themeMode === "system") {
    return "Sistema"
  }

  return ui.resolvedTheme === "dark" ? "Escuro" : "Claro"
})

const label = computed(() => `Tema: ${buttonText.value.toLowerCase()}`)
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="label" @click="ui.cycleTheme()">
    <span class="theme-toggle-icon">{{ ui.resolvedTheme === "dark" ? "◐" : "◑" }}</span>
    <span>{{ buttonText }}</span>
  </button>
</template>
