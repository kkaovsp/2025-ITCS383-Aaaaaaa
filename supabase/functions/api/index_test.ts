// Test helpers for api/index.ts — pure standalone functions
import { apiPath, normalizeRole, isValidCitizenId, csvEscape } from "./helpers.ts"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

Deno.test("apiPath strips /functions/v1/api prefix", () => {
  assert(apiPath(new Request("http://localhost:8000/functions/v1/api/health")) === "/health")
})

Deno.test("apiPath strips /api prefix", () => {
  assert(apiPath(new Request("http://localhost:8000/api/events")) === "/events")
})

Deno.test("apiPath returns /events", () => {
  assert(apiPath(new Request("http://localhost:8000/events")) === "/events")
})

Deno.test("apiPath returns /", () => {
  assert(apiPath(new Request("http://localhost:8000/")) === "/")
})

Deno.test("normalizeRole maps role aliases", () => {
  assert(normalizeRole("general") === "GENERAL_USER")
  assert(normalizeRole("general_user") === "GENERAL_USER")
  assert(normalizeRole("merchant") === "MERCHANT")
  assert(normalizeRole("booth_manager") === "BOOTH_MANAGER")
  assert(normalizeRole("boothmanager") === "BOOTH_MANAGER")
  assert(normalizeRole("MERCHANT") === "MERCHANT")
})

Deno.test("normalizeRole handles edge cases", () => {
  assert(normalizeRole("") === "GENERAL_USER")
  assert(normalizeRole(null) === "GENERAL_USER")
  assert(normalizeRole(undefined) === "GENERAL_USER")
  assert(normalizeRole("  booth_manager  ") === "BOOTH_MANAGER")
})

Deno.test("isValidCitizenId validates 13-digit strings", () => {
  assert(isValidCitizenId("1234567890123") === true)
  assert(isValidCitizenId("1234567890123") === true)
})

Deno.test("isValidCitizenId rejects invalid input", () => {
  assert(isValidCitizenId(1234567890123 as any) === false)
  assert(isValidCitizenId("123456789012") === false)
  assert(isValidCitizenId("12345678901234") === false)
  assert(isValidCitizenId("123456789012a") === false)
  assert(isValidCitizenId("") === false)
  assert(isValidCitizenId(null) === false)
})

Deno.test("csvEscape handles null/undefined", () => {
  assert(csvEscape(null) === "")
  assert(csvEscape(undefined) === "")
})

Deno.test("csvEscape passes simple strings", () => {
  assert(csvEscape("hello") === "hello")
  assert(csvEscape(123) === "123")
  assert(csvEscape(0) === "0")
  assert(csvEscape(true) === "true")
})

Deno.test("csvEscape quotes special characters", () => {
  assert(csvEscape("hello,world") === '"hello,world"')
  assert(csvEscape('hello"world') === '"hello""world"')
  assert(csvEscape("hello\nworld") === '"hello\nworld"')
  assert(csvEscape("hello\rworld") === '"hello\rworld"')
})