import { handleOptions } from "../_shared/cors.ts"
import { createAccessToken, hashPassword, tokenFromRequest, verifyAccessToken, verifyPassword } from "../_shared/auth.ts"
import { createServerClient } from "../_shared/supabaseClient.ts"
import { errorResponse, jsonResponse } from "../_shared/json.ts"

type UserRow = {
  id: string
  username: string
  password: string
  name: string | null
  contact_info: string | null
  role: string | null
  created_at: string | null
}

const roleAliases: Record<string, string> = {
  general: "GENERAL_USER",
  general_user: "GENERAL_USER",
  merchant: "MERCHANT",
  booth_manager: "BOOTH_MANAGER",
  boothmanager: "BOOTH_MANAGER",
}

function apiPath(request: Request): string {
  const url = new URL(request.url)
  let path = url.pathname
  path = path.replace(/^\/functions\/v1\/api/, "")
  path = path.replace(/^\/api/, "")
  return path || "/"
}

function normalizeRole(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "GENERAL_USER"
  const key = value.trim().toLowerCase()
  return roleAliases[key] ?? value.trim().toUpperCase()
}

function isValidCitizenId(value: unknown): boolean {
  return typeof value === "string" && /^\d{13}$/.test(value)
}

async function requestBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    return Object.fromEntries(form.entries())
  }
  if (contentType.includes("application/json")) return await request.json()
  const text = await request.text()
  if (!text) return {}
  return Object.fromEntries(new URLSearchParams(text).entries())
}

async function currentUser(request: Request): Promise<UserRow | null> {
  const token = tokenFromRequest(request)
  if (!token) return null
  const payload = await verifyAccessToken(token)
  const userId = typeof payload?.sub === "string" ? payload.sub : null
  if (!userId) return null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("users")
    .select("id,username,password,name,contact_info,role,created_at")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null
  return data as UserRow
}

function userSummary(user: UserRow) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  }
}

async function register(request: Request): Promise<Response> {
  const body = await requestBody(request)
  const username = typeof body.username === "string" ? body.username.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const name = typeof body.name === "string" ? body.name : ""
  const contactInfo = typeof body.contact_info === "string" ? body.contact_info : ""

  if (!username || !password || !name) return errorResponse(request, "Missing required registration fields", 400)

  const supabase = createServerClient()
  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (existingError) return errorResponse(request, existingError.message, 500)
  if (existing) return errorResponse(request, "Username already exists", 400)

  const role = normalizeRole(body.role)
  const userId = crypto.randomUUID()
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    username,
    password: await hashPassword(password),
    name,
    contact_info: contactInfo,
    role,
    created_at: new Date().toISOString(),
  })

  if (userError) return errorResponse(request, userError.message, 500)

  const hasMerchantInfo = body.citizen_id || body.seller_information || body.product_description || role === "MERCHANT"
  if (hasMerchantInfo) {
    const merchantId = crypto.randomUUID()
    const { error: merchantError } = await supabase.from("merchants").insert({
      merchant_id: merchantId,
      user_id: userId,
      citizen_id: typeof body.citizen_id === "string" ? body.citizen_id : null,
      seller_information: typeof body.seller_information === "string" ? body.seller_information : null,
      product_description: typeof body.product_description === "string" ? body.product_description : null,
      approval_status: "PENDING",
      citizen_valid: isValidCitizenId(body.citizen_id) ? 1 : 0,
    })

    if (merchantError) return errorResponse(request, merchantError.message, 500)

    const { data: managers } = await supabase
      .from("users")
      .select("id")
      .eq("role", "BOOTH_MANAGER")

    if (managers?.length) {
      await supabase.from("notifications").insert(managers.map((manager) => ({
        notification_id: crypto.randomUUID(),
        user_id: manager.id,
        title: "New merchant registration",
        message: `Merchant ${username} registered and awaits approval`,
        type: "MERCHANT_APPROVAL",
        reference_id: merchantId,
        is_read: false,
        created_at: new Date().toISOString(),
      })))
    }
  }

  return jsonResponse(request, { msg: "registration successful" }, 201)
}

async function login(request: Request): Promise<Response> {
  const body = await requestBody(request)
  const username = typeof body.username === "string" ? body.username : ""
  const password = typeof body.password === "string" ? body.password : ""

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("users")
    .select("id,username,password,name,contact_info,role,created_at")
    .eq("username", username)
    .maybeSingle()

  if (error) return errorResponse(request, error.message, 500)
  const user = data as UserRow | null
  if (!user || !(await verifyPassword(password, user.password))) {
    return errorResponse(request, "Invalid credentials", 401)
  }

  const token = await createAccessToken({ sub: user.id, role: user.role })
  const secure = Deno.env.get("ENVIRONMENT") === "production" ? "; Secure" : ""
  return jsonResponse(
    request,
    { access_token: token, token_type: "bearer" },
    200,
    { "Set-Cookie": `access_token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}` },
  )
}

