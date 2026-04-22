import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"

type ThemeMode = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "cash-guard-theme"

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const useUiStore = defineStore("ui", () => {
  const themeMode = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system")
  const mobileNavOpen = ref(false)

  const resolvedTheme = computed<ResolvedTheme>(() => {
    return themeMode.value === "system" ? getSystemTheme() : themeMode.value
  })

  function applyTheme() {
    document.documentElement.dataset.theme = resolvedTheme.value
    document.documentElement.style.colorScheme = resolvedTheme.value
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme()
  }

  function cycleTheme() {
    if (themeMode.value === "system") {
      setTheme("light")
      return
    }

    if (themeMode.value === "light") {
      setTheme("dark")
      return
    }

    setTheme("system")
  }

  function openMobileNav() {
    mobileNavOpen.value = true
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  function hydrateTheme() {
    applyTheme()

    if (typeof window === "undefined") {
      return
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (themeMode.value === "system") {
        applyTheme()
      }
    }

    media.addEventListener("change", handleChange)
  }

  watch(resolvedTheme, () => {
    applyTheme()
  })

  return {
    themeMode,
    resolvedTheme,
    mobileNavOpen,
    setTheme,
    cycleTheme,
    openMobileNav,
    closeMobileNav,
    hydrateTheme,
  }
})
