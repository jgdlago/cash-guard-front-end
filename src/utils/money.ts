export function normalizeMoneyInput(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  if (trimmed.includes(",") && trimmed.includes(".")) {
    return trimmed.replace(/\./g, "").replace(",", ".")
  }

  return trimmed.replace(",", ".")
}

export function formatMoneyFromCents(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value / 100)
}
