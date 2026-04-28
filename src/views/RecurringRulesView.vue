<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import PaginationNav from "@/components/PaginationNav.vue"
import { usePrecognition } from "@/composables/usePrecognition"
import { api } from "@/services/api"
import { useUiStore } from "@/stores/ui"
import type { Category, PaginationMeta, PaymentSource, RecurringFrequency, RecurringRule, TransactionStatus, TransactionType } from "@/types/api"
import { allowDecimalBeforeInput, sanitizeDecimalInputEvent, sanitizeFreeText, sanitizeSearchText } from "@/utils/inputSanitizers"

const ui = useUiStore()
const rules = ref<RecurringRule[]>([])
const categories = ref<Category[]>([])
const paymentSources = ref<PaymentSource[]>([])
const pagination = ref<PaginationMeta | undefined>(undefined)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref("")
const currentPage = ref(1)
const editingRuleId = ref<number | null>(null)

const filters = reactive({
  type: "all",
  frequency: "all",
  description: "",
  next_run_from: "",
  next_run_to: "",
})

const form = reactive({
  type: "expense" as TransactionType,
  frequency: "monthly" as RecurringFrequency,
  status_on_generate: "posted" as TransactionStatus,
  category_id: "",
  payment_source_id: "",
  amount: "",
  description: "",
  notes: "",
  starts_on: new Date().toISOString().slice(0, 10),
  next_run_on: new Date().toISOString().slice(0, 10),
  ends_on: "",
  is_active: true,
})

const isEditing = computed(() => editingRuleId.value !== null)
const validation = usePrecognition(() => ({
  method: isEditing.value ? "PATCH" : "POST",
  path: isEditing.value ? `/recurring-rules/${editingRuleId.value}` : "/recurring-rules",
  payload: {
    type: form.type,
    frequency: form.frequency,
    status_on_generate: form.status_on_generate,
    category_id: form.category_id ? Number(form.category_id) : null,
    payment_source_id: form.payment_source_id ? Number(form.payment_source_id) : null,
    amount: form.amount,
    description: form.description,
    notes: form.notes || null,
    starts_on: form.starts_on,
    next_run_on: form.next_run_on,
    ends_on: form.ends_on || null,
    is_active: form.is_active,
  },
}))

