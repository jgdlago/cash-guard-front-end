<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import PaginationNav from "@/components/PaginationNav.vue"
import { api } from "@/services/api"
import type { FinancialAuditLog, PaginationMeta } from "@/types/api"

const logs = ref<FinancialAuditLog[]>([])
const pagination = ref<PaginationMeta | undefined>(undefined)
const loading = ref(false)
const errorMessage = ref("")
const currentPage = ref(1)
const filters = reactive({
  event: "",
  auditable_type: "",
  from: "",
  to: "",
})

function buildParams() {
  return {
    page: currentPage.value,
    "filter[event]": filters.event || undefined,
    "filter[auditable_type]": filters.auditable_type || undefined,
    "filter[from]": filters.from || undefined,
    "filter[to]": filters.to || undefined,
    sort: "-created_at",
  }
}

async function loadLogs() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await api.financialAuditLogs(buildParams())
    logs.value = response.data
    pagination.value = response.meta
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar auditoria."
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  currentPage.value = 1
  filters.event = ""
  filters.auditable_type = ""
  filters.from = ""
  filters.to = ""
  void loadLogs()
}

function applyFilters() {
  currentPage.value = 1
  void loadLogs()
}

function changePage(page: number) {
  currentPage.value = page
  void loadLogs()
}

onMounted(() => {
  void loadLogs()
})
</script>

<template>
  <section class="page-section audit-page refined-page">
    <PageHeader
      eyebrow="Auditoria"
      title="Histórico financeiro"
      description="Consulta técnica dos eventos financeiros mais relevantes, com foco em leitura limpa e rastreabilidade."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="section-card section-card-tight surface-panel">
      <div class="filter-panel filter-panel-inline filter-panel-refined">
        <div class="filter-bar">
          <input v-model="filters.event" type="search" placeholder="Evento" />
          <input v-model="filters.auditable_type" type="search" placeholder="Tipo auditado" />
          <input v-model="filters.from" type="date" />
          <input v-model="filters.to" type="date" />
        </div>
        <div class="filter-bar filter-bar-actions">
          <button class="primary-button" type="button" @click="applyFilters">Aplicar</button>
          <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
        </div>
      </div>

      <LoadingState v-if="loading" message="Carregando auditoria..." />

      <template v-else>
        <EmptyState
          v-if="!logs.length"
          title="Nenhum evento de auditoria encontrado."
          description="Os registros aparecerão aqui conforme operações financeiras forem realizadas."
        />

        <template v-else>
          <div class="stack-list stack-list-tight audit-log-list">
            <article v-for="log in logs" :key="log.id" class="audit-log-card refined-audit-card">
              <div class="plan-card-top">
                <div>
                  <div class="inline-meta-row inline-meta-row-wrap">
                    <strong>{{ log.event }}</strong>
                    <span class="badge">{{ log.auditable_type ?? 'n/a' }}</span>
                  </div>
                  <p>{{ log.created_at }}</p>
                </div>
                <span class="badge">#{{ log.id }}</span>
              </div>
              <p class="muted-text">Auditável {{ log.auditable_id ?? 'n/a' }}</p>
              <details class="audit-details">
                <summary>Ver payload</summary>
                <pre>{{ JSON.stringify({ before: log.before, after: log.after, context: log.context }, null, 2) }}</pre>
              </details>
            </article>
          </div>
          <PaginationNav :meta="pagination" @change="changePage" />
        </template>
      </template>
    </section>
  </section>
</template>
