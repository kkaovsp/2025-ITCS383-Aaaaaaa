const roleAliases: Record<string, string> = {
  general: "GENERAL_USER",
  general_user: "GENERAL_USER",
  merchant: "MERCHANT",
  booth_manager: "BOOTH_MANAGER",
  boothmanager: "BOOTH_MANAGER",
}

export function apiPath(request: Request): string {
  const url = new URL(request.url)
  let path = url.pathname
  path = path.replace(/^\/functions\/v1\/api/, "")
  path = path.replace(/^\/api/, "")
  return path || "/"
}

export function normalizeRole(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "GENERAL_USER"
  const key = value.trim().toLowerCase()
  return roleAliases[key] ?? value.trim().toUpperCase()
}

export function isValidCitizenId(value: unknown): boolean {
  return typeof value === "string" && /^\d{13}$/.test(value)
}

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ""
  const text = String(value)
  if (text.includes('"') || text.includes(",") || text.includes("\n") || text.includes("\r")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}
