<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import type { Category, PaymentSource, Transaction, TransactionType } from "@/types/api"
import { formatMoneyFromCents } from "@/utils/money"

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref("")
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])
const filters = reactive({
  type: "all",
  query: "",
})

const form = reactive({
  type: "expense" as TransactionType,
  category_id: "",
  payment_source_id: "",
  amount: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  description: "",
  notes: "",
})

const filteredTransactions = computed(() => {
  return transactions.value.filter((transaction) => {
    const matchesType = filters.type === "all" || transaction.type === filters.type
    const haystack = `${transaction.description} ${transaction.notes ?? ""}`.toLowerCase()
    const matchesQuery = !filters.query || haystack.includes(filters.query.toLowerCase())

    return matchesType && matchesQuery
  })
})

async function loadPage() {
  loading.value = true
  errorMessage.value = ""

  try {
    const [transactionsResponse, categoriesResponse, paymentSourcesResponse] = await Promise.all([
      api.transactions(),
      api.categories(),
      api.paymentSources(),
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

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  try {
    await api.createTransaction({
      type: form.type,
      category_id: form.category_id ? Number(form.category_id) : null,
      payment_source_id: form.payment_source_id ? Number(form.payment_source_id) : null,
      amount: form.amount,
      transaction_date: form.transaction_date,
      description: form.description,
      notes: form.notes || null,
    })

    form.amount = ""
    form.description = ""
    form.notes = ""
    await loadPage()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao salvar o lançamento."
  } finally {
    saving.value = false
  }
}

async function cancelTransaction(id: number) {
  await api.cancelTransaction(id)
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
      description="Cadastre rápido, filtre sem fricção e mantenha o extrato operacional do mês."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="content-grid-2 split-workspace">
      <div class="section-card sticky-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Novo lançamento</p>
            <h2>Registrar entrada ou saída</h2>
          </div>
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
            {{ saving ? "Salvando..." : "Salvar lançamento" }}
          </button>
        </form>
      </div>

      <div class="section-card">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Extrato</p>
            <h2>Lançamentos recentes</h2>
          </div>

          <div class="filter-bar">
            <select v-model="filters.type">
              <option value="all">Todos</option>
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
            </select>

            <input v-model="filters.query" type="search" placeholder="Buscar descrição" />
          </div>
        </div>

        <p v-if="loading" class="muted-text">Carregando lançamentos...</p>

        <div v-else-if="!filteredTransactions.length" class="empty-state">
          <strong>Nenhum lançamento encontrado.</strong>
          <p>Cadastre um item novo ou ajuste os filtros para ampliar a busca.</p>
        </div>

        <ul v-else class="stack-list">
          <li v-for="transaction in filteredTransactions" :key="transaction.id" class="row-card row-card-actions transaction-row">
            <div>
              <span class="transaction-type-pill" :class="`is-${transaction.type}`">
                {{ transaction.type === "expense" ? "Despesa" : "Receita" }}
              </span>
              <strong>{{ transaction.description }}</strong>
              <p>{{ transaction.transaction_date }}</p>
            </div>

            <div class="row-actions">
              <strong>{{ formatMoneyFromCents(transaction.amount_cents, transaction.currency_code) }}</strong>
              <button class="ghost-button" @click="cancelTransaction(transaction.id)">Cancelar</button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>
