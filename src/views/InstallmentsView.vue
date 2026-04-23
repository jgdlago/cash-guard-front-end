<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import PaginationNav from "@/components/PaginationNav.vue"
import { api } from "@/services/api"
import { useUiStore } from "@/stores/ui"
import type { Category, InstallmentPlan, PaginationMeta, PaymentSource } from "@/types/api"

const ui = useUiStore()
const plans = ref<InstallmentPlan[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])
const pagination = ref<PaginationMeta | undefined>(undefined)
const errorMessage = ref("")
const loading = ref(false)
const saving = ref(false)
const currentPage = ref(1)
const mode = ref<"manual" | "equal">("manual")
const equalInstallmentsCount = ref("2")
const equalInstallmentAmount = ref("")
const filters = reactive({
  description: "",
  from_due_date: "",
  to_due_date: "",
})

const form = reactive({
  description: "",
  category_id: "",
  payment_source_id: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  installments: [
    { number: 1, amount: "", due_date: new Date().toISOString().slice(0, 10) },
    { number: 2, amount: "", due_date: new Date().toISOString().slice(0, 10) },
  ],
})

const installmentsTotal = computed(() => {
  return form.installments.reduce((total, installment) => {
    const normalized = installment.amount.replace(/\./g, "").replace(",", ".")
    const parsed = Number(normalized)
    return total + (Number.isFinite(parsed) ? parsed : 0)
  }, 0)
})

function createInstallments(count: number, amount = "") {
  form.installments = Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    amount,
    due_date: new Date().toISOString().slice(0, 10),
  }))
}

function addInstallment() {
  form.installments.push({
    number: form.installments.length + 1,
    amount: "",
    due_date: new Date().toISOString().slice(0, 10),
  })
}

function applyEqualInstallments() {
  const count = Math.max(1, Number.parseInt(equalInstallmentsCount.value || "1", 10))
  createInstallments(count, equalInstallmentAmount.value)
}

function buildInstallmentParams() {
  return {
    page: currentPage.value,
    "filter[description]": filters.description || undefined,
    "filter[from_due_date]": filters.from_due_date || undefined,
    "filter[to_due_date]": filters.to_due_date || undefined,
    sort: "-created_at",
  }
}

