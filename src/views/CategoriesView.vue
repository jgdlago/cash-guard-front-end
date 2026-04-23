<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import EmptyState from "@/components/EmptyState.vue"
import LoadingState from "@/components/LoadingState.vue"
import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import { useUiStore } from "@/stores/ui"
import type { Category, CategoryDirection } from "@/types/api"

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
            <input v-model="form.name" type="text" placeholder="Ex: Pets" required />
          </label>

          <label class="field-span-2">
            Direção
            <select v-model="form.direction">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="both">Ambas</option>
            </select>
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

            <input v-model="filters.query" type="search" placeholder="Buscar categoria" />
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
          />

          <div v-else class="stack-list stack-list-tight">
            <article
              v-for="category in categories"
              :key="category.id"
              class="row-card row-card-compact row-card-detail category-row-card refined-list-row"
            >
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
