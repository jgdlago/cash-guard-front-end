import { computed, ref } from "vue"
import { defineStore } from "pinia"

import { api, tokenStorage } from "@/services/api"
import type { User } from "@/types/api"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(tokenStorage.get())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  async function hydrate() {
    if (!token.value) {
      return
    }

    loading.value = true

    try {
      user.value = await api.me()
    } catch {
      token.value = null
      user.value = null
      tokenStorage.clear()
    } finally {
      loading.value = false
    }
  }

  async function register(payload: Record<string, unknown>) {
    loading.value = true

    try {
      const response = await api.register(payload)
      token.value = response.token
      user.value = response.user
      tokenStorage.set(response.token)
    } finally {
      loading.value = false
    }
  }

  async function login(payload: Record<string, unknown>) {
    loading.value = true

    try {
      const response = await api.login(payload)
      token.value = response.token
      user.value = response.user
      tokenStorage.set(response.token)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      token.value = null
      user.value = null
      tokenStorage.clear()
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    hydrate,
    register,
    login,
    logout,
  }
})
