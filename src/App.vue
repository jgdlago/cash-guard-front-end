<script setup lang="ts">
import { computed, onMounted } from "vue"
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const isAuthScreen = computed(() => route.name === "auth")

onMounted(() => {
  void auth.hydrate()
})

async function handleLogout() {
  await auth.logout()
  await router.push({ name: "auth" })
}

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Lançamentos" },
  { to: "/categories", label: "Categorias" },
  { to: "/payment-sources", label: "Origens" },
  { to: "/installments", label: "Parcelas" },
]
</script>

<template>
  <div class="app-shell">
    <template v-if="isAuthScreen">
      <RouterView />
    </template>

    <template v-else>
      <aside class="sidebar">
        <div>
          <p class="eyebrow">Cash Guard</p>
          <h1>Controle financeiro sem burocracia bancária.</h1>
          <p class="sidebar-copy">
            O fluxo principal é registrar entradas e saídas, com categorias, origens opcionais e parcelamentos variáveis.
          </p>
        </div>

        <nav class="nav-list">
          <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-item">
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <div v-if="auth.user">
            <strong>{{ auth.user.name }}</strong>
            <p>{{ auth.user.email }}</p>
          </div>

          <button class="ghost-button" @click="handleLogout">Sair</button>
        </div>
      </aside>

      <main class="content-panel">
        <RouterView />
      </main>
    </template>
  </div>
</template>
