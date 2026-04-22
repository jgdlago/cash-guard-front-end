<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import type { DashboardResponse } from "@/types/api"

const loading = ref(false)
const errorMessage = ref("")
const dashboard = ref<DashboardResponse | null>(null)
const month = ref(new Date().toISOString().slice(0, 7) + "-01")

const currentMonthLabel = computed(() => {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(month.value))
})

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
  <section class="page-section dashboard-page">
    <PageHeader eyebrow="Dashboard" title="Resumo mensal" :description="`Leitura rápida do período de ${currentMonthLabel}.`">
      <label class="compact-field month-field">
        <span>Mês</span>
        <input v-model="month" type="date" @change="loadDashboard" />
      </label>
    </PageHeader>

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>
    <p v-if="loading" class="muted-text">Carregando resumo...</p>

    <template v-if="dashboard">
      <section class="hero-banner">
        <div>
          <p class="eyebrow">Saldo do período</p>
          <h2>{{ dashboard.summary.balance }}</h2>
          <p class="muted-text">O painel resume entradas, saídas e concentração das despesas do mês.</p>
        </div>

        <div class="hero-banner-actions">
          <RouterLink to="/transactions" class="primary-button">Novo lançamento</RouterLink>
          <RouterLink to="/installments" class="ghost-button">Ver parcelas</RouterLink>
        </div>
      </section>

      <div class="stats-grid stats-grid-kpis">
        <article class="stat-card stat-positive">
          <span>Receitas</span>
          <strong>{{ dashboard.summary.income }}</strong>
          <p class="muted-text">Entradas registradas no período.</p>
        </article>

        <article class="stat-card stat-negative">
          <span>Despesas</span>
          <strong>{{ dashboard.summary.expense }}</strong>
          <p class="muted-text">Saídas registradas no período.</p>
        </article>

        <article class="stat-card">
          <span>Saldo</span>
          <strong>{{ dashboard.summary.balance }}</strong>
          <p class="muted-text">Resultado líquido do mês selecionado.</p>
        </article>
      </div>

      <section class="content-grid-2">
        <section class="section-card">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Categorias</p>
              <h3>Despesas por categoria</h3>
            </div>
          </div>

          <ul v-if="dashboard.expenses_by_category.length" class="stack-list">
            <li v-for="item in dashboard.expenses_by_category" :key="`${item.category_id}-${item.total_cents}`" class="row-card">
              <div>
                <strong>{{ item.category_name ?? "Sem categoria" }}</strong>
                <p>Consolidação do mês atual</p>
              </div>
              <strong>{{ item.total }}</strong>
            </li>
          </ul>

          <div v-else class="empty-state">
            <strong>Nenhuma despesa categorizada ainda.</strong>
            <p>Quando houver saídas no mês, elas aparecerão aqui para leitura rápida.</p>
          </div>
        </section>

        <section class="section-card">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Operação</p>
              <h3>Próximo passo</h3>
            </div>
          </div>

          <div class="stack-list quick-actions-list">
            <RouterLink to="/transactions" class="quick-action-card">
              <strong>Registrar lançamento</strong>
              <p>Entrada ou saída com categoria e origem opcional.</p>
            </RouterLink>

            <RouterLink to="/categories" class="quick-action-card">
              <strong>Organizar categorias</strong>
              <p>Revise catálogo padrão e personalize sua classificação.</p>
            </RouterLink>

            <RouterLink to="/payment-sources" class="quick-action-card">
              <strong>Ajustar origens</strong>
              <p>Cadastre cartão ou conta pagadora apenas se fizer sentido.</p>
            </RouterLink>
          </div>
        </section>
      </section>
    </template>
  </section>
</template>
