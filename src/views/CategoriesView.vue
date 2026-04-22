<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

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
})

const form = reactive({
  name: "",
  direction: "expense" as CategoryDirection,
})

const filteredCategories = computed(() => {
  return categories.value.filter((category) => {
    const matchesQuery = !filters.query || category.name.toLowerCase().includes(filters.query.toLowerCase())
    const matchesScope =
      filters.scope === "all" || (filters.scope === "system" ? category.kind === "system" : category.kind === "custom")

    return matchesQuery && matchesScope
  })
})

const systemCategories = computed(() => filteredCategories.value.filter((category) => category.kind === "system"))
const customCategories = computed(() => filteredCategories.value.filter((category) => category.kind === "custom"))

async function loadCategories() {
  loading.value = true

  try {
    categories.value = await api.categories()
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

onMounted(() => {
  void loadCategories()
})
</script>

<template>
  <section class="page-section categories-page">
    <PageHeader
      eyebrow="Categorias"
      title="Catálogo de classificação"
      description="Misture a base padrão do sistema com categorias próprias sem perder a simplicidade do lançamento."
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

          <div class="filter-bar">
            <select v-model="filters.scope">
              <option value="all">Todas</option>
              <option value="system">Padrão do sistema</option>
              <option value="custom">Personalizadas</option>
            </select>

            <input v-model="filters.query" type="search" placeholder="Buscar categoria" />
          </div>
        </div>

        <p v-if="loading" class="muted-text">Carregando categorias...</p>

        <template v-else>
          <section class="stack-list grouped-list">
            <div class="list-group">
              <div class="list-group-header">
                <div>
                  <strong>Padrão do sistema</strong>
                  <p>Categorias semeadas e compartilhadas entre usuários.</p>
                </div>
                <span class="badge">{{ systemCategories.length }}</span>
              </div>

              <div v-if="systemCategories.length" class="stack-list">
                <article v-for="category in systemCategories" :key="category.id" class="row-card row-card-detail">
                  <div>
                    <strong>{{ category.name }}</strong>
                    <p>{{ category.slug }}</p>
                  </div>
                  <span class="badge">{{ category.direction }}</span>
                </article>
              </div>

              <div v-else class="empty-state compact-empty-state">
                <strong>Nenhuma categoria padrão neste filtro.</strong>
              </div>
            </div>

            <div class="list-group">
              <div class="list-group-header">
                <div>
                  <strong>Personalizadas</strong>
                  <p>Categorias criadas especificamente para o seu uso.</p>
                </div>
                <span class="badge">{{ customCategories.length }}</span>
              </div>

              <div v-if="customCategories.length" class="stack-list">
                <article v-for="category in customCategories" :key="category.id" class="row-card row-card-detail">
                  <div>
                    <strong>{{ category.name }}</strong>
                    <p>Categoria personalizada</p>
                  </div>
                  <span class="badge">{{ category.direction }}</span>
                </article>
              </div>

              <div v-else class="empty-state compact-empty-state">
                <strong>Nenhuma categoria personalizada encontrada.</strong>
                <p>Crie uma nova categoria para adaptar o extrato à sua rotina.</p>
              </div>
            </div>
          </section>
        </template>
      </div>
    </section>
  </section>
</template>
