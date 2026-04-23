<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import { useUiStore } from "@/stores/ui"
import type { PaymentSource, PaymentSourceType } from "@/types/api"

const ui = useUiStore()
const paymentSources = ref<PaymentSource[]>([])
const parentCandidates = ref<PaymentSource[]>([])
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
  parent_payment_source_id: "",
  credit_limit: "",
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

function buildPaymentSourceParams() {
  return {
    "filter[type]": filters.type !== "all" ? filters.type : undefined,
    "filter[name]": filters.query || undefined,
    sort: "display_order",
  }
}

async function loadPaymentSources() {
  loading.value = true
  errorMessage.value = ""

  try {
    const [sources, parents] = await Promise.all([
      api.paymentSources(buildPaymentSourceParams()),
      api.paymentSources({ "filter[type]": "bank_account", sort: "name" }),
    ])

    paymentSources.value = sources
    parentCandidates.value = parents
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
      parent_payment_source_id: form.parent_payment_source_id ? Number(form.parent_payment_source_id) : null,
      credit_limit: form.credit_limit || null,
    })
    form.name = ""
    form.type = "wallet"
    form.parent_payment_source_id = ""
    form.credit_limit = ""
    ui.pushToast("Origem criada.", "success")
    await loadPaymentSources()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao salvar origem."
  } finally {
    saving.value = false
  }
}

function clearFilters() {
  filters.type = "all"
  filters.query = ""
  void loadPaymentSources()
}

onMounted(() => {
  void loadPaymentSources()
})
</script>

<template>
  <section class="page-section payment-sources-page refined-page">
    <PageHeader
      eyebrow="Origens"
      title="Origens de pagamento"
      description="Cadastro opcional para enriquecer a leitura dos lançamentos sem adicionar burocracia ao uso diário."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="workspace-grid workspace-grid-refined">
      <div class="section-card section-card-tight form-panel surface-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Nova origem</p>
            <h2>Adicionar origem opcional</h2>
          </div>
        </div>

        <form class="form-grid form-grid-dense" @submit.prevent="submitForm">
          <label class="field-span-2">
            Nome
            <input v-model="form.name" type="text" placeholder="Ex: Nubank" required />
          </label>

          <label>
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

          <label>
            Conta pagadora
            <select v-model="form.parent_payment_source_id">
              <option value="">Sem vínculo</option>
              <option v-for="candidate in parentCandidates" :key="candidate.id" :value="String(candidate.id)">
                {{ candidate.name }}
              </option>
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

      <div class="section-card section-card-tight list-panel surface-panel">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Lista</p>
            <h2>Origens existentes</h2>
          </div>
        </div>

        <div class="filter-panel filter-panel-inline filter-panel-refined">
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

          <div class="filter-bar filter-bar-actions">
            <button class="primary-button" type="button" @click="loadPaymentSources">Aplicar</button>
            <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <LoadingState v-if="loading" message="Carregando origens..." />

        <template v-else>
          <EmptyState
            v-if="!paymentSources.length"
            title="Nenhuma origem encontrada."
            description="O sistema continua funcionando normalmente mesmo sem esse cadastro."
          />

          <div v-else class="stack-list stack-list-tight source-card-list">
            <article v-for="source in paymentSources" :key="source.id" class="source-card refined-source-card">
              <div class="source-card-top">
                <div>
                  <div class="inline-meta-row inline-meta-row-wrap">
                    <strong>{{ source.name }}</strong>
                    <span class="badge">{{ typeLabel(source.type) }}</span>
                  </div>
                  <p>
                    {{ source.parent_payment_source_id ? `Vinculada à origem #${source.parent_payment_source_id}` : "Sem vínculo pai" }}
                  </p>
                </div>
                <strong>{{ source.credit_limit ?? "Sem limite" }}</strong>
              </div>
            </article>
          </div>
        </template>
      </div>
    </section>
  </section>
</template>
