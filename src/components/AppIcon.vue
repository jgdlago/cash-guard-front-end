<script setup lang="ts">
import { computed } from "vue"

type IconName =
  | "dashboard"
  | "transactions"
  | "installments"
  | "recurring"
  | "categories"
  | "sources"
  | "audit"
  | "menu"
  | "collapse"
  | "expand"

const props = defineProps<{
  name: IconName
}>()

const paths = computed(() => {
  switch (props.name) {
    case "dashboard":
      return ["M4 13h6V5H4zm10 7h6V5h-6zm-10 0h6v-5H4zm10-9h6V9h-6z"]
    case "transactions":
      return ["M5 7h11M12 4l4 3-4 3", "M19 17H8M12 14l-4 3 4 3"]
    case "installments":
      return ["M4 7h16M7 4v6M17 4v6M5 10h14v10H5z", "M8 14h3M13 14h3M8 18h3M13 18h3"]
    case "recurring":
      return ["M20 6v5h-5", "M4 18v-5h5", "M19 11a7 7 0 0 0-12-4L4 11", "M5 13a7 7 0 0 0 12 4l3-4"]
    case "categories":
      return ["M4 7l8-3 8 3-8 3-8-3z", "M4 12l8 3 8-3", "M4 17l8 3 8-3"]
    case "sources":
      return ["M4 8h16v10H4z", "M4 11h16", "M8 15h4"]
    case "audit":
      return ["M12 7v5l3 3", "M4 6h16v14H4z", "M8 3h8"]
    case "menu":
      return ["M4 7h16M4 12h16M4 17h16"]
    case "collapse":
      return ["M15 6l-6 6 6 6", "M5 5v14"]
    case "expand":
      return ["M9 6l6 6-6 6", "M19 5v14"]
    default:
      return []
  }
})
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="path in paths" :key="path" :d="path" />
  </svg>
</template>
