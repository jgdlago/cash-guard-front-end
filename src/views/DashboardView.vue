<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
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
  <section class="page-section dashboard-page refined-page">
    <PageHeader eyebrow="Dashboard" title="Resumo mensal" :description="`Visão consolidada de ${currentMonthLabel}.`">
      <label class="compact-field compact-field-inline month-field">
        <span>Mês</span>
        <input v-model="month" type="date" @change="loadDashboard" />
      </label>
    </PageHeader>

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>
    <LoadingState v-if="loading" message="Carregando resumo..." />

    <template v-else-if="dashboard">
      <section class="hero-banner hero-banner-compact dashboard-hero">
        <div class="hero-banner-main">
          <p class="eyebrow">Saldo do período</p>
          <h2>{{ dashboard.summary.balance }}</h2>
          <p class="muted-text">Resumo de entradas e saídas já consolidadas para o mês selecionado.</p>
        </div>

        <div class="hero-banner-actions">
          <RouterLink to="/transactions" class="primary-button">Novo lançamento</RouterLink>
          <RouterLink to="/recurring-rules" class="ghost-button">Ver recorrências</RouterLink>
        </div>
      </section>

      <div class="stats-grid stats-grid-tight">
        <article class="stat-card stat-positive stat-card-compact">
          <span>Receitas</span>
          <strong>{{ dashboard.summary.income }}</strong>
          <p class="muted-text">Entradas registradas.</p>
        </article>

        <article class="stat-card stat-negative stat-card-compact">
          <span>Despesas</span>
          <strong>{{ dashboard.summary.expense }}</strong>
          <p class="muted-text">Saídas registradas.</p>
        </article>

        <article class="stat-card stat-card-compact">
          <span>Saldo</span>
          <strong>{{ dashboard.summary.balance }}</strong>
          <p class="muted-text">Resultado líquido do período.</p>
        </article>
      </div>

      <section class="dashboard-grid">
        <section class="section-card section-card-tight">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Categorias</p>
              <h3>Despesas por categoria</h3>
            </div>
          </div>

          <ul v-if="dashboard.expenses_by_category.length" class="stack-list stack-list-tight">
            <li v-for="item in dashboard.expenses_by_category" :key="`${item.category_id}-${item.total_cents}`" class="row-card row-card-compact amount-row">
              <div>
                <strong>{{ item.category_name ?? "Sem categoria" }}</strong>
                <p>Consolidação do mês atual</p>
              </div>
              <strong>{{ item.total }}</strong>
            </li>
          </ul>

          <EmptyState
            v-else
            title="Nenhuma despesa categorizada ainda."
            description="Quando houver saídas no mês, elas aparecerão aqui para leitura rápida."
          />
        </section>

        <section class="section-card section-card-tight">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Atalhos</p>
              <h3>Próximas ações</h3>
            </div>
          </div>

          <div class="stack-list stack-list-tight">
            <RouterLink to="/transactions" class="quick-action-card quick-action-card-compact">
              <strong>Registrar lançamento</strong>
              <p>Entrada ou saída com categoria e origem opcional.</p>
            </RouterLink>

            <RouterLink to="/installments" class="quick-action-card quick-action-card-compact">
              <strong>Criar parcelamento</strong>
              <p>Monte um plano com valores iguais ou manuais.</p>
            </RouterLink>

            <RouterLink to="/categories" class="quick-action-card quick-action-card-compact">
              <strong>Revisar categorias</strong>
              <p>Organize o catálogo e as preferências visuais do usuário.</p>
            </RouterLink>
          </div>
        </section>
      </section>
    </template>
  </section>
</template>
