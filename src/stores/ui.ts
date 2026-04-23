import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"

type ThemeMode = "light" | "dark"
type ToastTone = "success" | "error" | "info"

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const THEME_STORAGE_KEY = "cash-guard-theme"
const SIDEBAR_STORAGE_KEY = "cash-guard-sidebar-collapsed"

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY)

  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getInitialSidebarState(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1"
}

export const useUiStore = defineStore("ui", () => {
  const themeMode = ref<ThemeMode>(getInitialTheme())
  const mobileNavOpen = ref(false)
  const sidebarCollapsed = ref(getInitialSidebarState())
  const toasts = ref<ToastItem[]>([])

  const isDarkMode = computed(() => themeMode.value === "dark")

  function applyTheme() {
    document.documentElement.dataset.theme = themeMode.value
    document.documentElement.style.colorScheme = themeMode.value
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(themeMode.value === "dark" ? "light" : "dark")
  }

  function openMobileNav() {
    mobileNavOpen.value = true
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  function setSidebarCollapsed(value: boolean) {
    sidebarCollapsed.value = value
    localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "1" : "0")
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  function pushToast(message: string, tone: ToastTone = "info") {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    toasts.value.push({ id, message, tone })

    window.setTimeout(() => {
      removeToast(id)
    }, 3200)
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function hydrateTheme() {
    applyTheme()
  }

  watch(themeMode, () => {
    applyTheme()
  })

  return {
    themeMode,
    isDarkMode,
    mobileNavOpen,
    sidebarCollapsed,
    toasts,
    setTheme,
    toggleTheme,
    openMobileNav,
    closeMobileNav,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    pushToast,
    removeToast,
    hydrateTheme,
  }
})
