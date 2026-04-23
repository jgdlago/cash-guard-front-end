<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import type { Category, PaymentSource, Transaction, TransactionStatus, TransactionType } from "@/types/api"
import { formatMoneyFromCents } from "@/utils/money"

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref("")
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])
const editingTransactionId = ref<number | null>(null)
const filters = reactive({
  type: "all",
  status: "all",
  description: "",
  from: "",
  to: "",
})

const form = reactive({
  type: "expense" as TransactionType,
  status: "posted" as TransactionStatus,
  category_id: "",
  payment_source_id: "",
  amount: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  description: "",
  notes: "",
})

const isEditing = computed(() => editingTransactionId.value !== null)
const hasActiveFilters = computed(() => Object.values(filters).some((value) => value !== "" && value !== "all"))

function buildTransactionParams() {
  return {
    "filter[type]": filters.type !== "all" ? filters.type : undefined,
    "filter[status]": filters.status !== "all" ? filters.status : undefined,
    "filter[description]": filters.description || undefined,
    "filter[from]": filters.from || undefined,
    "filter[to]": filters.to || undefined,
    sort: "-transaction_date",
  }
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ""

  try {
    const [transactionsResponse, categoriesResponse, paymentSourcesResponse] = await Promise.all([
      api.transactions(buildTransactionParams()),
      api.categories({ sort: "name" }),
      api.paymentSources({ sort: "display_order" }),
    ])

    transactions.value = transactionsResponse.data
    categories.value = categoriesResponse
    paymentSources.value = paymentSourcesResponse
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar os lançamentos."
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingTransactionId.value = null
  form.type = "expense"
  form.status = "posted"
  form.category_id = ""
  form.payment_source_id = ""
  form.amount = ""
  form.transaction_date = new Date().toISOString().slice(0, 10)
  form.description = ""
  form.notes = ""
}

function startEditing(transaction: Transaction) {
  editingTransactionId.value = transaction.id
  form.type = transaction.type
  form.status = transaction.status
  form.category_id = transaction.category_id ? String(transaction.category_id) : ""
  form.payment_source_id = transaction.payment_source_id ? String(transaction.payment_source_id) : ""
  form.amount = transaction.amount
  form.transaction_date = transaction.transaction_date
  form.description = transaction.description
  form.notes = transaction.notes ?? ""
}

function clearFilters() {
  filters.type = "all"
  filters.status = "all"
  filters.description = ""
  filters.from = ""
  filters.to = ""
  void loadPage()
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  const payload = {
    type: form.type,
    status: form.status,
    category_id: form.category_id ? Number(form.category_id) : null,
    payment_source_id: form.payment_source_id ? Number(form.payment_source_id) : null,
    amount: form.amount,
    transaction_date: form.transaction_date,
    description: form.description,
    notes: form.notes || null,
  }

  try {
    if (editingTransactionId.value) {
      await api.updateTransaction(editingTransactionId.value, payload)
    } else {
      await api.createTransaction(payload)
    }

    resetForm()
    await loadPage()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao salvar o lançamento."
  } finally {
    saving.value = false
  }
}

async function cancelTransaction(id: number) {
  await api.cancelTransaction(id)

  if (editingTransactionId.value === id) {
    resetForm()
  }

  await loadPage()
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <section class="page-section transactions-page">
    <PageHeader
      eyebrow="Lançamentos"
      title="Entradas e saídas"
      description="Cadastre, edite e filtre o extrato usando o contrato real de busca do backend."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="content-grid-2 split-workspace">
      <div class="section-card sticky-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">{{ isEditing ? "Edição" : "Novo lançamento" }}</p>
            <h2>{{ isEditing ? "Atualizar lançamento" : "Registrar entrada ou saída" }}</h2>
          </div>

          <button v-if="isEditing" class="ghost-button" type="button" @click="resetForm">Novo</button>
        </div>

        <form class="form-grid" @submit.prevent="submitForm">
          <label>
            Tipo
            <select v-model="form.type">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </label>

          <label>
            Status
            <select v-model="form.status">
              <option value="posted">Lançado</option>
              <option value="pending">Pendente</option>
              <option value="draft">Rascunho</option>
            </select>
          </label>

          <label>
            Valor
            <input v-model="form.amount" type="text" inputmode="decimal" placeholder="0,00" required />
          </label>

          <label>
            Data
            <input v-model="form.transaction_date" type="date" required />
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
            Descrição
            <input v-model="form.description" type="text" placeholder="Ex: supermercado" required />
          </label>

          <label class="field-span-2">
            Observações
            <textarea v-model="form.notes" rows="3" placeholder="Opcional"></textarea>
          </label>

          <button class="primary-button field-span-2" :disabled="saving">
            {{ saving ? "Salvando..." : isEditing ? "Atualizar lançamento" : "Salvar lançamento" }}
          </button>
        </form>
      </div>

      <div class="section-card">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Extrato</p>
            <h2>Lançamentos recentes</h2>
          </div>
        </div>

        <div class="filter-panel">
          <div class="filter-bar">
            <select v-model="filters.type">
              <option value="all">Todos os tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
            </select>

            <select v-model="filters.status">
              <option value="all">Todos os status</option>
              <option value="posted">Lançado</option>
              <option value="pending">Pendente</option>
              <option value="draft">Rascunho</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <input v-model="filters.description" type="search" placeholder="Buscar descrição" />
          </div>

          <div class="filter-bar">
            <input v-model="filters.from" type="date" />
            <input v-model="filters.to" type="date" />
            <button class="primary-button" type="button" @click="loadPage">Aplicar filtros</button>
            <button v-if="hasActiveFilters" class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <p v-if="loading" class="muted-text">Carregando lançamentos...</p>

        <div v-else-if="!transactions.length" class="empty-state">
          <strong>Nenhum lançamento encontrado.</strong>
          <p>Cadastre um item novo ou ajuste os filtros para ampliar a busca.</p>
        </div>

        <ul v-else class="stack-list">
          <li v-for="transaction in transactions" :key="transaction.id" class="row-card row-card-actions transaction-row">
            <div>
              <span class="transaction-type-pill" :class="`is-${transaction.type}`">
                {{ transaction.type === "expense" ? "Despesa" : "Receita" }}
              </span>
              <strong>{{ transaction.description }}</strong>
              <p>{{ transaction.transaction_date }} · {{ transaction.status }}</p>
            </div>

            <div class="row-actions action-stack">
              <strong>{{ formatMoneyFromCents(transaction.amount_cents, transaction.currency_code) }}</strong>
              <div class="row-button-group">
                <button class="ghost-button" type="button" @click="startEditing(transaction)">Editar</button>
                <button class="ghost-button" type="button" @click="cancelTransaction(transaction.id)">Cancelar</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>
