export function sanitizeDecimalInput(value: string): string {
  const normalized = value.replace(/[^\d,.]/g, "").replace(/\./g, ",")
  const [integer = "", decimal = ""] = normalized.split(",")
  const sanitizedInteger = integer.replace(/^0+(?=\d)/, "")
  const sanitizedDecimal = decimal.replace(/[,.]/g, "").slice(0, 2)

  if (normalized.includes(",")) {
    return `${sanitizedInteger || "0"},${sanitizedDecimal}`
  }

  return sanitizedInteger
}

export function allowDecimalBeforeInput(event: InputEvent): void {
  if (event.inputType.startsWith("delete") || event.inputType.startsWith("history")) {
    return
  }

  if (event.data && !/^[\d,.]+$/.test(event.data)) {
    event.preventDefault()
  }
}

export function sanitizeDecimalInputEvent(event: Event): string {
  const input = event.target as HTMLInputElement | null

  if (!input) {
    return ""
  }

  const sanitized = sanitizeDecimalInput(input.value)
  input.value = sanitized

  return sanitized
}

export function sanitizeIntegerInput(value: string, min = 1, max = 120): string {
  const digits = value.replace(/\D/g, "")
  const parsed = Number.parseInt(digits || String(min), 10)
  const clamped = Math.min(Math.max(parsed, min), max)

  return String(clamped)
}

export function sanitizeFreeText(value: string, maxLength: number): string {
  return value.replace(/[\p{C}<>]/gu, "").slice(0, maxLength)
}

export function sanitizeSearchText(value: string, maxLength = 120): string {
  return sanitizeFreeText(value, maxLength)
}
