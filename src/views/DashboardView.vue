<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
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

const monthMood = computed(() => {
  const balance = dashboard.value?.summary.balance_cents ?? 0

  if (balance > 0) {
    return { label: "Seu mês está positivo", tone: "money-positive", hint: "O fluxo fechou acima das saídas registradas." }
  }

  if (balance < 0) {
    return { label: "Atenção ao ritmo do mês", tone: "money-negative", hint: "As saídas já superam as entradas do período." }
  }

  return { label: "Abril está neutro", tone: "money-neutral", hint: "Assim que houver lançamentos, o pulso do mês aparece aqui." }
})

const categoryMax = computed(() => {
  return Math.max(...(dashboard.value?.expenses_by_category.map((item) => item.total_cents) ?? [0]), 1)
})

const dayBars = computed(() => {
  const expense = Math.abs(dashboard.value?.summary.expense_cents ?? 0)
  const income = Math.abs(dashboard.value?.summary.income_cents ?? 0)
  const seed = Math.max(expense + income, 1)

  return Array.from({ length: 14 }, (_, index) => {
    const incomeHeight = 18 + ((income / seed) * 44 + index * 7) % 42
    const expenseHeight = 16 + ((expense / seed) * 48 + index * 9) % 46
    return { day: index + 1, incomeHeight, expenseHeight }
  })
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
    <PageHeader eyebrow="Central do mês" title="Resumo mensal" :description="`Leitura do período de ${currentMonthLabel}.`">
      <template #meta>
        <div class="page-pulse">
          <span class="pulse-dot"></span>
          <span>Fluxo Protegido ativo</span>
        </div>
      </template>

      <label class="month-capsule">
        <span>{{ currentMonthLabel }}</span>
        <input v-model="month" type="date" @change="loadDashboard" />
      </label>
    </PageHeader>

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>
    <LoadingState v-if="loading" message="Carregando resumo..." />

    <template v-else-if="dashboard">
      <BaseCard class="hero-banner dashboard-hero flow-card tone-flow">
        <div class="hero-banner-main">
          <p class="eyebrow">Saldo do período</p>
          <h2 :class="monthMood.tone">{{ dashboard.summary.balance }}</h2>
          <p class="hero-mood">{{ monthMood.label }}</p>
          <p class="muted-text">{{ monthMood.hint }}</p>
          <div class="money-flow-strip" aria-label="Fluxo do mês">
            <span class="flow-node tone-income">Receitas {{ dashboard.summary.income }}</span>
            <span class="flow-arrow">→</span>
            <span class="flow-node tone-expense">Despesas {{ dashboard.summary.expense }}</span>
            <span class="flow-arrow">→</span>
            <span class="flow-node">Saldo {{ dashboard.summary.balance }}</span>
          </div>
        </div>

        <div class="hero-banner-actions hero-actions-stacked">
          <RouterLink to="/transactions" class="primary-button">Novo lançamento</RouterLink>
          <RouterLink to="/recurring-rules" class="ghost-button">Recorrências</RouterLink>
        </div>
      </BaseCard>

      <div class="stats-grid stats-grid-tight stats-grid-refined">
        <BaseCard class="stat-card stat-positive tone-income">
          <span>Receitas</span>
          <strong>{{ dashboard.summary.income }}</strong>
          <p class="muted-text">Entradas no período.</p>
        </BaseCard>

        <BaseCard class="stat-card stat-negative tone-expense">
          <span>Despesas</span>
          <strong>{{ dashboard.summary.expense }}</strong>
          <p class="muted-text">Saídas no período.</p>
        </BaseCard>

        <BaseCard class="stat-card tone-flow">
          <span>Saldo</span>
          <strong>{{ dashboard.summary.balance }}</strong>
          <p class="muted-text">Resultado líquido.</p>
        </BaseCard>
      </div>

      <section class="dashboard-grid dashboard-grid-refined">
        <BaseCard class="section-card control-panel">
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
              class="category-rank-row"
            >
              <div>
                <strong>{{ item.category_name ?? "Sem categoria" }}</strong>
                <span class="rank-track">
                  <span class="rank-fill" :style="{ width: `${Math.max(8, (item.total_cents / categoryMax) * 100)}%` }"></span>
                </span>
              </div>
              <strong>{{ item.total }}</strong>
            </li>
          </ul>

          <EmptyState
            v-else
            title="Nenhuma despesa categorizada ainda."
            description="As saídas do período aparecerão aqui quando existirem lançamentos."
            icon="tag"
            tone="flow"
          />
        </BaseCard>

        <BaseCard class="section-card control-panel">
          <div class="section-header compact">
            <div>
              <p class="eyebrow">Atenção agora</p>
              <h3>Pontos do mês</h3>
            </div>
          </div>

          <div class="insight-stack">
            <RouterLink to="/transactions" class="insight-card tone-flow">
              <span><AppIcon name="money" /></span>
              <div><strong>Registrar lançamento</strong><p>Entrada ou saída no extrato.</p></div>
            </RouterLink>
            <RouterLink to="/installments" class="insight-card tone-warning">
              <span><AppIcon name="calendar" /></span>
              <div><strong>Parcelas futuras</strong><p>Confira planos e vencimentos.</p></div>
            </RouterLink>
            <RouterLink to="/recurring-rules" class="insight-card tone-recurring">
              <span><AppIcon name="recurring" /></span>
              <div><strong>Recorrências</strong><p>Automatize o que se repete.</p></div>
            </RouterLink>
          </div>
        </BaseCard>
      </section>

      <BaseCard class="section-card control-panel month-map-card">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Mapa do mês</p>
            <h3>Ritmo de entradas e saídas</h3>
          </div>
        </div>
        <div class="month-map">
          <span v-for="bar in dayBars" :key="bar.day" class="month-map-day">
            <i class="income-bar" :style="{ height: `${bar.incomeHeight}px` }"></i>
            <i class="expense-bar" :style="{ height: `${bar.expenseHeight}px` }"></i>
          </span>
        </div>
      </BaseCard>
    </template>
  </section>
</template>
