<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router"

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
  { to: "/dashboard", label: "Dashboard", shortLabel: "Resumo" },
  { to: "/transactions", label: "Lançamentos", shortLabel: "Extrato" },
  { to: "/installments", label: "Parcelamentos", shortLabel: "Parcelas" },
  { to: "/categories", label: "Categorias", shortLabel: "Categorias" },
  { to: "/payment-sources", label: "Origens", shortLabel: "Origens" },
]
</script>

<template>
  <div class="app-root">
    <ToastStack />

    <template v-if="isAuthScreen">
      <div class="auth-screen-shell">
        <div class="auth-screen-toolbar">
          <ThemeToggle />
        </div>

        <RouterView />
      </div>
    </template>

    <template v-else>
      <div class="app-shell">
        <aside class="sidebar" :class="{ 'is-open': ui.mobileNavOpen }">
          <div class="sidebar-brand">
            <p class="eyebrow">Cash Guard</p>
            <h1>Finanças pessoais sem atrito.</h1>
            <p class="sidebar-copy">
              Registre entradas e saídas com clareza, use categorias e origens opcionais e acompanhe o mês sem lógica bancária pesada.
            </p>
          </div>

          <nav class="nav-list">
            <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-item">
              <span>{{ item.label }}</span>
              <small>{{ item.shortLabel }}</small>
            </RouterLink>
          </nav>

          <div class="sidebar-footer">
            <div v-if="auth.user" class="user-card">
              <strong>{{ auth.user.name }}</strong>
              <p>{{ auth.user.email }}</p>
            </div>

            <div class="sidebar-actions">
              <ThemeToggle />
              <button class="ghost-button" @click="handleLogout">Sair</button>
            </div>
          </div>
        </aside>

        <div v-if="ui.mobileNavOpen" class="shell-backdrop" @click="ui.closeMobileNav()"></div>

        <div class="shell-main">
          <header class="topbar">
            <div>
              <p class="eyebrow">Aplicação</p>
              <strong class="topbar-title">{{ pageTitle }}</strong>
            </div>

            <div class="topbar-actions">
              <button class="ghost-button mobile-nav-trigger" type="button" @click="ui.openMobileNav()">
                Menu
              </button>
              <ThemeToggle class="topbar-theme" />
            </div>
          </header>

          <main class="content-panel">
            <RouterView />
          </main>
        </div>

        <nav class="mobile-bottom-nav">
          <RouterLink v-for="item in navigation.slice(0, 4)" :key="item.to" :to="item.to" class="mobile-bottom-link">
            {{ item.shortLabel }}
          </RouterLink>
        </nav>
      </div>
    </template>
  </div>
</template>
