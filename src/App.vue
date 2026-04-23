<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router"

import AppIcon from "@/components/AppIcon.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import ToastStack from "@/components/ToastStack.vue"
import { useAuthStore } from "@/stores/auth"
import { useUiStore } from "@/stores/ui"

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const isAuthScreen = computed(() => route.name === "auth")
const pageTitle = computed(() => {
  switch (route.name) {
    case "dashboard":
      return "Dashboard"
    case "transactions":
      return "Lançamentos"
    case "categories":
      return "Categorias"
    case "payment-sources":
      return "Origens"
    case "installments":
      return "Parcelamentos"
    case "recurring-rules":
      return "Recorrências"
    case "audit-logs":
      return "Auditoria"
    default:
      return "Cash Guard"
  }
})

onMounted(() => {
  void auth.hydrate()
  ui.hydrateTheme()
})

watch(
  () => route.fullPath,
  () => {
    ui.closeMobileNav()
  },
)

async function handleLogout() {
  await auth.logout()
  ui.pushToast("Sessão encerrada.", "info")
  await router.push({ name: "auth" })
}

const navigation = [
  { to: "/dashboard", label: "Dashboard", shortLabel: "Resumo", icon: "dashboard" },
  { to: "/transactions", label: "Lançamentos", shortLabel: "Extrato", icon: "transactions" },
  { to: "/installments", label: "Parcelamentos", shortLabel: "Parcelas", icon: "installments" },
  { to: "/recurring-rules", label: "Recorrências", shortLabel: "Recorrências", icon: "recurring" },
  { to: "/categories", label: "Categorias", shortLabel: "Categorias", icon: "categories" },
  { to: "/payment-sources", label: "Origens", shortLabel: "Origens", icon: "sources" },
  { to: "/audit-logs", label: "Auditoria", shortLabel: "Auditoria", icon: "audit" },
] as const
</script>

<template>
  <div class="app-root">
    <ToastStack />

    <template v-if="isAuthScreen">
      <div class="auth-screen-shell">
        <div class="auth-screen-frame">
          <div class="auth-screen-toolbar">
            <ThemeToggle />
          </div>

          <RouterView />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="app-shell" :class="{ 'sidebar-collapsed': ui.sidebarCollapsed }">
        <aside class="sidebar" :class="{ 'is-open': ui.mobileNavOpen }">
          <div class="sidebar-top">
            <div class="sidebar-brand-row">
              <div class="brand-mark">C</div>
              <div v-if="!ui.sidebarCollapsed" class="brand-copy">
                <strong>Cash Guard</strong>
                <span>Controle pessoal</span>
              </div>
            </div>

            <button
              class="icon-button collapse-toggle desktop-only"
              type="button"
              :title="ui.sidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'"
              @click="ui.toggleSidebarCollapsed()"
            >
              <AppIcon :name="ui.sidebarCollapsed ? 'expand' : 'collapse'" />
            </button>
          </div>

          <nav class="nav-list nav-list-primary">
            <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-item" :title="ui.sidebarCollapsed ? item.label : undefined">
              <span class="nav-icon"><AppIcon :name="item.icon" /></span>
              <span v-if="!ui.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
            </RouterLink>
          </nav>

          <div class="sidebar-footer">
            <div class="sidebar-utility">
              <ThemeToggle />
            </div>

            <div v-if="auth.user && !ui.sidebarCollapsed" class="user-card user-card-compact">
              <strong>{{ auth.user.name }}</strong>
              <p>{{ auth.user.email }}</p>
            </div>

            <button class="ghost-button logout-button" @click="handleLogout">
              <span class="nav-icon"><AppIcon name="audit" /></span>
              <span v-if="!ui.sidebarCollapsed">Sair</span>
            </button>
          </div>
        </aside>

        <div v-if="ui.mobileNavOpen" class="shell-backdrop" @click="ui.closeMobileNav()"></div>

        <div class="shell-main">
          <header class="topbar">
            <div class="topbar-inner content-frame">
              <div class="topbar-heading">
                <button class="icon-button mobile-nav-trigger" type="button" @click="ui.openMobileNav()">
                  <AppIcon name="menu" />
                </button>
                <div>
                  <p class="eyebrow">Aplicação</p>
                  <strong class="topbar-title">{{ pageTitle }}</strong>
                </div>
              </div>

              <div class="topbar-actions">
                <ThemeToggle class="topbar-theme" />
              </div>
            </div>
          </header>

          <main class="content-panel">
            <div class="content-frame">
              <RouterView />
            </div>
          </main>
        </div>

        <nav class="mobile-bottom-nav">
          <RouterLink v-for="item in navigation.slice(0, 4)" :key="item.to" :to="item.to" class="mobile-bottom-link">
            <span class="mobile-bottom-icon"><AppIcon :name="item.icon" /></span>
            <span>{{ item.shortLabel }}</span>
          </RouterLink>
        </nav>
      </div>
    </template>
  </div>
</template>
