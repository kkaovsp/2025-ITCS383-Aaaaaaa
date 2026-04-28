const encoder = new TextEncoder()
const passwordPrefix = "edge-pbkdf2-sha256"
const passwordIterations = 100_000

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return bytesToBase64Url(new Uint8Array(signature))
}

function jwtSecret(): string {
  const secret = Deno.env.get("JWT_SECRET")
  if (!secret) throw new Error("Missing JWT_SECRET")
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: passwordIterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )
  return [
    passwordPrefix,
    String(passwordIterations),
    bytesToBase64Url(salt),
    bytesToBase64Url(new Uint8Array(bits)),
  ].join("$")
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [prefix, iterationsRaw, saltRaw, hashRaw] = storedHash.split("$")
  if (prefix !== passwordPrefix || !iterationsRaw || !saltRaw || !hashRaw) return false

  const iterations = Number(iterationsRaw)
  if (!Number.isInteger(iterations) || iterations < 1) return false

  const salt = base64UrlToBytes(saltRaw)
  const expected = base64UrlToBytes(hashRaw)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    expected.length * 8,
  )
  const actual = new Uint8Array(bits)
  if (actual.length !== expected.length) return false

  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

export async function createAccessToken(payload: Record<string, unknown>): Promise<string> {
  const header = bytesToBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })))
  const now = Math.floor(Date.now() / 1000)
  const body = bytesToBase64Url(encoder.encode(JSON.stringify({ ...payload, exp: now + 60 * 60 * 24 })))
  const data = `${header}.${body}`
  const signature = await hmacSha256(jwtSecret(), data)
  return `${data}.${signature}`
}

export async function verifyAccessToken(token: string): Promise<Record<string, unknown> | null> {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  const expected = await hmacSha256(jwtSecret(), `${header}.${body}`)
  if (expected !== signature) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as Record<string, unknown>
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function tokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization")
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim()

  const cookie = request.headers.get("cookie")
  if (!cookie) return null
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("access_token="))
  return match ? decodeURIComponent(match.slice("access_token=".length)) : null
}
