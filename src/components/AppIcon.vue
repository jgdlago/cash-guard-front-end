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
  | "panel-collapse"
  | "panel-expand"
  | "logout"
  | "money"
  | "flow"
  | "calendar"
  | "wallet"
  | "card"
  | "tag"
  | "alert"
  | "filter"
  | "check"
  | "income"
  | "expense"
  | "spark"

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
    case "panel-collapse":
      return ["M4 5h16v14H4z", "M9 5v14", "M17 9l-3 3 3 3"]
    case "panel-expand":
      return ["M4 5h16v14H4z", "M9 5v14", "M14 9l3 3-3 3"]
    case "logout":
      return ["M9 6H5v12h4", "M13 8l4 4-4 4", "M17 12H9"]
    case "money":
      return ["M4 7h16v10H4z", "M7 10h.01M17 14h.01", "M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"]
    case "flow":
      return ["M4 7h9a4 4 0 0 1 4 4v6", "M14 14l3 3 3-3", "M20 7h-4"]
    case "calendar":
      return ["M5 5h14v15H5z", "M8 3v4M16 3v4M5 10h14"]
    case "wallet":
      return ["M4 7h15v11H4z", "M16 11h4v4h-4a2 2 0 0 1 0-4z", "M7 7V5h10"]
    case "card":
      return ["M4 7h16v10H4z", "M4 10h16", "M7 14h4"]
    case "tag":
      return ["M4 12l8-8h6v6l-8 8z", "M15 7h.01"]
    case "alert":
      return ["M12 4l9 16H3z", "M12 9v4", "M12 17h.01"]
    case "filter":
      return ["M4 6h16", "M7 12h10", "M10 18h4"]
    case "check":
      return ["M5 12l4 4L19 6"]
    case "income":
      return ["M12 19V5", "M6 11l6-6 6 6", "M5 19h14"]
    case "expense":
      return ["M12 5v14", "M18 13l-6 6-6-6", "M5 5h14"]
    case "spark":
      return ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"]
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
