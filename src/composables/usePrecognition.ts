import { reactive, ref } from "vue"

import { ApiValidationError, precognize, type ValidationErrors } from "@/services/api"

interface PrecognitionRequest {
  method: "POST" | "PUT" | "PATCH"
  path: string
  payload: Record<string, unknown>
}

export function usePrecognition(makeRequest: () => PrecognitionRequest) {
  const errors = reactive<Record<string, string>>({})
  const validating = ref(false)

  function clear(field?: string) {
    if (field) {
      delete errors[field]
      return
    }

    for (const key of Object.keys(errors)) {
      delete errors[key]
    }
  }

  function applyErrors(validationErrors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      delete errors[key]
    }

    for (const [field, messages] of Object.entries(validationErrors)) {
      if (messages[0]) {
        errors[field] = messages[0]
      }
    }
  }

  async function validate(field: string, validateOnly: string | string[] = field) {
    const requestedFields = Array.isArray(validateOnly) ? validateOnly : [validateOnly]
    validating.value = true

    try {
      const request = makeRequest()
      const validationErrors = await precognize(request.method, request.path, request.payload, requestedFields)
      clear(field)

      for (const [errorField, messages] of Object.entries(validationErrors)) {
        if (messages[0]) {
          errors[errorField] = messages[0]
        }
      }
    } catch (error) {
      if (!capture(error)) {
        throw error
      }
    } finally {
      validating.value = false
    }
  }

  function capture(error: unknown) {
    if (error instanceof ApiValidationError) {
      applyErrors(error.errors)
      return true
    }

    return false
  }

  return {
    errors,
    validating,
    validate,
    capture,
    clear,
  }
}
