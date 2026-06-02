import { getApiBaseUrl } from "@/lib/api-config"

const STALE_HOSTS = new Set(["localhost", "127.0.0.1"])

/**
 * Converte URLs absolutas com host de dev (localhost) em caminho relativo /storage/...
 */
function rewriteStaleAbsoluteUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url
  }

  try {
    const parsed = new URL(url)
    if (STALE_HOSTS.has(parsed.hostname)) {
      return parsed.pathname + parsed.search
    }
  } catch {
    // mantém URL original se não for parseável
  }

  return url
}

/**
 * Normaliza URLs de imagens vindas da API.
 * Aceita URLs absolutas, relativas ou apenas nomes de arquivos.
 */
export function resolveImageUrl(image?: string | null): string | null {
  if (!image) {
    return null
  }

  let trimmed = image.trim()
  if (trimmed === "") {
    return null
  }

  trimmed = rewriteStaleAbsoluteUrl(trimmed)

  if (trimmed.startsWith("data:")) {
    return trimmed
  }

  const apiBase = getApiBaseUrl()

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  if (trimmed.startsWith("/storage/") || trimmed.startsWith("/")) {
    return apiBase ? `${apiBase}${trimmed}` : trimmed
  }

  if (!apiBase) {
    return trimmed.startsWith("storage/") ? `/${trimmed}` : `/storage/${trimmed}`
  }

  const sanitized = trimmed.replace(/^\/+/, "")

  if (sanitized.startsWith("storage/")) {
    return `${apiBase}/${sanitized}`
  }

  return `${apiBase}/storage/${sanitized}`
}
