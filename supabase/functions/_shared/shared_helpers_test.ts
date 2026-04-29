// Shared helpers tests — pure functions with no server dependencies.
import { jsonResponse, errorResponse } from "./json.ts"
import { corsHeaders, handleOptions } from "./cors.ts"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

Deno.test("jsonResponse sets correct status and headers", async () => {
  const mockReq = new Request("http://localhost/")
  const okResp = jsonResponse(mockReq, { msg: "ok" })
  assert(okResp.status === 200, "default status is 200")
  assert(okResp.headers.get("content-type")?.includes("json"), "sets content-type json")
  const okBody = await okResp.json()
  assert(okBody.msg === "ok", "body is correct")
})

Deno.test("jsonResponse accepts custom status and extra headers", async () => {
  const mockReq = new Request("http://localhost/")
  const createdResp = jsonResponse(mockReq, { id: "123" }, 201)
  assert(createdResp.status === 201, "custom status 201")
  const extraResp = jsonResponse(mockReq, { x: 1 }, 200, { "X-Custom": "value" })
  assert(extraResp.headers.get("X-Custom") === "value", "extra headers merged")
})

Deno.test("errorResponse returns correct error structure", async () => {
  const mockReq = new Request("http://localhost/")
  const err400 = errorResponse(mockReq, "Bad request", 400)
  assert(err400.status === 400, "error status 400")
  const errBody = await err400.json()
  assert(errBody.error === "Bad request", "error body has message")
  const errDefault = errorResponse(mockReq, "Server error")
  assert(errDefault.status === 400, "default error status is 400")
})

Deno.test("handleOptions returns null for non-OPTIONS requests", () => {
  const mockReq = new Request("http://localhost/")
  const nullResp = handleOptions(mockReq)
  assert(nullResp === null, "non-OPTIONS returns null")
})

Deno.test("handleOptions handles CORS preflight", () => {
  const mockReq = new Request("http://localhost/", { method: "OPTIONS" })
  const optionsResp = handleOptions(mockReq)
  assert(optionsResp !== null, "OPTIONS returns a response")
  assert(optionsResp!.status === 204, "OPTIONS returns 204")
  assert(optionsResp!.headers.get("access-control-allow-methods") !== undefined, "OPTIONS has CORS headers")
})
Deno.test("corsHeaders uses configured allowed origin", () => {
  const original = Deno.env.get("CORS_ORIGINS")
  Deno.env.set("CORS_ORIGINS", "https://one.example, https://two.example")
  const respHeaders = corsHeaders(new Request("http://localhost/", { headers: { origin: "https://two.example" } }))
  assert(respHeaders["Access-Control-Allow-Origin"] === "https://two.example", "configured origin allowed")
  if (original) Deno.env.set("CORS_ORIGINS", original)
  else Deno.env.delete("CORS_ORIGINS")
})

Deno.test("corsHeaders falls back when origin is not allowed", () => {
  const original = Deno.env.get("CORS_ORIGINS")
  Deno.env.set("CORS_ORIGINS", "https://one.example")
  const respHeaders = corsHeaders(new Request("http://localhost/", { headers: { origin: "https://bad.example" } }))
  assert(respHeaders["Access-Control-Allow-Origin"] === "https://one.example", "falls back to first allowed origin")
  if (original) Deno.env.set("CORS_ORIGINS", original)
  else Deno.env.delete("CORS_ORIGINS")
})
