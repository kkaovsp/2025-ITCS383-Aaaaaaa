import { corsHeaders } from "./cors.ts"

export function jsonResponse(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json",
    },
  })
}

export function errorResponse(request: Request, message: string, status = 400): Response {
  return jsonResponse(request, { error: message }, status)
}
