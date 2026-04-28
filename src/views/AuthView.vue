<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"

import AppIcon from "@/components/AppIcon.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import BaseField from "@/components/base/BaseField.vue"
import { usePrecognition } from "@/composables/usePrecognition"
import { useAuthStore } from "@/stores/auth"
import { useUiStore } from "@/stores/ui"
import { sanitizeFreeText } from "@/utils/inputSanitizers"

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
    ? "Entre para acompanhar seu mês com uma interface direta e sem excesso de cadastro."
    : "Crie sua conta e comece registrando entradas e saídas sem precisar montar uma estrutura bancária complexa.",
)
const loginValidation = usePrecognition(() => ({
  method: "POST",
  path: "/auth/login",
  payload: loginForm,
}))
const registerValidation = usePrecognition(() => ({
  method: "POST",
  path: "/auth/register",
  payload: registerForm,
}))
const activeValidation = computed(() => (mode.value === "login" ? loginValidation : registerValidation))

function sanitizeRegisterName() {
  registerForm.name = sanitizeFreeText(registerForm.name, 255)
}

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
    if (activeValidation.value.capture(error)) {
      errorMessage.value = "Revise os campos destacados."
      return
    }

    errorMessage.value = error instanceof Error ? error.message : "Falha ao autenticar."
  }
}
</script>

<template>
  <section class="auth-layout auth-layout-refined auth-layout-system">
    <div class="auth-editorial-panel auth-editorial-panel-refined">
      <div class="auth-editorial-copy">
        <p class="eyebrow">Cash Guard</p>
        <h1>Seu mês financeiro, em ordem.</h1>
        <p class="auth-lead">
          Organize entradas, saídas, parcelas e recorrências em uma experiência feita para uso diário, com foco em leitura rápida e ação simples.
        </p>
      </div>

      <BaseCard variant="subtle" class="auth-preview-card flow-card">
        <div class="auth-preview-top">
          <div>
            <span>Saldo de abril</span>
            <strong>R$ 2.480,00</strong>
          </div>
          <span class="badge tone-income">positivo</span>
        </div>
        <div class="auth-preview-flow">
          <span class="tone-income">Entradas</span>
          <i></i>
          <span class="tone-expense">Saídas</span>
          <i></i>
          <span class="tone-recurring">Recorrências</span>
        </div>
        <div class="auth-preview-list">
          <article><AppIcon name="income" /><div><strong>Receita recebida</strong><p>Hoje, 09:20</p></div><b>+R$ 4.800</b></article>
          <article><AppIcon name="expense" /><div><strong>Mercado</strong><p>Alimentação</p></div><b>-R$ 286</b></article>
          <article><AppIcon name="recurring" /><div><strong>Assinatura</strong><p>Próxima execução</p></div><b>12/05</b></article>
        </div>
      </BaseCard>

      <div class="auth-metric-strip auth-metric-strip-refined">
        <BaseCard variant="muted" class="auth-metric-card tone-flow" :padded="true">
          <AppIcon name="flow" />
          <span>Fluxo</span>
          <strong>Entradas e saídas</strong>
        </BaseCard>
        <BaseCard variant="muted" class="auth-metric-card tone-warning" :padded="true">
          <AppIcon name="calendar" />
          <span>Parcelas</span>
          <strong>Vencimentos claros</strong>
        </BaseCard>
        <BaseCard variant="muted" class="auth-metric-card tone-recurring" :padded="true">
          <AppIcon name="recurring" />
          <span>Rotina</span>
          <strong>Regras recorrentes</strong>
        </BaseCard>
      </div>
    </div>

    <div class="auth-form-shell">
      <BaseCard class="auth-form-card auth-form-card-refined auth-form-card-system">
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
            <BaseField label="E-mail" class="field-span-2">
              <input v-model="loginForm.email" type="email" autocomplete="email" required @change="loginValidation.validate('email')" />
              <p v-if="loginValidation.errors.email" class="field-error">{{ loginValidation.errors.email }}</p>
            </BaseField>

            <BaseField label="Senha" class="field-span-2">
              <input
                v-model="loginForm.password"
                type="password"
                autocomplete="current-password"
                required
                @change="loginValidation.validate('password')"
              />
              <p v-if="loginValidation.errors.password" class="field-error">{{ loginValidation.errors.password }}</p>
            </BaseField>
          </template>

          <template v-else>
            <BaseField label="Nome" class="field-span-2">
              <input
                v-model="registerForm.name"
                type="text"
                placeholder="Seu nome"
                autocomplete="name"
                required
                maxlength="255"
                @input="sanitizeRegisterName"
                @change="registerValidation.validate('name')"
              />
              <p v-if="registerValidation.errors.name" class="field-error">{{ registerValidation.errors.name }}</p>
            </BaseField>

            <BaseField label="E-mail" class="field-span-2">
              <input
                v-model="registerForm.email"
                type="email"
                autocomplete="email"
                required
                maxlength="255"
                @change="registerValidation.validate('email')"
              />
              <p v-if="registerValidation.errors.email" class="field-error">{{ registerValidation.errors.email }}</p>
            </BaseField>

            <BaseField label="Senha">
              <input
                v-model="registerForm.password"
                type="password"
                autocomplete="new-password"
                required
                @change="registerValidation.validate('password', ['password', 'password_confirmation'])"
              />
              <p v-if="registerValidation.errors.password" class="field-error">{{ registerValidation.errors.password }}</p>
            </BaseField>

            <BaseField label="Confirmar senha">
              <input
                v-model="registerForm.password_confirmation"
                type="password"
                autocomplete="new-password"
                required
                @change="registerValidation.validate('password_confirmation', ['password', 'password_confirmation'])"
              />
              <p v-if="registerValidation.errors.password_confirmation" class="field-error">
                {{ registerValidation.errors.password_confirmation }}
              </p>
            </BaseField>
          </template>

          <p v-if="errorMessage" class="error-message field-span-2 inline-alert">{{ errorMessage }}</p>

          <BaseButton class="field-span-2 auth-submit-button" type="submit" block :disabled="auth.loading">
            {{ auth.loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta" }}
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  </section>
</template>
