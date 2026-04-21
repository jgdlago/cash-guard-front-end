<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import { api } from "@/services/api"
import type { PaymentSource, PaymentSourceType } from "@/types/api"

const paymentSources = ref<PaymentSource[]>([])
const errorMessage = ref("")
const saving = ref(false)

const form = reactive({
  name: "",
  type: "wallet" as PaymentSourceType,
  credit_limit: "",
})

async function loadPaymentSources() {
  try {
    paymentSources.value = await api.paymentSources()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar origens."
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
  <section class="page-section split-layout">
    <div class="hero-card">
      <p class="eyebrow">Origens de pagamento</p>
      <h2>Recurso opcional para enriquecer os lançamentos</h2>

      <form class="form-grid" @submit.prevent="submitForm">
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
          Limite
          <input v-model="form.credit_limit" type="text" inputmode="decimal" placeholder="0,00" />
        </label>

        <button class="primary-button field-span-2" :disabled="saving">
          {{ saving ? "Salvando..." : "Salvar origem" }}
        </button>
      </form>
    </div>

    <div class="hero-card">
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <ul class="stack-list">
        <li v-for="source in paymentSources" :key="source.id" class="row-card">
          <div>
            <strong>{{ source.name }}</strong>
            <p>{{ source.type }}</p>
          </div>

          <span class="badge">{{ source.credit_limit ?? "sem limite" }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
