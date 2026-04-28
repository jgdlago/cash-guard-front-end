<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import { usePrecognition } from "@/composables/usePrecognition"
import { api } from "@/services/api"
import { useUiStore } from "@/stores/ui"
import type { Category, CategoryDirection } from "@/types/api"
import { sanitizeFreeText, sanitizeSearchText } from "@/utils/inputSanitizers"

const ui = useUiStore()
const categories = ref<Category[]>([])
const errorMessage = ref("")
const loading = ref(false)
const saving = ref(false)
const preferenceSavingId = ref<number | null>(null)
const filters = reactive({
  query: "",
  scope: "all",
  direction: "all",
})

const form = reactive({
  name: "",
  direction: "expense" as CategoryDirection,
})
const validation = usePrecognition(() => ({
  method: "POST",
  path: "/categories",
  payload: form,
}))

function buildCategoryParams() {
  return {
    "filter[name]": filters.query || undefined,
    "filter[scope]": filters.scope !== "all" ? filters.scope : undefined,
    "filter[direction]": filters.direction !== "all" ? filters.direction : undefined,
    "filter[with_hidden]": true,
    sort: "name",
  }
}

async function loadCategories() {
  loading.value = true

  try {
    categories.value = await api.categories(buildCategoryParams())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar categorias."
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  try {
    await api.createCategory(form)
    form.name = ""
    form.direction = "expense"
    ui.pushToast("Categoria criada.", "success")
    await loadCategories()
  } catch (error) {
    if (validation.capture(error)) {
      errorMessage.value = "Revise os campos destacados."
      return
    }

    errorMessage.value = error instanceof Error ? error.message : "Falha ao criar categoria."
  } finally {
    saving.value = false
  }
}

async function toggleHidden(category: Category) {
  preferenceSavingId.value = category.id

  try {
    await api.updateCategoryPreference(category.id, {
      is_hidden: !category.is_hidden,
      display_order_override: category.display_order_override,
    })
    ui.pushToast(category.is_hidden ? "Categoria reexibida." : "Categoria ocultada.", "info")
    await loadCategories()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao atualizar preferência."
  } finally {
    preferenceSavingId.value = null
  }
}

async function bumpOrder(category: Category) {
  preferenceSavingId.value = category.id

  try {
    await api.updateCategoryPreference(category.id, {
      is_hidden: category.is_hidden,
      display_order_override: (category.display_order_override ?? category.display_order) + 10,
    })
    ui.pushToast("Preferência de ordem atualizada.", "success")
    await loadCategories()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao atualizar ordenação."
  } finally {
    preferenceSavingId.value = null
  }
}

async function resetPreference(category: Category) {
  preferenceSavingId.value = category.id

  try {
    await api.deleteCategoryPreference(category.id)
    ui.pushToast("Preferência removida.", "info")
    await loadCategories()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao remover preferência."
  } finally {
    preferenceSavingId.value = null
  }
}

function clearFilters() {
  filters.query = ""
  filters.scope = "all"
  filters.direction = "all"
  void loadCategories()
}

function sanitizeName() {
  form.name = sanitizeFreeText(form.name, 120)
}

onMounted(() => {
  void loadCategories()
})
</script>

<template>
  <section class="page-section categories-page refined-page">
    <PageHeader
      eyebrow="Categorias"
      title="Catálogo de classificação"
      description="Separação mais clara entre criação de categoria, filtros e preferências de exibição do usuário."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="workspace-grid workspace-grid-refined">
      <div class="section-card section-card-tight form-panel surface-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Nova categoria</p>
            <h2>Criar categoria personalizada</h2>
          </div>
        </div>

        <form class="form-grid form-grid-dense" @submit.prevent="submitForm">
          <label class="field-span-2">
            Nome
            <input
              v-model="form.name"
              type="text"
              placeholder="Ex: Pets"
              required
              maxlength="120"
              @input="sanitizeName"
              @change="validation.validate('name')"
            />
            <p v-if="validation.errors.name" class="field-error">{{ validation.errors.name }}</p>
          </label>

          <label class="field-span-2">
            Direção
            <select v-model="form.direction" @change="validation.validate('direction')">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="both">Ambas</option>
            </select>
            <p v-if="validation.errors.direction" class="field-error">{{ validation.errors.direction }}</p>
          </label>

          <button class="primary-button field-span-2" :disabled="saving">
            {{ saving ? "Salvando..." : "Criar categoria" }}
          </button>
        </form>
      </div>

      <div class="section-card section-card-tight list-panel surface-panel">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Lista</p>
            <h2>Categorias disponíveis</h2>
          </div>
        </div>

        <div class="filter-panel filter-panel-inline filter-panel-refined">
          <div class="filter-bar">
            <select v-model="filters.scope">
              <option value="all">Todas</option>
              <option value="system">Padrão do sistema</option>
              <option value="custom">Personalizadas</option>
            </select>

            <select v-model="filters.direction">
              <option value="all">Todas as direções</option>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="both">Ambas</option>
            </select>

            <input v-model="filters.query" type="search" maxlength="120" placeholder="Buscar categoria" @input="filters.query = sanitizeSearchText(filters.query)" />
          </div>

          <div class="filter-bar filter-bar-actions">
            <button class="primary-button" type="button" @click="loadCategories">Aplicar</button>
            <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <LoadingState v-if="loading" message="Carregando categorias..." />

        <template v-else>
          <EmptyState
            v-if="!categories.length"
            title="Nenhuma categoria encontrada."
            description="Ajuste os filtros ou crie uma categoria personalizada."
            icon="tag"
            tone="flow"
          />

          <div v-else class="stack-list stack-list-tight">
            <article
              v-for="category in categories"
              :key="category.id"
              :class="['category-token-row', `tone-${category.direction === 'income' ? 'income' : category.direction === 'expense' ? 'expense' : 'flow'}`, { 'is-muted': category.is_hidden }]"
            >
              <span class="category-token-icon" :style="{ '--category-color': category.color ?? undefined }">
                <AppIcon name="tag" />
              </span>
              <div class="transaction-main transaction-main-refined">
                <div class="inline-meta-row inline-meta-row-wrap">
                  <strong>{{ category.name }}</strong>
                  <span class="badge">{{ category.kind }}</span>
                  <span class="badge">{{ category.direction }}</span>
                </div>
                <p>
                  {{ category.kind === "system" ? "Padrão do sistema" : "Categoria personalizada" }}
                  <span v-if="category.is_hidden"> · Oculta</span>
                  <span v-if="category.display_order_override !== null"> · Ordem personalizada</span>
                </p>
              </div>
              <div class="row-actions action-stack compact-actions">
                <div class="row-button-group">
                  <button class="ghost-button" type="button" :disabled="preferenceSavingId === category.id" @click="toggleHidden(category)">
                    {{ category.is_hidden ? "Exibir" : "Ocultar" }}
                  </button>
                  <button class="ghost-button" type="button" :disabled="preferenceSavingId === category.id" @click="bumpOrder(category)">
                    Priorizar
                  </button>
                  <button class="ghost-button" type="button" :disabled="preferenceSavingId === category.id" @click="resetPreference(category)">
                    Resetar
                  </button>
                </div>
              </div>
            </article>
          </div>
        </template>
      </div>
    </section>
  </section>
</template>
