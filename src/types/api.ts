export type TransactionType = "income" | "expense"
export type TransactionStatus = "draft" | "pending" | "posted" | "cancelled"
export type CategoryDirection = "income" | "expense" | "both"
export type PaymentSourceType =
  | "cash"
  | "bank_account"
  | "credit_card"
  | "debit_card"
  | "wallet"
  | "other"
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly"

export interface User {
  id: number
  name: string
  email: string
  locale: string
  timezone: string
  currency_code: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Category {
  id: number
  kind: "system" | "custom"
  direction: CategoryDirection
  name: string
  slug: string
  color: string | null
  icon: string | null
  is_active: boolean
  display_order: number
  is_hidden: boolean
  display_order_override: number | null
}

export interface PaymentSource {
  id: number
  type: PaymentSourceType
  name: string
  currency_code: string
  parent_payment_source_id: number | null
  credit_limit_cents: number | null
  credit_limit: string | null
  statement_closing_day: number | null
  statement_due_day: number | null
  is_active: boolean
  display_order: number
}

export interface Transaction {
  id: number
  type: TransactionType
  status: TransactionStatus
  amount_cents: number
  amount: string
  currency_code: string
  transaction_date: string
  due_date: string | null
  description: string
  notes: string | null
  payment_source_id: number | null
  category_id: number | null
  installment_plan_id: number | null
  installment_number: number | null
  total_installments: number | null
}

export interface InstallmentPlan {
  id: number
  description: string
  total_installments: number
  total_amount_cents: number
  total_amount: string
  currency_code: string
  first_due_date: string
  payment_source_id: number | null
  category_id: number | null
  transactions: Transaction[]
}

export interface RecurringRule {
  id: number
  type: TransactionType
  frequency: RecurringFrequency
  status_on_generate: TransactionStatus
  amount_cents: number
  amount: string
  currency_code: string
  description: string
  notes: string | null
  starts_on: string
  next_run_on: string
  ends_on: string | null
  is_active: boolean
  payment_source_id: number | null
  category_id: number | null
  last_processed_at: string | null
  transactions_count?: number
}

export interface FinancialAuditLog {
  id: number
  user_id: number
  auditable_type: string | null
  auditable_id: number | null
  event: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  context: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface DashboardSummary {
  income_cents: number
  income: string
  expense_cents: number
  expense: string
  balance_cents: number
  balance: string
}

export interface DashboardExpenseByCategory {
  category_id: number | null
  category_name: string | null
  category_slug: string | null
  total_cents: number
  total: string
}

export interface DashboardResponse {
  month: string
  period: { from: string; to: string }
  summary: DashboardSummary
  expenses_by_category: DashboardExpenseByCategory[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: Record<string, unknown>
  meta?: PaginationMeta
}
