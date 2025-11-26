"use client"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

/**
 * Normaliza URLs de imagens vindas da API.
 * Aceita URLs absolutos, relativos ou apenas nomes de arquivos.
 */
export function resolveImageUrl(image?: string | null): string | null {
  if (!image) {
    return null
  }

  const trimmed = image.trim()
  if (trimmed === "") {
    return null
  }

  // Já é uma URL absoluta ou data URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed
  }

  if (!API_BASE_URL) {
    return trimmed
  }

  const sanitized = trimmed.replace(/^\/+/, "")

  // Se já aponta para storage/, apenas prefixar domínio
  if (sanitized.startsWith("storage/")) {
    return `${API_BASE_URL}/${sanitized}`
  }

  // Caminho relativo: assumir pasta storage por padrão
  return `${API_BASE_URL}/storage/${sanitized}`
}