async function loadPage() {
  loading.value = true

  try {
    const [plansResponse, categoriesResponse, paymentSourcesResponse] = await Promise.all([
      api.installmentPlans(buildInstallmentParams()),
      api.categories({ sort: "name" }),
      api.paymentSources({ sort: "display_order" }),
    ])

    plans.value = plansResponse.data
    pagination.value = plansResponse.meta
    categories.value = categoriesResponse
    paymentSources.value = paymentSourcesResponse
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar parcelamentos."
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  currentPage.value = 1
  filters.description = ""
  filters.from_due_date = ""
  filters.to_due_date = ""
  void loadPage()
}

function applyFilters() {
  currentPage.value = 1
  void loadPage()
}

function changePage(page: number) {
  currentPage.value = page
  void loadPage()
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  try {
    await api.createInstallmentPlan({
      description: form.description,
      category_id: form.category_id ? Number(form.category_id) : null,
      payment_source_id: form.payment_source_id ? Number(form.payment_source_id) : null,
      transaction_date: form.transaction_date,
      installments: form.installments,
    })

    form.description = ""
    form.category_id = ""
    form.payment_source_id = ""
    form.transaction_date = new Date().toISOString().slice(0, 10)
    createInstallments(2)
    equalInstallmentsCount.value = "2"
    equalInstallmentAmount.value = ""
    ui.pushToast("Parcelamento criado.", "success")
    await loadPage()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao criar parcelamento."
  } finally {
    saving.value = false
  }
}

async function cancelPlan(id: number) {
  await api.cancelInstallmentPlan(id)
  ui.pushToast("Parcelamento cancelado.", "info")
  await loadPage()
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <section class="page-section installments-page refined-page">
    <PageHeader
      eyebrow="Parcelamentos"
      title="Parcelas flexíveis"
      description="Monte planos com leitura mais clara entre criação, soma e histórico de parcelamentos."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="workspace-grid">
      <div class="section-card section-card-tight form-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Novo plano</p>
            <h2>Criar parcelamento</h2>
          </div>
        </div>

        <div class="segmented-control segmented-control-tight">
          <button type="button" :class="{ active: mode === 'manual' }" @click="mode = 'manual'">Valores manuais</button>
          <button type="button" :class="{ active: mode === 'equal' }" @click="mode = 'equal'">Dividir igualmente</button>
        </div>

        <form class="form-grid form-grid-dense" @submit.prevent="submitForm">
          <label class="field-span-2">
            Descrição
            <input v-model="form.description" type="text" placeholder="Ex: notebook" required />
          </label>

          <label>
            Categoria
            <select v-model="form.category_id">
              <option value="">Sem categoria</option>
              <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label>
            Origem
            <select v-model="form.payment_source_id">
              <option value="">Sem origem</option>
              <option v-for="source in paymentSources" :key="source.id" :value="String(source.id)">
                {{ source.name }}
              </option>
            </select>
          </label>

          <label class="field-span-2">
            Data da compra
            <input v-model="form.transaction_date" type="date" required />
          </label>

          <template v-if="mode === 'equal'">
            <label>
              Número de parcelas
              <input v-model="equalInstallmentsCount" type="number" min="1" />
            </label>

            <label>
              Valor por parcela
              <input v-model="equalInstallmentAmount" type="text" inputmode="decimal" placeholder="0,00" />
            </label>

            <button class="ghost-button field-span-2" type="button" @click="applyEqualInstallments">
              Gerar parcelas iguais
            </button>
          </template>

          <div class="field-span-2 installment-summary-card installment-summary-card-compact">
            <div>
              <strong>{{ form.installments.length }} parcelas</strong>
              <p class="muted-text">Soma informada para conferência rápida.</p>
            </div>
            <strong>{{ installmentsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
          </div>

          <div class="field-span-2 installment-grid installment-grid-enhanced">
            <div v-for="installment in form.installments" :key="installment.number" class="installment-row installment-row-card installment-row-card-compact">
              <strong>{{ installment.number }}ª</strong>
              <input v-model="installment.amount" type="text" inputmode="decimal" placeholder="Valor" required />
              <input v-model="installment.due_date" type="date" required />
            </div>
          </div>

          <button class="ghost-button field-span-2" type="button" @click="addInstallment">Adicionar parcela</button>
          <button class="primary-button field-span-2" :disabled="saving">
            {{ saving ? "Salvando..." : "Criar parcelamento" }}
          </button>
        </form>
      </div>

      <div class="section-card section-card-tight list-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Planos</p>
            <h2>Parcelamentos existentes</h2>
          </div>
        </div>

        <div class="filter-panel filter-panel-inline">
          <div class="filter-bar">
            <input v-model="filters.description" type="search" placeholder="Buscar descrição" />
            <input v-model="filters.from_due_date" type="date" />
            <input v-model="filters.to_due_date" type="date" />
          </div>

          <div class="filter-bar filter-bar-actions">
            <button class="primary-button" type="button" @click="applyFilters">Aplicar filtros</button>
            <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <LoadingState v-if="loading" message="Carregando parcelamentos..." />

        <template v-else>
          <EmptyState
            v-if="!plans.length"
            title="Nenhum parcelamento cadastrado."
            description="Ao criar um plano, as parcelas ficam disponíveis para acompanhamento no backend e no extrato."
          />

          <template v-else>
            <div class="stack-list stack-list-tight plan-card-list">
              <article v-for="plan in plans" :key="plan.id" class="plan-card plan-card-compact">
                <div class="plan-card-top">
                  <div>
                    <strong>{{ plan.description }}</strong>
                    <p>{{ plan.total_installments }} parcelas</p>
                  </div>
                  <strong>{{ plan.total_amount }}</strong>
                </div>

                <div class="plan-card-meta">
                  <span class="badge">Primeiro vencimento: {{ plan.first_due_date }}</span>
                  <span class="badge">{{ plan.transactions.length }} lançamentos</span>
                </div>

                <div class="row-button-group">
                  <button class="ghost-button" type="button" @click="cancelPlan(plan.id)">Cancelar plano</button>
                </div>
              </article>
            </div>

            <PaginationNav :meta="pagination" @change="changePage" />
          </template>
        </template>
      </div>
    </section>
  </section>
</template>
