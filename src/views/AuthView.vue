<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"

import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import BaseField from "@/components/base/BaseField.vue"
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
    ? "Entre para acompanhar seu mês com uma interface direta e sem excesso de cadastro."
    : "Crie sua conta e comece registrando entradas e saídas sem precisar montar uma estrutura bancária complexa.",
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
  <section class="auth-layout auth-layout-refined auth-layout-system">
    <div class="auth-editorial-panel auth-editorial-panel-refined">
      <div class="auth-editorial-copy">
        <p class="eyebrow">Cash Guard</p>
        <h1>Finanças pessoais com clareza, ritmo e menos ruído.</h1>
        <p class="auth-lead">
          Organize entradas, saídas, parcelas e recorrências em uma experiência feita para uso diário, com foco em leitura rápida e ação simples.
        </p>
      </div>

      <div class="auth-metric-strip auth-metric-strip-refined">
        <BaseCard variant="muted" class="auth-metric-card" :padded="true">
          <span>Fluxo central</span>
          <strong>Entradas e saídas</strong>
        </BaseCard>
        <BaseCard variant="muted" class="auth-metric-card" :padded="true">
          <span>Parcelamento</span>
          <strong>Valores variáveis</strong>
        </BaseCard>
        <BaseCard variant="muted" class="auth-metric-card" :padded="true">
          <span>Estrutura</span>
          <strong>Sem contas obrigatórias</strong>
        </BaseCard>
      </div>

      <BaseCard variant="subtle" class="auth-value-panel">
        <div class="auth-value-list">
          <article class="auth-value-item">
            <strong>Resumo mensal direto</strong>
            <p>Saldo, receitas, despesas e categorias principais com leitura objetiva.</p>
          </article>

          <article class="auth-value-item">
            <strong>Extrato operacional</strong>
            <p>Cadastro rápido, filtros úteis e edição sem fricção desnecessária.</p>
          </article>

          <article class="auth-value-item">
            <strong>Origens opcionais</strong>
            <p>Cartões e conta pagadora entram como detalhe operacional, não como burocracia inicial.</p>
          </article>
        </div>
      </BaseCard>
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
              <input v-model="loginForm.email" type="email" autocomplete="email" required />
            </BaseField>

            <BaseField label="Senha" class="field-span-2">
              <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
            </BaseField>
          </template>

          <template v-else>
            <BaseField label="Nome" class="field-span-2">
              <input v-model="registerForm.name" type="text" placeholder="Seu nome" autocomplete="name" required />
            </BaseField>

            <BaseField label="E-mail" class="field-span-2">
              <input v-model="registerForm.email" type="email" autocomplete="email" required />
            </BaseField>

            <BaseField label="Senha">
              <input v-model="registerForm.password" type="password" autocomplete="new-password" required />
            </BaseField>

            <BaseField label="Confirmar senha">
              <input v-model="registerForm.password_confirmation" type="password" autocomplete="new-password" required />
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
