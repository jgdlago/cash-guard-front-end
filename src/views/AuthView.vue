<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
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

async function handleSubmit() {
  errorMessage.value = ""

  try {
    if (mode.value === "login") {
      await auth.login(loginForm)
    } else {
      await auth.register(registerForm)
    }

    await router.push({ name: "dashboard" })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Falha ao autenticar."
  }
}
</script>

<template>
  <section class="auth-layout">
    <div class="hero-card auth-hero">
      <p class="eyebrow">Cash Guard</p>
      <h1>Entradas, saídas e parcelas com um fluxo direto.</h1>
      <p>
        O front-end segue o plano do produto: dashboard mensal, categorias padrão e customizadas,
        lançamentos simples, origens opcionais e parcelamentos com valores diferentes.
      </p>
    </div>

    <div class="hero-card auth-form-card">
      <div class="segmented-control">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Entrar</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Criar conta</button>
      </div>

      <form class="form-grid" @submit.prevent="handleSubmit">
        <template v-if="mode === 'login'">
          <label class="field-span-2">
            E-mail
            <input v-model="loginForm.email" type="email" required />
          </label>

          <label class="field-span-2">
            Senha
            <input v-model="loginForm.password" type="password" required />
          </label>
        </template>

        <template v-else>
          <label class="field-span-2">
            Nome
            <input v-model="registerForm.name" type="text" placeholder="Seu nome" required />
          </label>

          <label class="field-span-2">
            E-mail
            <input v-model="registerForm.email" type="email" required />
          </label>

          <label>
            Senha
            <input v-model="registerForm.password" type="password" required />
          </label>

          <label>
            Confirmar senha
            <input v-model="registerForm.password_confirmation" type="password" required />
          </label>
        </template>

        <p v-if="errorMessage" class="error-message field-span-2">{{ errorMessage }}</p>

        <button class="primary-button field-span-2" :disabled="auth.loading">
          {{ auth.loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta" }}
        </button>
      </form>
    </div>
  </section>
</template>
