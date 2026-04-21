<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import { api } from "@/services/api"
import type { Category, InstallmentPlan, PaymentSource } from "@/types/api"

const plans = ref<InstallmentPlan[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])
const errorMessage = ref("")
const saving = ref(false)

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

async function loadPage() {
  try {
    const [plansResponse, categoriesResponse, paymentSourcesResponse] = await Promise.all([
      api.installmentPlans(),
      api.categories(),
      api.paymentSources(),
    ])

    plans.value = plansResponse.data
    categories.value = categoriesResponse
    paymentSources.value = paymentSourcesResponse
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar parcelamentos."
  }
}

function addInstallment() {
  form.installments.push({
    number: form.installments.length + 1,
    amount: "",
    due_date: new Date().toISOString().slice(0, 10),
  })
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
    form.installments = [
      { number: 1, amount: "", due_date: new Date().toISOString().slice(0, 10) },
      { number: 2, amount: "", due_date: new Date().toISOString().slice(0, 10) },
    ]
    await loadPage()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao criar parcelamento."
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <section class="page-section split-layout">
    <div class="hero-card">
      <p class="eyebrow">Parcelamentos</p>
      <h2>Parcelas com valores diferentes</h2>

      <form class="form-grid" @submit.prevent="submitForm">
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

        <div class="field-span-2 installment-grid">
          <div v-for="installment in form.installments" :key="installment.number" class="installment-row">
            <strong>{{ installment.number }}ª parcela</strong>
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

    <div class="hero-card">
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <ul class="stack-list">
        <li v-for="plan in plans" :key="plan.id" class="row-card">
          <div>
            <strong>{{ plan.description }}</strong>
            <p>{{ plan.total_installments }} parcelas · {{ plan.total_amount }}</p>
          </div>

          <span class="badge">{{ plan.first_due_date }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
