<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router"

import AppIcon from "@/components/AppIcon.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import ToastStack from "@/components/ToastStack.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
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
          <div class="sidebar-scroll">
            <div class="sidebar-top sidebar-top-refined">
              <RouterLink to="/dashboard" class="sidebar-brand-row sidebar-brand-link">
                <div class="brand-mark">C</div>
                <div class="brand-copy" :class="{ 'is-hidden': ui.sidebarCollapsed }" aria-hidden="true">
                  <strong>Cash Guard</strong>
                  <span>Controle pessoal</span>
                </div>
              </RouterLink>

              <BaseButton
                class="desktop-only app-icon-control collapse-toggle"
                variant="ghost"
                :title="ui.sidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'"
                @click="ui.toggleSidebarCollapsed()"
              >
                <AppIcon :name="ui.sidebarCollapsed ? 'expand' : 'collapse'" />
              </BaseButton>
            </div>

            <nav class="nav-list nav-list-primary">
              <RouterLink
                v-for="item in navigation"
                :key="item.to"
                :to="item.to"
                class="nav-item"
                :title="ui.sidebarCollapsed ? item.label : undefined"
              >
                <span class="nav-icon"><AppIcon :name="item.icon" /></span>
                <span class="nav-label" :class="{ 'is-hidden': ui.sidebarCollapsed }" aria-hidden="true">{{ item.label }}</span>
              </RouterLink>
            </nav>
          </div>

          <div class="sidebar-footer">
            <BaseCard
              v-if="auth.user"
              variant="muted"
              class="user-card user-card-compact"
              :class="{ 'is-collapsed': ui.sidebarCollapsed }"
              :padded="false"
              :aria-hidden="ui.sidebarCollapsed"
            >
              <strong>{{ auth.user.name }}</strong>
              <p>{{ auth.user.email }}</p>
            </BaseCard>

            <BaseButton class="logout-button" variant="ghost" :title="ui.sidebarCollapsed ? 'Sair' : undefined" @click="handleLogout">
              <span class="nav-icon"><AppIcon name="logout" /></span>
              <span class="logout-label" :class="{ 'is-hidden': ui.sidebarCollapsed }" aria-hidden="true">Sair</span>
            </BaseButton>
          </div>
        </aside>

        <div v-if="ui.mobileNavOpen" class="shell-backdrop" @click="ui.closeMobileNav()"></div>

        <div class="shell-main">
          <header class="topbar">
            <div class="topbar-inner content-frame">
              <div class="topbar-heading">
                <BaseButton class="mobile-nav-trigger" variant="ghost" @click="ui.openMobileNav()">
                  <AppIcon name="menu" />
                </BaseButton>
                <div>
                  <p class="eyebrow">Aplicação</p>
                  <strong class="topbar-title">{{ pageTitle }}</strong>
                </div>
              </div>

              <div class="topbar-actions">
                <ThemeToggle />
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
