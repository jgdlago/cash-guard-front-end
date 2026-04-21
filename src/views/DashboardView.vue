<script setup lang="ts">
import { onMounted, ref } from "vue"

import { api } from "@/services/api"
import type { DashboardResponse } from "@/types/api"

const loading = ref(false)
const errorMessage = ref("")
const dashboard = ref<DashboardResponse | null>(null)
const month = ref(new Date().toISOString().slice(0, 7) + "-01")

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ""

  try {
    dashboard.value = await api.dashboard(month.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar o dashboard."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <section class="page-section">
    <header class="section-header">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h2>Resumo mensal</h2>
      </div>

      <label class="compact-field">
        Mês
        <input v-model="month" type="date" @change="loadDashboard" />
      </label>
    </header>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="loading" class="muted-text">Carregando resumo...</p>

    <template v-if="dashboard">
      <div class="stats-grid">
        <article class="stat-card stat-positive">
          <span>Receitas</span>
          <strong>{{ dashboard.summary.income }}</strong>
        </article>

        <article class="stat-card stat-negative">
          <span>Despesas</span>
          <strong>{{ dashboard.summary.expense }}</strong>
        </article>

        <article class="stat-card">
          <span>Saldo</span>
          <strong>{{ dashboard.summary.balance }}</strong>
        </article>
      </div>

      <section class="hero-card">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Categorias</p>
            <h3>Despesas por categoria</h3>
          </div>
        </div>

        <ul class="stack-list">
          <li v-for="item in dashboard.expenses_by_category" :key="`${item.category_id}-${item.total_cents}`" class="row-card">
            <span>{{ item.category_name ?? "Sem categoria" }}</span>
            <strong>{{ item.total }}</strong>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
