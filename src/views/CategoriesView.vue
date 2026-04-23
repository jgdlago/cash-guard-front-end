<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import PageHeader from "@/components/PageHeader.vue"
import { api } from "@/services/api"
import type { Category, CategoryDirection } from "@/types/api"

const categories = ref<Category[]>([])
const errorMessage = ref("")
const loading = ref(false)
const saving = ref(false)
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
    await loadCategories()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao criar categoria."
  } finally {
    saving.value = false
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
  <section class="page-section categories-page">
    <PageHeader
      eyebrow="Categorias"
      title="Catálogo de classificação"
      description="Consuma o catálogo usando filtros reais do backend e mantenha suas categorias próprias no mesmo fluxo."
    />

    <p v-if="errorMessage" class="error-message inline-alert">{{ errorMessage }}</p>

    <section class="content-grid-2 split-workspace">
      <div class="section-card sticky-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Nova categoria</p>
            <h2>Criar categoria personalizada</h2>
          </div>
        </div>

        <form class="form-grid" @submit.prevent="submitForm">
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

      <div class="section-card">
        <div class="section-header compact list-header">
          <div>
            <p class="eyebrow">Lista</p>
            <h2>Categorias disponíveis</h2>
          </div>
        </div>

        <div class="filter-panel">
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

          <div class="filter-bar">
            <button class="primary-button" type="button" @click="loadCategories">Aplicar filtros</button>
            <button class="ghost-button" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <p v-if="loading" class="muted-text">Carregando categorias...</p>

        <div v-else-if="!categories.length" class="empty-state">
          <strong>Nenhuma categoria encontrada.</strong>
          <p>Ajuste os filtros ou crie uma categoria personalizada.</p>
        </div>

        <div v-else class="stack-list">
          <article v-for="category in categories" :key="category.id" class="row-card row-card-detail">
            <div>
              <strong>{{ category.name }}</strong>
              <p>{{ category.kind === "system" ? "Padrão do sistema" : "Categoria personalizada" }}</p>
            </div>
            <div class="row-button-group row-button-group-inline">
              <span class="badge">{{ category.kind }}</span>
              <span class="badge">{{ category.direction }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </section>
</template>
