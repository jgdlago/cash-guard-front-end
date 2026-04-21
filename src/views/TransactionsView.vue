<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import { api } from "@/services/api"
import type { Category, PaymentSource, Transaction, TransactionType } from "@/types/api"
import { formatMoneyFromCents } from "@/utils/money"

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref("")
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])

const form = reactive({
  type: "expense" as TransactionType,
  category_id: "",
  payment_source_id: "",
  amount: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  description: "",
  notes: "",
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
  <section class="page-section split-layout">
    <div class="hero-card">
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

        <p v-if="errorMessage" class="error-message field-span-2">{{ errorMessage }}</p>

        <button class="primary-button field-span-2" :disabled="saving">
          {{ saving ? "Salvando..." : "Salvar lançamento" }}
        </button>
      </form>
    </div>

    <div class="hero-card">
      <div class="section-header compact">
        <div>
          <p class="eyebrow">Extrato</p>
          <h2>Lançamentos recentes</h2>
        </div>
      </div>

      <p v-if="loading" class="muted-text">Carregando lançamentos...</p>

      <ul class="stack-list">
        <li v-for="transaction in transactions" :key="transaction.id" class="row-card row-card-actions">
          <div>
            <strong>{{ transaction.description }}</strong>
            <p>
              {{ transaction.transaction_date }} · {{ transaction.type === "expense" ? "Despesa" : "Receita" }}
            </p>
          </div>

          <div class="row-actions">
            <strong>{{ formatMoneyFromCents(transaction.amount_cents, transaction.currency_code) }}</strong>
            <button class="ghost-button" @click="cancelTransaction(transaction.id)">Cancelar</button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