async function authMe(request: Request): Promise<Response> {
  const user = await currentUser(request)
  if (!user) return errorResponse(request, "Not authenticated", 401)
  return jsonResponse(request, userSummary(user))
}

async function usersMe(request: Request): Promise<Response> {
  const user = await currentUser(request)
  if (!user) return errorResponse(request, "Not authenticated", 401)

  const supabase = createServerClient()
  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("merchant_id,approval_status,seller_information,product_description,citizen_valid")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) return errorResponse(request, error.message, 500)
  return jsonResponse(request, {
    id: user.id,
    username: user.username,
    name: user.name,
    contact_info: user.contact_info,
    role: user.role,
    created_at: user.created_at,
    merchant_id: merchant?.merchant_id ?? null,
    approval_status: merchant?.approval_status ?? null,
    seller_information: merchant?.seller_information ?? null,
    product_description: merchant?.product_description ?? null,
    citizen_valid: merchant?.citizen_valid ?? null,
  })
}

async function updateProfile(request: Request): Promise<Response> {
  const user = await currentUser(request)
  if (!user) return errorResponse(request, "Not authenticated", 401)

  const body = await requestBody(request)
  const updates: Record<string, unknown> = {}
  if ("name" in body) updates.name = body.name
  if ("contact_info" in body) updates.contact_info = body.contact_info

  if (Object.keys(updates).length) {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id,username,password,name,contact_info,role,created_at")
      .single()
    if (error) return errorResponse(request, error.message, 500)
    return jsonResponse(request, {
      id: data.id,
      username: data.username,
      name: data.name,
      contact_info: data.contact_info,
      role: data.role,
    })
  }

  return jsonResponse(request, {
    id: user.id,
    username: user.username,
    name: user.name,
    contact_info: user.contact_info,
    role: user.role,
  })
}

async function updateSeller(request: Request): Promise<Response> {
  const user = await currentUser(request)
  if (!user) return errorResponse(request, "Not authenticated", 401)

  const body = await requestBody(request)
  const sellerInformation = typeof body.seller_information === "string" ? body.seller_information : null
  const productDescription = typeof body.product_description === "string" ? body.product_description : null
  const supabase = createServerClient()

  const { data: existing, error: existingError } = await supabase
    .from("merchants")
    .select("merchant_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingError) return errorResponse(request, existingError.message, 500)

  if (existing?.merchant_id) {
    const { error } = await supabase
      .from("merchants")
      .update({ seller_information: sellerInformation, product_description: productDescription })
      .eq("merchant_id", existing.merchant_id)
    if (error) return errorResponse(request, error.message, 500)
  } else {
    const { error } = await supabase.from("merchants").insert({
      merchant_id: crypto.randomUUID(),
      user_id: user.id,
      seller_information: sellerInformation,
      product_description: productDescription,
      approval_status: "PENDING",
      citizen_valid: 0,
    })
    if (error) return errorResponse(request, error.message, 500)
  }

  return usersMe(request)
}

async function events(request: Request): Promise<Response> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("event_id,name,description,location,start_date,end_date,created_by,created_at")
    .order("start_date", { ascending: true })

  if (error) return errorResponse(request, error.message, 500)
  return jsonResponse(request, data ?? [])
}

async function eventBooths(request: Request, eventId: string): Promise<Response> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("booths")
    .select("booth_id,event_id,booth_number,size,price,location,type,classification,duration_type,electricity,water_supply,outlets,status")
    .eq("event_id", eventId)
    .order("booth_number", { ascending: true })

  if (error) return errorResponse(request, error.message, 500)
  return jsonResponse(request, data ?? [])
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  const method = request.method
  const path = apiPath(request)

  try {
    if (method === "GET" && (path === "/" || path === "/health")) return jsonResponse(request, { status: "ok" })
    if (method === "POST" && path === "/auth/register") return await register(request)
    if (method === "POST" && path === "/auth/login") return await login(request)
    if (method === "POST" && path === "/auth/logout") {
      return jsonResponse(request, { msg: "logged out" }, 200, { "Set-Cookie": "access_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" })
    }
    if (method === "GET" && path === "/auth/me") return await authMe(request)
    if (method === "GET" && path === "/users/me") return await usersMe(request)
    if (method === "PATCH" && path === "/users/me") return await updateProfile(request)
    if (method === "PATCH" && path === "/users/me/seller") return await updateSeller(request)
    if (method === "GET" && path === "/events") return await events(request)

    const boothsMatch = path.match(/^\/events\/([^/]+)\/booths$/)
    if (method === "GET" && boothsMatch) return await eventBooths(request, decodeURIComponent(boothsMatch[1]))

    return errorResponse(request, "Not found", 404)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    return errorResponse(request, message, 500)
  }
})
