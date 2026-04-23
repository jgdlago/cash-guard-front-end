import type {
  AuthResponse,
  Category,
  DashboardResponse,
  InstallmentPlan,
  PaginatedResponse,
  PaymentSource,
  Transaction,
  User,
} from "@/types/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost/api/v1"
const TOKEN_KEY = "cash-guard.token"

function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init)
  headers.set("Accept", "application/json")

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return headers
}

function toQueryString(params?: Record<string, string | number | boolean | null | undefined>) {
  if (!params) {
    return ""
  }

  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    search.set(key, String(value))
  }

  const serialized = search.toString()
  return serialized ? `?${serialized}` : ""
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init?.headers),
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json()) as { data?: T; message?: string }

  if (!response.ok) {
    throw new Error(payload.message ?? "Falha na comunicação com a API.")
  }

  return (payload.data ?? payload) as T
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api = {
  register: (payload: Record<string, unknown>) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: Record<string, unknown>) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/auth/me"),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  dashboard: (month?: string) => request<DashboardResponse>(`/dashboard${month ? `?month=${month}` : ""}`),
  categories: (params?: Record<string, string | number | boolean | null | undefined>) =>
    request<Category[]>(`/categories${toQueryString(params)}`),
  createCategory: (payload: Record<string, unknown>) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(payload) }),
  paymentSources: (params?: Record<string, string | number | boolean | null | undefined>) =>
    request<PaymentSource[]>(`/payment-sources${toQueryString(params)}`),
  createPaymentSource: (payload: Record<string, unknown>) =>
    request<PaymentSource>("/payment-sources", { method: "POST", body: JSON.stringify(payload) }),
  transactions: (params?: Record<string, string | number | boolean | null | undefined>) =>
    request<PaginatedResponse<Transaction>>(`/transactions${toQueryString(params)}`),
  createTransaction: (payload: Record<string, unknown>) =>
    request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  updateTransaction: (id: number, payload: Record<string, unknown>) =>
    request<Transaction>(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  cancelTransaction: (id: number) => request<void>(`/transactions/${id}`, { method: "DELETE" }),
  installmentPlans: (params?: Record<string, string | number | boolean | null | undefined>) =>
    request<PaginatedResponse<InstallmentPlan>>(`/installment-plans${toQueryString(params)}`),
  createInstallmentPlan: (payload: Record<string, unknown>) =>
    request<InstallmentPlan>("/installment-plans", { method: "POST", body: JSON.stringify(payload) }),
  cancelInstallmentPlan: (id: number) => request<void>(`/installment-plans/${id}`, { method: "DELETE" }),
}
