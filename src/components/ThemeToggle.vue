<script setup lang="ts">
import { useUiStore } from "@/stores/ui"

const ui = useUiStore()
</script>

<template>
  <button
    class="theme-switch"
    type="button"
    role="switch"
    :aria-checked="ui.isDarkMode"
    :title="ui.isDarkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro'"
    @click="ui.toggleTheme()"
  >
    <span class="sr-only">Alternar tema</span>
    <span class="theme-switch-track">
      <span class="theme-switch-thumb"></span>
    </span>
  </button>
</template>
