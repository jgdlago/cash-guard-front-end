<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"

import { api } from "@/services/api"
import type { Category, CategoryDirection } from "@/types/api"

const categories = ref<Category[]>([])
const errorMessage = ref("")
const saving = ref(false)

const form = reactive({
  name: "",
  direction: "expense" as CategoryDirection,
})

async function loadCategories() {
  try {
    categories.value = await api.categories()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao carregar categorias."
  }
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ""

  try {
    await api.createCategory(form)
    form.name = ""
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
  <section class="page-section split-layout">
    <div class="hero-card">
      <p class="eyebrow">Categorias</p>
      <h2>Catálogo global + customizações do usuário</h2>

      <form class="form-grid" @submit.prevent="submitForm">
        <label class="field-span-2">
          Nome
          <input v-model="form.name" type="text" placeholder="Ex: Pets" required />
        </label>

        <label>
          Direção
          <select v-model="form.direction">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="both">Ambas</option>
          </select>
        </label>

        <button class="primary-button" :disabled="saving">
          {{ saving ? "Salvando..." : "Criar categoria" }}
        </button>
      </form>
    </div>

    <div class="hero-card">
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <ul class="stack-list">
        <li v-for="category in categories" :key="category.id" class="row-card">
          <div>
            <strong>{{ category.name }}</strong>
            <p>{{ category.kind === "system" ? "Padrão do sistema" : "Categoria personalizada" }}</p>
          </div>

          <span class="badge">{{ category.direction }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