function buildParams() {
  return {
    page: currentPage.value,
    "filter[type]": filters.type !== "all" ? filters.type : undefined,
    "filter[frequency]": filters.frequency !== "all" ? filters.frequency : undefined,
    "filter[description]": filters.description || undefined,
    "filter[next_run_from]": filters.next_run_from || undefined,
    "filter[next_run_to]": filters.next_run_to || undefined,
    sort: "next_run_on",
  }
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ""

  try {
    const [rulesResponse, categoriesResponse, sourcesResponse] = await Promise.all([
      api.recurringRules(buildParams()),
      api.categories({ sort: "name" }),
      api.paymentSources({ sort: "display_order" }),
    ])

    rules.value = rulesResponse.data
    pagination.value = rulesResponse.meta
    categories.value = categoriesResponse
    paymentSources.value = sourcesResponse
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar recorrências."
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingRuleId.value = null
  form.type = "expense"
  form.frequency = "monthly"
  form.status_on_generate = "posted"
  form.category_id = ""
  form.payment_source_id = ""
  form.amount = ""
  form.description = ""
  form.notes = ""
  form.starts_on = new Date().toISOString().slice(0, 10)
  form.next_run_on = form.starts_on
  form.ends_on = ""
  form.is_active = true
}

function startEditing(rule: RecurringRule) {
  editingRuleId.value = rule.id
  form.type = rule.type
  form.frequency = rule.frequency
  form.status_on_generate = rule.status_on_generate
  form.category_id = rule.category_id ? String(rule.category_id) : ""
  form.payment_source_id = rule.payment_source_id ? String(rule.payment_source_id) : ""
  form.amount = rule.amount
  form.description = rule.description
  form.notes = rule.notes ?? ""
  form.starts_on = rule.starts_on
  form.next_run_on = rule.next_run_on
  form.ends_on = rule.ends_on ?? ""
  form.is_active = rule.is_active
}

function clearFilters() {
  currentPage.value = 1
  filters.type = "all"
  filters.frequency = "all"
  filters.description = ""
  filters.next_run_from = ""
  filters.next_run_to = ""
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

function sanitizeAmount(event: Event) {
  form.amount = sanitizeDecimalInputEvent(event)
}

function sanitizeDescription() {
  form.description = sanitizeFreeText(form.description, 255)
}

function sanitizeNotes() {
  form.notes = sanitizeFreeText(form.notes, 2000)
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  const payload = {
    type: form.type,
    frequency: form.frequency,
    status_on_generate: form.status_on_generate,
    category_id: form.category_id ? Number(form.category_id) : null,
    payment_source_id: form.payment_source_id ? Number(form.payment_source_id) : null,
    amount: form.amount,
    description: form.description,
    notes: form.notes || null,
    starts_on: form.starts_on,
    next_run_on: form.next_run_on,
    ends_on: form.ends_on || null,
    is_active: form.is_active,
  }

  try {
    if (editingRuleId.value) {
      await api.updateRecurringRule(editingRuleId.value, payload)
      ui.pushToast("Recorrência atualizada.", "success")
    } else {
      await api.createRecurringRule(payload)
      ui.pushToast("Recorrência criada.", "success")
    }

    resetForm()
    await loadPage()
  } catch (error) {
    if (validation.capture(error)) {
      errorMessage.value = "Revise os campos destacados."
      return
    }

    errorMessage.value = error instanceof Error ? error.message : "Falha ao salvar recorrência."
  } finally {
    saving.value = false
  }
}

async function deactivateRule(id: number) {
  await api.deactivateRecurringRule(id)
  if (editingRuleId.value === id) {
    resetForm()
  }
  ui.pushToast("Recorrência desativada.", "info")
  await loadPage()
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <section class="page-section recurring-rules-page refined-page">
    <PageHeader
      eyebrow="Recorrências"
      title="Regras recorrentes"
      description="Controle mais claro entre cadastro da regra, leitura das próximas execuções e manutenção do histórico programado."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="workspace-grid workspace-grid-refined">
      <div class="section-card section-card-tight form-panel surface-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">{{ isEditing ? "Edição" : "Nova regra" }}</p>
            <h2>{{ isEditing ? "Atualizar recorrência" : "Criar recorrência" }}</h2>
          </div>
          <button v-if="isEditing" class="ghost-button" type="button" @click="resetForm">Nova</button>
        </div>

        <form class="form-grid form-grid-dense recurring-form" @submit.prevent="submitForm">
          <div class="field-span-2 automation-focus tone-recurring">
            <AppIcon name="recurring" />
            <div>
              <span>Contrato mensal</span>
              <strong>{{ form.description || "Nova recorrência" }}</strong>
            </div>
          </div>

          <label>
            Tipo
            <select v-model="form.type" @change="validation.validate('type')">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <p v-if="validation.errors.type" class="field-error">{{ validation.errors.type }}</p>
          </label>

          <label>
            Frequência
            <select v-model="form.frequency" @change="validation.validate('frequency')">
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
            <p v-if="validation.errors.frequency" class="field-error">{{ validation.errors.frequency }}</p>
          </label>

          <label>
            Status gerado
            <select v-model="form.status_on_generate" @change="validation.validate('status_on_generate')">
              <option value="posted">Lançado</option>
              <option value="pending">Pendente</option>
              <option value="draft">Rascunho</option>
            </select>
            <p v-if="validation.errors.status_on_generate" class="field-error">{{ validation.errors.status_on_generate }}</p>
          </label>

          <label>
            Valor
            <input
              v-model="form.amount"
              type="text"
              inputmode="decimal"
              pattern="\\d+([,.]\\d{1,2})?"
              placeholder="0,00"
              required
              @beforeinput="allowDecimalBeforeInput"
              @input="sanitizeAmount"
              @change="validation.validate('amount')"
            />
            <p v-if="validation.errors.amount" class="field-error">{{ validation.errors.amount }}</p>
          </label>

          <label>
            Início
            <input v-model="form.starts_on" type="date" required @change="validation.validate('starts_on')" />
            <p v-if="validation.errors.starts_on" class="field-error">{{ validation.errors.starts_on }}</p>
          </label>

          <label>
            Próxima execução
            <input v-model="form.next_run_on" type="date" required @change="validation.validate('next_run_on')" />
            <p v-if="validation.errors.next_run_on" class="field-error">{{ validation.errors.next_run_on }}</p>
          </label>

          <label>
            Categoria
            <select v-model="form.category_id" @change="validation.validate('category_id')">
              <option value="">Sem categoria</option>
              <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                {{ category.name }}
              </option>
            </select>
            <p v-if="validation.errors.category_id" class="field-error">{{ validation.errors.category_id }}</p>
          </label>

          <label>
            Origem
            <select v-model="form.payment_source_id" @change="validation.validate('payment_source_id')">
              <option value="">Sem origem</option>
              <option v-for="source in paymentSources" :key="source.id" :value="String(source.id)">
                {{ source.name }}
              </option>
            </select>
            <p v-if="validation.errors.payment_source_id" class="field-error">{{ validation.errors.payment_source_id }}</p>
          </label>

          <label class="field-span-2">
            Descrição
            <input
              v-model="form.description"
              type="text"
              placeholder="Ex: assinatura"
              required
              maxlength="255"
              @input="sanitizeDescription"
              @change="validation.validate('description')"
            />
            <p v-if="validation.errors.description" class="field-error">{{ validation.errors.description }}</p>
          </label>

          <label class="field-span-2">
            Observações
            <textarea
              v-model="form.notes"
              rows="3"
              maxlength="2000"
              placeholder="Opcional"
              @input="sanitizeNotes"
              @change="validation.validate('notes')"
            ></textarea>
            <p v-if="validation.errors.notes" class="field-error">{{ validation.errors.notes }}</p>
          </label>

          <label>
            Encerrar em
            <input v-model="form.ends_on" type="date" @change="validation.validate('ends_on')" />
            <p v-if="validation.errors.ends_on" class="field-error">{{ validation.errors.ends_on }}</p>
          </label>

          <label class="toggle-field switch-field">
            <span>Ativa</span>
            <input v-model="form.is_active" type="checkbox" @change="validation.validate('is_active')" />
            <i></i>
            <p v-if="validation.errors.is_active" class="field-error">{{ validation.errors.is_active }}</p>
          </label>

          <button class="primary-button field-span-2" :disabled="saving">
            {{ saving ? "Salvando..." : isEditing ? "Atualizar recorrência" : "Criar recorrência" }}
          </button>
        </form>
      </div>

      <div class="section-card section-card-tight list-panel surface-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Lista</p>
            <h2>Regras existentes</h2>
          </div>
        </div>

        <div class="filter-panel filter-panel-inline filter-panel-refined">
          <div class="filter-bar">
            <select v-model="filters.type">
              <option value="all">Todos os tipos</option>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <select v-model="filters.frequency">
              <option value="all">Todas as frequências</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
            <input v-model="filters.description" type="search" maxlength="120" placeholder="Buscar descrição" @input="filters.description = sanitizeSearchText(filters.description)" />
            <input v-model="filters.next_run_from" type="date" />
            <input v-model="filters.next_run_to" type="date" />
          </div>
          <div class="filter-bar filter-bar-actions">
            <button class="primary-button" type="button" @click="applyFilters">Aplicar</button>
            <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <LoadingState v-if="loading" message="Carregando recorrências..." />

        <template v-else>
          <EmptyState
            v-if="!rules.length"
            title="Nenhuma recorrência encontrada."
            description="Crie uma regra para automatizar despesas e receitas previsíveis."
            icon="recurring"
            tone="recurring"
          />

          <template v-else>
            <div class="stack-list stack-list-tight recurring-card-list">
              <article v-for="rule in rules" :key="rule.id" :class="['timeline-card recurring-card tone-recurring', { 'is-inactive': !rule.is_active }]">
                <div class="plan-card-top">
                  <div>
                    <div class="inline-meta-row inline-meta-row-wrap">
                      <strong>{{ rule.description }}</strong>
                      <span :class="['badge', `tone-${rule.type}`]">{{ rule.type }}</span>
                      <span class="badge tone-recurring">{{ rule.frequency }}</span>
                      <span :class="['badge', rule.is_active ? 'status-posted' : 'status-cancelled']">{{ rule.is_active ? "ativa" : "inativa" }}</span>
                    </div>
                    <p>Próxima execução em {{ rule.next_run_on }}</p>
                  </div>
                  <strong>{{ rule.amount }}</strong>
                </div>
                <div class="rule-timeline">
                  <span><i></i> Início {{ rule.starts_on }}</span>
                  <span><i></i> Próxima {{ rule.next_run_on }}</span>
                  <span><i></i> {{ rule.ends_on ? `Encerra ${rule.ends_on}` : "Sem encerramento" }}</span>
                </div>
                <div class="plan-card-meta">
                  <span class="badge">{{ rule.status_on_generate }}</span>
                  <span class="badge">{{ rule.transactions_count ?? 0 }} lançamentos</span>
                </div>
                <div class="row-button-group">
                  <button class="ghost-button" type="button" @click="startEditing(rule)">Editar</button>
                  <button class="ghost-button" type="button" @click="deactivateRule(rule.id)">Desativar</button>
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
