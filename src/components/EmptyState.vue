<script setup lang="ts">
import AppIcon from "@/components/AppIcon.vue"

defineProps<{
  title: string
  description?: string
  icon?: "money" | "flow" | "calendar" | "wallet" | "tag" | "alert" | "filter" | "spark" | "recurring"
  tone?: "default" | "income" | "expense" | "warning" | "recurring" | "flow"
}>()
</script>

<template>
  <div :class="['empty-state', `tone-${tone ?? 'default'}`]">
    <span class="empty-state-icon">
      <AppIcon :name="icon ?? 'spark'" />
    </span>
    <div>
      <strong>{{ title }}</strong>
      <p v-if="description">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
