import { createRouter, createWebHistory } from "vue-router"

import { tokenStorage } from "@/services/api"
import AuditLogsView from "@/views/AuditLogsView.vue"
import AuthView from "@/views/AuthView.vue"
import CategoriesView from "@/views/CategoriesView.vue"
import DashboardView from "@/views/DashboardView.vue"
import InstallmentsView from "@/views/InstallmentsView.vue"
import PaymentSourcesView from "@/views/PaymentSourcesView.vue"
import RecurringRulesView from "@/views/RecurringRulesView.vue"
import TransactionsView from "@/views/TransactionsView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/auth", name: "auth", component: AuthView, meta: { guestOnly: true } },
    { path: "/dashboard", name: "dashboard", component: DashboardView, meta: { requiresAuth: true } },
    { path: "/transactions", name: "transactions", component: TransactionsView, meta: { requiresAuth: true } },
    { path: "/categories", name: "categories", component: CategoriesView, meta: { requiresAuth: true } },
    { path: "/payment-sources", name: "payment-sources", component: PaymentSourcesView, meta: { requiresAuth: true } },
    { path: "/installments", name: "installments", component: InstallmentsView, meta: { requiresAuth: true } },
    { path: "/recurring-rules", name: "recurring-rules", component: RecurringRulesView, meta: { requiresAuth: true } },
    { path: "/audit-logs", name: "audit-logs", component: AuditLogsView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const hasToken = Boolean(tokenStorage.get())

  if (to.meta.requiresAuth && !hasToken) {
    return { name: "auth" }
  }

  if (to.meta.guestOnly && hasToken) {
    return { name: "dashboard" }
  }

  return true
})

export default router
