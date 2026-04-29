// Auth helper tests — test the JWT/password helpers directly without Supabase.
import { hashPassword, verifyPassword, createAccessToken, verifyAccessToken, tokenFromRequest } from "../_shared/auth.ts"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
  console.log(`  PASS: ${message}`)
}

Deno.test("hashPassword produces a fixable format", async () => {
  const hash = await hashPassword("testpassword123")
  assert(hash.startsWith("edge-pbkdf2-sha256$"), `hash starts with prefix: ${hash.substring(0, 30)}...`)
  const parts = hash.split("$")
  assert(parts.length === 4, `hash has 4 parts: ${parts.length}`)
  assert(parts[1] === "100000", "default iterations is 100000")
})

Deno.test("verifyPassword accepts correct password", async () => {
  const hash = await hashPassword("correctpassword")
  const ok = await verifyPassword("correctpassword", hash)
  assert(ok === true, "correct password verified")
})

Deno.test("verifyPassword rejects wrong password", async () => {
  const hash = await hashPassword("correctpassword")
  const ok = await verifyPassword("wrongpassword", hash)
  assert(ok === false, "wrong password rejected")
})

Deno.test("verifyPassword rejects invalid hash format", async () => {
  assert(await verifyPassword("pw", "not-a-hash") === false, "invalid format rejected")
  assert(await verifyPassword("pw", "") === false, "empty hash rejected")
  assert(await verifyPassword("pw", "edge-pbkdf2-sha256$abc$def") === false, "missing parts rejected")
})

Deno.test("createAccessToken and verifyAccessToken round-trip", async () => {
  // Mock jwtSecret for testing
  const originalEnv = Deno.env.get("JWT_SECRET")
  Deno.env.set("JWT_SECRET", "test-secret-key-for-testing-only-32chars!")

  const token = await createAccessToken({ sub: "user-123", role: "BOOTH_MANAGER" })
  assert(typeof token === "string", "token is a string")
  assert(token.split(".").length === 3, "token has 3 parts")

  const payload = await verifyAccessToken(token)
  assert(payload !== null, "token verified")
  assert(payload?.sub === "user-123", "sub claim correct")
  assert(payload?.role === "BOOTH_MANAGER", "role claim correct")

  Deno.env.set("JWT_SECRET", originalEnv ?? "")
})

Deno.test("verifyAccessToken rejects tampered token", async () => {
  const originalEnv = Deno.env.get("JWT_SECRET")
  Deno.env.set("JWT_SECRET", "test-secret-key-for-testing-only-32chars!")

  const token = await createAccessToken({ sub: "user-123" })
  const tampered = token.slice(0, -5) + "xxxxx"
  const payload = await verifyAccessToken(tampered)
  assert(payload === null, "tampered token rejected")

  Deno.env.set("JWT_SECRET", originalEnv ?? "")
})

Deno.test("verifyAccessToken rejects expired token", async () => {
  const originalEnv = Deno.env.get("JWT_SECRET")
  Deno.env.set("JWT_SECRET", "test-secret-key-for-testing-only-32chars!")

  // Manually create an expired token
  const encoder = new TextEncoder()
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "")
  const past = Math.floor(Date.now() / 1000) - 3600
  const body = btoa(JSON.stringify({ sub: "user", exp: past })).replace(/=/g, "")
  const data = `${header}.${body}`
  // Sign with the test secret
  const key = await crypto.subtle.importKey("raw", encoder.encode("test-secret-key-for-testing-only-32chars!"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const expiredToken = `${data}.${sigB64}`

  const payload = await verifyAccessToken(expiredToken)
  assert(payload === null, "expired token rejected")

  Deno.env.set("JWT_SECRET", originalEnv ?? "")
})

console.log("\nAuth helper tests complete")