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

const modeTitle = computed(() => (mode.value === "login" ? "Acessar conta" : "Criar conta"))
const modeDescription = computed(() =>
  mode.value === "login"
    ? "Entre para continuar acompanhando seu mês com uma interface direta e sem excesso de cadastro."
    : "Crie sua conta e comece registrando entradas e saídas sem precisar configurar uma estrutura bancária complexa.",
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
  <section class="auth-layout auth-layout-refined">
    <div class="auth-editorial-panel">
      <div class="auth-editorial-copy">
        <p class="eyebrow">Cash Guard</p>
        <h1>Finanças pessoais com uma interface mais calma, clara e útil.</h1>
        <p class="auth-lead">
          O sistema foi desenhado para organizar rotina financeira, não para simular um internet banking. Registre,
          revise e acompanhe o mês com menos atrito visual e operacional.
        </p>
      </div>

      <div class="auth-metric-strip">
        <div class="auth-metric-card">
          <span>Fluxo principal</span>
          <strong>Entradas e saídas</strong>
        </div>
        <div class="auth-metric-card">
          <span>Modelagem</span>
          <strong>Parcelas variáveis</strong>
        </div>
        <div class="auth-metric-card">
          <span>Complexidade</span>
          <strong>Sem contas obrigatórias</strong>
        </div>
      </div>

      <div class="auth-value-list">
        <article class="auth-value-item">
          <strong>Resumo mensal direto</strong>
          <p>Leitura rápida de saldo, receitas, despesas e principais categorias.</p>
        </article>

        <article class="auth-value-item">
          <strong>Extrato operacional</strong>
          <p>Cadastro rápido, filtros de consulta e edição do que realmente importa.</p>
        </article>

        <article class="auth-value-item">
          <strong>Origens opcionais</strong>
          <p>Cartões, carteira e conta pagadora entram como detalhe, não como pré-requisito.</p>
        </article>
      </div>
    </div>

    <div class="auth-form-shell">
      <div class="auth-form-card auth-form-card-refined">
        <div class="auth-switcher">
          <button type="button" :class="['auth-switcher-button', { active: mode === 'login' }]" @click="mode = 'login'">
            Entrar
          </button>
          <button
            type="button"
            :class="['auth-switcher-button', { active: mode === 'register' }]"
            @click="mode = 'register'"
          >
            Criar conta
          </button>
        </div>

        <div class="auth-form-header auth-form-header-refined">
          <h2>{{ modeTitle }}</h2>
          <p class="muted-text">{{ modeDescription }}</p>
        </div>

        <form class="form-grid form-grid-auth" @submit.prevent="handleSubmit">
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

          <button class="primary-button field-span-2 auth-submit-button" :disabled="auth.loading">
            {{ auth.loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta" }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
