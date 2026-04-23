<script setup lang="ts">
import { useUiStore } from "@/stores/ui"

const ui = useUiStore()
</script>

<template>
  <div v-if="ui.toasts.length" class="toast-stack" aria-live="polite" aria-atomic="true">
    <div v-for="toast in ui.toasts" :key="toast.id" class="toast-item" :class="`is-${toast.tone}`">
      <span>{{ toast.message }}</span>
      <button type="button" class="toast-close" @click="ui.removeToast(toast.id)">Fechar</button>
    </div>
  </div>
</template>
