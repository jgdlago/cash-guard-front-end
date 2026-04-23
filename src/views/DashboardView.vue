<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import BaseCard from "@/components/base/BaseCard.vue"
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
    <PageHeader eyebrow="Dashboard" title="Resumo mensal" :description="`Leitura do período de ${currentMonthLabel}.`">
      <label class="compact-field compact-field-inline month-field">
        <span>Mês</span>
        <input v-model="month" type="date" @change="loadDashboard" />
      </label>
    </PageHeader>

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>
    <LoadingState v-if="loading" message="Carregando resumo..." />

    <template v-else-if="dashboard">
      <BaseCard class="hero-banner hero-banner-compact dashboard-hero dashboard-hero-refined dashboard-hero-system">
        <div class="hero-banner-main">
          <p class="eyebrow">Saldo do período</p>
          <h2>{{ dashboard.summary.balance }}</h2>
          <p class="muted-text">Visão direta do resultado do mês selecionado.</p>
        </div>

        <div class="hero-banner-actions hero-actions-stacked">
          <RouterLink to="/transactions" class="primary-button">Novo lançamento</RouterLink>
          <RouterLink to="/recurring-rules" class="ghost-button">Recorrências</RouterLink>
        </div>
      </BaseCard>

      <div class="stats-grid stats-grid-tight stats-grid-refined">
        <BaseCard class="stat-card stat-positive stat-card-compact stat-card-refined stat-card-system">
          <span>Receitas</span>
          <strong>{{ dashboard.summary.income }}</strong>
          <p class="muted-text">Entradas no período.</p>
        </BaseCard>

        <BaseCard class="stat-card stat-negative stat-card-compact stat-card-refined stat-card-system">
          <span>Despesas</span>
          <strong>{{ dashboard.summary.expense }}</strong>
          <p class="muted-text">Saídas no período.</p>
        </BaseCard>

        <BaseCard class="stat-card stat-card-compact stat-card-refined stat-card-system">
          <span>Saldo</span>
          <strong>{{ dashboard.summary.balance }}</strong>
          <p class="muted-text">Resultado líquido.</p>
        </BaseCard>
      </div>

      <section class="dashboard-grid dashboard-grid-refined">
        <BaseCard class="section-card section-card-tight surface-panel surface-panel-system">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Categorias</p>
              <h3>Despesas por categoria</h3>
            </div>
          </div>

          <ul v-if="dashboard.expenses_by_category.length" class="stack-list stack-list-tight">
            <li
              v-for="item in dashboard.expenses_by_category"
              :key="`${item.category_id}-${item.total_cents}`"
              class="row-card row-card-compact amount-row refined-list-row"
            >
              <div>
                <strong>{{ item.category_name ?? "Sem categoria" }}</strong>
                <p>Consolidação atual</p>
              </div>
              <strong>{{ item.total }}</strong>
            </li>
          </ul>

          <EmptyState
            v-else
            title="Nenhuma despesa categorizada ainda."
            description="As saídas do período aparecerão aqui quando existirem lançamentos."
          />
        </BaseCard>

        <BaseCard class="section-card section-card-tight surface-panel surface-panel-system">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Atalhos</p>
              <h3>Ações rápidas</h3>
            </div>
          </div>

          <div class="stack-list stack-list-tight">
            <RouterLink to="/transactions" class="quick-action-card quick-action-card-compact quick-action-card-refined quick-action-card-system">
              <strong>Registrar lançamento</strong>
              <p>Adicionar entrada ou saída.</p>
            </RouterLink>

            <RouterLink to="/installments" class="quick-action-card quick-action-card-compact quick-action-card-refined quick-action-card-system">
              <strong>Criar parcelamento</strong>
              <p>Montar um plano com vencimentos.</p>
            </RouterLink>

            <RouterLink to="/categories" class="quick-action-card quick-action-card-compact quick-action-card-refined quick-action-card-system">
              <strong>Revisar categorias</strong>
              <p>Organizar catálogo e preferências.</p>
            </RouterLink>
          </div>
        </BaseCard>
      </section>
    </template>
  </section>
</template>
