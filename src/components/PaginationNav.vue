<script setup lang="ts">
interface PaginationMeta {
  current_page?: number
  last_page?: number
}

const props = defineProps<{
  meta?: PaginationMeta
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

function goTo(page: number) {
  if (!props.meta?.last_page || page < 1 || page > props.meta.last_page || page === props.meta.current_page) {
    return
  }

  emit("change", page)
}
</script>

<template>
  <nav v-if="meta?.last_page && meta.last_page > 1" class="pagination-nav" aria-label="Paginação">
    <button class="ghost-button" type="button" :disabled="meta.current_page === 1" @click="goTo((meta.current_page ?? 1) - 1)">
      Anterior
    </button>

    <span class="pagination-status">Página {{ meta.current_page }} de {{ meta.last_page }}</span>

    <button
      class="ghost-button"
      type="button"
      :disabled="meta.current_page === meta.last_page"
      @click="goTo((meta.current_page ?? 1) + 1)"
    >
      Próxima
    </button>
  </nav>
</template>
