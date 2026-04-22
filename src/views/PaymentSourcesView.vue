<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import type { PaymentSource, PaymentSourceType } from "@/types/api"

const paymentSources = ref<PaymentSource[]>([])
const errorMessage = ref("")
const loading = ref(false)
const saving = ref(false)
const filters = reactive({
  type: "all",
  query: "",
})

const form = reactive({
  name: "",
  type: "wallet" as PaymentSourceType,
  credit_limit: "",
})

const filteredPaymentSources = computed(() => {
  return paymentSources.value.filter((source) => {
    const matchesType = filters.type === "all" || source.type === filters.type
    const matchesQuery = !filters.query || source.name.toLowerCase().includes(filters.query.toLowerCase())
    return matchesType && matchesQuery
  })
})

function typeLabel(type: PaymentSourceType) {
  switch (type) {
    case "wallet":
      return "Carteira"
    case "cash":
      return "Dinheiro"
    case "bank_account":
      return "Conta bancária"
    case "credit_card":
      return "Cartão de crédito"
    case "debit_card":
      return "Cartão de débito"
    default:
      return "Outro"
  }
}

async function loadPaymentSources() {
  loading.value = true

  try {
    paymentSources.value = await api.paymentSources()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar origens."
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  try {
    await api.createPaymentSource({
      name: form.name,
      type: form.type,
      credit_limit: form.credit_limit || null,
    })
    form.name = ""
    form.type = "wallet"
    form.credit_limit = ""
    await loadPaymentSources()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao salvar origem."
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadPaymentSources()
})
</script>

<template>
  <section class="page-section payment-sources-page">
    <PageHeader
      eyebrow="Origens"
      title="Origens de pagamento opcionais"
      description="Use cartões, carteira ou conta pagadora apenas para enriquecer a leitura dos lançamentos, nunca como barreira de entrada."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="content-grid-2 split-workspace">
      <div class="section-card sticky-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Nova origem</p>
            <h2>Adicionar origem opcional</h2>
          </div>
        </div>

        <form class="form-grid" @submit.prevent="submitForm">
          <label class="field-span-2">
            Nome
            <input v-model="form.name" type="text" placeholder="Ex: Nubank" required />
          </label>

          <label class="field-span-2">
            Tipo
            <select v-model="form.type">
              <option value="wallet">Carteira</option>
              <option value="cash">Dinheiro</option>
              <option value="bank_account">Conta bancária</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="debit_card">Cartão de débito</option>
              <option value="other">Outro</option>
            </select>
          </label>

          <label class="field-span-2">
            Limite de crédito
            <input v-model="form.credit_limit" type="text" inputmode="decimal" placeholder="0,00" />
          </label>

          <button class="primary-button field-span-2" :disabled="saving">
            {{ saving ? "Salvando..." : "Salvar origem" }}
          </button>
        </form>
      </div>

      <div class="section-card">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Cadastro opcional</p>
            <h2>Origens existentes</h2>
          </div>

          <div class="filter-bar">
            <select v-model="filters.type">
              <option value="all">Todos os tipos</option>
              <option value="wallet">Carteira</option>
              <option value="cash">Dinheiro</option>
              <option value="bank_account">Conta bancária</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="debit_card">Cartão de débito</option>
              <option value="other">Outro</option>
            </select>

            <input v-model="filters.query" type="search" placeholder="Buscar origem" />
          </div>
        </div>

        <p v-if="loading" class="muted-text">Carregando origens...</p>

        <div v-else-if="!filteredPaymentSources.length" class="empty-state">
          <strong>Nenhuma origem encontrada.</strong>
          <p>O sistema continua funcionando normalmente sem esse cadastro.</p>
        </div>

        <div v-else class="stack-list source-card-list">
          <article v-for="source in filteredPaymentSources" :key="source.id" class="source-card">
            <div class="source-card-top">
              <div>
                <span class="badge">{{ typeLabel(source.type) }}</span>
                <strong>{{ source.name }}</strong>
              </div>
              <strong>{{ source.credit_limit ?? "Sem limite" }}</strong>
            </div>

            <p class="muted-text">
              {{ source.parent_payment_source_id ? `Vinculada a origem #${source.parent_payment_source_id}` : "Sem vínculo pai" }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </section>
</template>
