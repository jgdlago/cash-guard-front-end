<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"
import { useUiStore } from "@/stores/ui"

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const mode = ref<"login" | "register">("login")
const errorMessage = ref("")

const loginForm = reactive({
  email: "",
  password: "",
  device_name: "web",
})

const registerForm = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  device_name: "web",
})

const modeTitle = computed(() => (mode.value === "login" ? "Entrar" : "Criar conta"))
const modeDescription = computed(() =>
  mode.value === "login"
    ? "Acesse seu dashboard, extrato e parcelamentos em um fluxo direto."
    : "Comece sem configurar contas bancárias complexas e organize o mês desde o primeiro acesso.",
)

async function handleSubmit() {
  errorMessage.value = ""

  try {
    if (mode.value === "login") {
      await auth.login(loginForm)
      ui.pushToast("Login realizado com sucesso.", "success")
    } else {
      await auth.register(registerForm)
      ui.pushToast("Conta criada com sucesso.", "success")
    }

    await router.push({ name: "dashboard" })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao autenticar."
  }
}
</script>

<template>
  <section class="auth-layout">
    <div class="hero-card auth-hero auth-hero-panel">
      <div class="stack-list auth-hero-copy">
        <div>
          <p class="eyebrow">Cash Guard</p>
          <h1>Controle financeiro elegante, rápido e sem burocracia bancária.</h1>
          <p>
            A aplicação foi desenhada para registrar entradas e saídas com clareza, mantendo categorias padrão,
            origens opcionais e parcelamentos flexíveis em uma experiência leve.
          </p>
        </div>

        <div class="content-grid-2 auth-feature-grid">
          <article class="mini-feature-card">
            <strong>Resumo imediato</strong>
            <p>Dashboard mensal com leitura rápida do saldo, receitas, despesas e categorias.</p>
          </article>

          <article class="mini-feature-card">
            <strong>Extrato operacional</strong>
            <p>Lançamentos simples, filtros rápidos e fluxo direto para registrar o dia a dia.</p>
          </article>

          <article class="mini-feature-card">
            <strong>Parcelas variáveis</strong>
            <p>Compras parceladas com valores diferentes, sem limitar o modelo a divisões iguais.</p>
          </article>

          <article class="mini-feature-card">
            <strong>Origens opcionais</strong>
            <p>Use cartão, carteira ou conta pagadora apenas quando fizer sentido para você.</p>
          </article>
        </div>
      </div>
    </div>

    <div class="hero-card auth-form-card">
      <div class="segmented-control auth-segmented-control">
        <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">Entrar</button>
        <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">Criar conta</button>
      </div>

      <div class="auth-form-header">
        <h2>{{ modeTitle }}</h2>
        <p class="muted-text">{{ modeDescription }}</p>
      </div>

      <form class="form-grid" @submit.prevent="handleSubmit">
        <template v-if="mode === 'login'">
          <label class="field-span-2">
            E-mail
            <input v-model="loginForm.email" type="email" autocomplete="email" required />
          </label>

          <label class="field-span-2">
            Senha
            <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
          </label>
        </template>

        <template v-else>
          <label class="field-span-2">
            Nome
            <input v-model="registerForm.name" type="text" placeholder="Seu nome" autocomplete="name" required />
          </label>

          <label class="field-span-2">
            E-mail
            <input v-model="registerForm.email" type="email" autocomplete="email" required />
          </label>

          <label>
            Senha
            <input v-model="registerForm.password" type="password" autocomplete="new-password" required />
          </label>

          <label>
            Confirmar senha
            <input v-model="registerForm.password_confirmation" type="password" autocomplete="new-password" required />
          </label>
        </template>

        <p v-if="errorMessage" class="error-message field-span-2 inline-alert">{{ errorMessage }}</p>

        <button class="primary-button field-span-2" :disabled="auth.loading">
          {{ auth.loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta" }}
        </button>
      </form>
    </div>
  </section>
</template>
