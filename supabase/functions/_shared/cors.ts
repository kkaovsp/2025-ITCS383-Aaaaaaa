const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
]

function allowedOrigins(): string[] {
  const raw = Deno.env.get("CORS_ORIGINS")
  if (!raw) return defaultOrigins
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean)
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin")
  const allowed = allowedOrigins()
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] ?? "*"

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  }
}

export function handleOptions(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
