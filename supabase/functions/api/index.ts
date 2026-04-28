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

type MerchantRow = {
  merchant_id: string
  user_id: string
  approval_status: string | null
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

async function requireUser(request: Request): Promise<UserRow | Response> {
  const user = await currentUser(request)
  if (!user) return errorResponse(request, "Not authenticated", 401)
  return user
}

async function merchantForUser(userId: string): Promise<MerchantRow | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("merchants")
    .select("merchant_id,user_id,approval_status")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return null
  return data as MerchantRow
}

async function approvedMerchant(request: Request, user: UserRow): Promise<MerchantRow | Response> {
  if (user.role !== "MERCHANT") return errorResponse(request, "Only approved merchants can access reservations", 403)
  const merchant = await merchantForUser(user.id)
  if (!merchant || merchant.approval_status !== "APPROVED") {
    return errorResponse(request, "Only approved merchants can access reservations", 403)
  }
  return merchant
}

async function notifyUsers(userIds: string[], title: string, message: string, type: string, referenceId: string) {
  if (!userIds.length) return
  const supabase = createServerClient()
  await supabase.from("notifications").insert(userIds.map((userId) => ({
    notification_id: crypto.randomUUID(),
    user_id: userId,
    title,
    message,
    type,
    reference_id: referenceId,
    is_read: false,
    created_at: new Date().toISOString(),
  })))
}

async function boothManagerIds(): Promise<string[]> {
  const supabase = createServerClient()
  const { data } = await supabase.from("users").select("id").eq("role", "BOOTH_MANAGER")
  return data?.map((row) => row.id) ?? []
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

async function listReservations(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const user = userOrResponse
  const supabase = createServerClient()

  let query = supabase
    .from("reservations")
    .select("reservation_id,booth_id,merchant_id,reservation_type,status,created_at")
    .order("created_at", { ascending: false })

  if (user.role === "MERCHANT") {
    const merchantOrResponse = await approvedMerchant(request, user)
    if (merchantOrResponse instanceof Response) return merchantOrResponse
    query = query.eq("merchant_id", merchantOrResponse.merchant_id)
  } else if (user.role !== "BOOTH_MANAGER") {
    return errorResponse(request, "Only approved merchants can access reservations", 403)
  }

  const { data: reservations, error } = await query
  if (error) return errorResponse(request, error.message, 500)

  const rows = await Promise.all((reservations ?? []).map(async (reservation) => {
    const [{ data: booth }, { data: merchant }, { data: payments }] = await Promise.all([
      supabase.from("booths").select("booth_number,price").eq("booth_id", reservation.booth_id).maybeSingle(),
      supabase.from("merchants").select("merchant_id,user_id").eq("merchant_id", reservation.merchant_id).maybeSingle(),
      supabase.from("payments").select("payment_id,amount,method,payment_status,slip_url,created_at").eq("reservation_id", reservation.reservation_id).order("created_at", { ascending: false }).limit(1),
    ])
    const payment = payments?.[0]
    return {
      reservation_id: reservation.reservation_id,
      booth_id: reservation.booth_id,
      reservation_type: reservation.reservation_type,
      status: reservation.status,
      created_at: reservation.created_at,
      booth: { booth_number: booth?.booth_number ?? null, price: booth?.price ?? null },
      merchant: { merchant_id: merchant?.merchant_id ?? null, user_id: merchant?.user_id ?? null },
      payment: payment
        ? {
          payment_id: payment.payment_id,
          amount: payment.amount,
          method: payment.method,
          payment_status: payment.payment_status,
          slip_url: payment.slip_url,
          created_at: payment.created_at,
        }
        : { payment_id: null, amount: null, method: null, payment_status: null, slip_url: null, created_at: null },
    }
  }))

  return jsonResponse(request, rows)
}

async function createReservation(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const merchantOrResponse = await approvedMerchant(request, userOrResponse)
  if (merchantOrResponse instanceof Response) return merchantOrResponse

  const body = await requestBody(request)
  const boothId = typeof body.booth_id === "string" ? body.booth_id : ""
  const reservationType = typeof body.reservation_type === "string" ? body.reservation_type : "SHORT_TERM"
  if (!boothId) return errorResponse(request, "booth_id is required", 400)

  const supabase = createServerClient()
  const { data: existing, error: existingError } = await supabase
    .from("reservations")
    .select("reservation_id")
    .eq("booth_id", boothId)
    .neq("status", "CANCELLED")
    .limit(1)

  if (existingError) return errorResponse(request, existingError.message, 500)
  if (existing?.length) return errorResponse(request, "Booth already reserved", 400)

  const reservationId = crypto.randomUUID()
  const { error: reservationError } = await supabase.from("reservations").insert({
    reservation_id: reservationId,
    booth_id: boothId,
    merchant_id: merchantOrResponse.merchant_id,
    reservation_type: reservationType,
    status: "PENDING_PAYMENT",
    created_at: new Date().toISOString(),
  })
  if (reservationError) return errorResponse(request, reservationError.message, 500)

  await supabase.from("booths").update({ status: "RESERVED" }).eq("booth_id", boothId)
  await notifyUsers(await boothManagerIds(), "New reservation", `Reservation ${reservationId} for booth ${boothId}`, "RESERVATION", reservationId)

  return jsonResponse(request, { reservation_id: reservationId, status: "PENDING_PAYMENT" }, 201)
}

async function cancelReservation(request: Request, reservationId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const user = userOrResponse
  const supabase = createServerClient()
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("reservation_id,booth_id,merchant_id,status")
    .eq("reservation_id", reservationId)
    .maybeSingle()

  if (error) return errorResponse(request, error.message, 500)
  if (!reservation) return errorResponse(request, "Reservation not found", 404)
  if (reservation.status === "CONFIRMED") return errorResponse(request, "Cannot cancel a confirmed reservation", 400)

  if (user.role !== "BOOTH_MANAGER") {
    const merchantOrResponse = await approvedMerchant(request, user)
    if (merchantOrResponse instanceof Response) return merchantOrResponse
    if (merchantOrResponse.merchant_id !== reservation.merchant_id) return errorResponse(request, "Not allowed to cancel this reservation", 403)
  }

  const { data: payments } = await supabase.from("payments").select("payment_id,payment_status").eq("reservation_id", reservationId)
  if (payments?.some((payment) => payment.payment_status === "APPROVED")) {
    return errorResponse(request, "Cannot cancel reservation with approved payment", 400)
  }

  await supabase.from("payments").update({ payment_status: "REJECTED" }).eq("reservation_id", reservationId).eq("payment_status", "PENDING")
  await supabase.from("reservations").update({ status: "CANCELLED" }).eq("reservation_id", reservationId)
  await supabase.from("booths").update({ status: "AVAILABLE" }).eq("booth_id", reservation.booth_id)

  const { data: merchant } = await supabase.from("merchants").select("user_id").eq("merchant_id", reservation.merchant_id).maybeSingle()
  await notifyUsers([merchant?.user_id, ...await boothManagerIds()].filter(Boolean), "Reservation cancelled", `Reservation ${reservationId} was cancelled`, "RESERVATION", reservationId)

  return jsonResponse(request, { msg: "reservation cancelled", reservation_id: reservationId })
}

async function confirmReservation(request: Request, reservationId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  if (userOrResponse.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)

  const supabase = createServerClient()
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("reservation_id,booth_id")
    .eq("reservation_id", reservationId)
    .maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!reservation) return errorResponse(request, "Reservation not found", 404)

  await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("reservation_id", reservationId)
  await supabase.from("booths").update({ status: "OCCUPIED" }).eq("booth_id", reservation.booth_id)
  return jsonResponse(request, { msg: "reservation confirmed", reservation_id: reservationId })
}

async function listPayments(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const user = userOrResponse
  const supabase = createServerClient()

  if (user.role === "BOOTH_MANAGER") {
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false })
    if (error) return errorResponse(request, error.message, 500)
    return jsonResponse(request, data ?? [])
  }

  const merchant = await merchantForUser(user.id)
  if (!merchant) return jsonResponse(request, [])
  const { data: reservations } = await supabase.from("reservations").select("reservation_id").eq("merchant_id", merchant.merchant_id)
  const reservationIds = reservations?.map((reservation) => reservation.reservation_id) ?? []
  if (!reservationIds.length) return jsonResponse(request, [])

  const { data, error } = await supabase.from("payments").select("*").in("reservation_id", reservationIds).order("created_at", { ascending: false })
  if (error) return errorResponse(request, error.message, 500)
  return jsonResponse(request, data ?? [])
}

async function createPayment(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const user = userOrResponse
  const body = await requestBody(request)
  const reservationId = typeof body.reservation_id === "string" ? body.reservation_id : ""
  const amount = Number(body.amount)
  const method = typeof body.method === "string" ? body.method : ""
  if (!reservationId || !Number.isFinite(amount) || !method) return errorResponse(request, "Invalid payment request", 400)

  const supabase = createServerClient()
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("reservation_id,booth_id,merchant_id")
    .eq("reservation_id", reservationId)
    .maybeSingle()
  if (reservationError) return errorResponse(request, reservationError.message, 500)
  if (!reservation) return errorResponse(request, "Reservation not found", 404)

  const merchant = await merchantForUser(user.id)
  if (!merchant || merchant.merchant_id !== reservation.merchant_id) return errorResponse(request, "Not allowed to pay for this reservation", 403)

  const { data: booth } = await supabase.from("booths").select("price").eq("booth_id", reservation.booth_id).maybeSingle()
  if (!booth) return errorResponse(request, "Booth not found", 404)
  if (Number(booth.price) !== amount) return errorResponse(request, "Amount must equal full booth price", 400)

  const paymentId = crypto.randomUUID()
  const { error } = await supabase.from("payments").insert({
    payment_id: paymentId,
    reservation_id: reservationId,
    amount,
    method,
    payment_status: "PENDING",
    created_at: new Date().toISOString(),
  })
  if (error) return errorResponse(request, error.message, 500)

  await supabase.from("reservations").update({ status: "WAITING_FOR_APPROVAL" }).eq("reservation_id", reservationId)
  if (method !== "BANK_TRANSFER") {
    await notifyUsers(await boothManagerIds(), "Payment submitted", `Payment ${paymentId} for reservation ${reservationId} requires review`, "PAYMENT", paymentId)
  }

  return jsonResponse(request, { payment_id: paymentId, reservation_id: reservationId, payment_status: "PENDING" }, 201)
}

async function uploadSlip(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const url = new URL(request.url)
  const paymentId = url.searchParams.get("payment_id") ?? ""
  if (!paymentId) return errorResponse(request, "payment_id is required", 400)

  const supabase = createServerClient()
  const { data: payment, error } = await supabase
    .from("payments")
    .select("payment_id,reservation_id")
    .eq("payment_id", paymentId)
    .maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!payment) return errorResponse(request, "Payment not found", 404)

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return errorResponse(request, "Slip file is required", 400)

  // Storage migration is planned later. For now, keep a stable marker URL for approval checks and UI display.
  await supabase.from("payments").update({ slip_url: `/functions/v1/api/payments/${paymentId}/slip` }).eq("payment_id", paymentId)
  await notifyUsers(await boothManagerIds(), "Payment slip uploaded", `Slip uploaded for payment ${paymentId}`, "PAYMENT", paymentId)
  return jsonResponse(request, { msg: "slip uploaded" })
}

async function getPaymentSlip(request: Request, paymentId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const supabase = createServerClient()
  const { data: payment, error } = await supabase.from("payments").select("slip_url").eq("payment_id", paymentId).maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!payment?.slip_url) return errorResponse(request, "Slip file not found", 404)
  return jsonResponse(request, { payment_id: paymentId, slip_url: payment.slip_url, message: "Slip storage migration pending" })
}

async function approvePayment(request: Request, paymentId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  if (userOrResponse.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)

  const supabase = createServerClient()
  const { data: payment, error } = await supabase
    .from("payments")
    .select("payment_id,reservation_id,method,slip_url")
    .eq("payment_id", paymentId)
    .maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!payment) return errorResponse(request, "Payment not found", 404)
  if (payment.method === "BANK_TRANSFER" && !payment.slip_url) return errorResponse(request, "Bank transfer slip is required before approval", 400)

  const { data: reservation } = await supabase.from("reservations").select("reservation_id,booth_id,merchant_id").eq("reservation_id", payment.reservation_id).maybeSingle()
  await supabase.from("payments").update({ payment_status: "APPROVED" }).eq("payment_id", paymentId)
  if (reservation) {
    await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("reservation_id", reservation.reservation_id)
    await supabase.from("booths").update({ status: "OCCUPIED" }).eq("booth_id", reservation.booth_id)
    const { data: merchant } = await supabase.from("merchants").select("user_id").eq("merchant_id", reservation.merchant_id).maybeSingle()
    if (merchant?.user_id) await notifyUsers([merchant.user_id], "Payment approved", `Your payment ${paymentId} has been approved`, "PAYMENT", paymentId)
  }

  return jsonResponse(request, { payment_id: paymentId, reservation_id: payment.reservation_id, payment_status: "APPROVED" })
}

async function getMerchant(request: Request, merchantId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const user = userOrResponse
  const supabase = createServerClient()
  const { data: merchant, error } = await supabase.from("merchants").select("*").eq("merchant_id", merchantId).maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!merchant) return errorResponse(request, "Merchant not found", 404)
  if (user.role !== "BOOTH_MANAGER" && merchant.user_id !== user.id) return errorResponse(request, "Not allowed", 403)
  return jsonResponse(request, merchant)
}

async function listPendingMerchants(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  if (userOrResponse.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)

  const supabase = createServerClient()
  const { data: merchants, error } = await supabase.from("merchants").select("*").eq("approval_status", "PENDING")
  if (error) return errorResponse(request, error.message, 500)
  const rows = await Promise.all((merchants ?? []).map(async (merchant) => {
    const { data: user } = await supabase.from("users").select("username,name").eq("id", merchant.user_id).maybeSingle()
    return {
      merchant_id: merchant.merchant_id,
      user_id: merchant.user_id,
      username: user?.username ?? null,
      name: user?.name ?? null,
      citizen_id: merchant.citizen_id,
      citizen_valid: Boolean(merchant.citizen_valid),
      seller_information: merchant.seller_information,
      product_description: merchant.product_description,
      approval_status: merchant.approval_status,
    }
  }))
  return jsonResponse(request, rows)
}

async function listUsers(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  if (userOrResponse.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)

  const supabase = createServerClient()
  const { data: users, error } = await supabase.from("users").select("id,username,name,contact_info,role,created_at").neq("role", "BOOTH_MANAGER")
  if (error) return errorResponse(request, error.message, 500)
  const rows = await Promise.all((users ?? []).map(async (user) => {
    const { data: merchant } = await supabase.from("merchants").select("merchant_id,approval_status,seller_information,product_description,citizen_valid").eq("user_id", user.id).maybeSingle()
    return {
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
    }
  }))
  return jsonResponse(request, rows)
}

async function setMerchantStatus(request: Request, merchantId: string, statusValue: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const manager = userOrResponse
  if (manager.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)
  if (!["PENDING", "APPROVED", "REJECTED"].includes(statusValue)) return errorResponse(request, "Invalid status", 400)

  const supabase = createServerClient()
  const { data: merchant, error } = await supabase.from("merchants").select("merchant_id,user_id").eq("merchant_id", merchantId).maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!merchant) return errorResponse(request, "Merchant not found", 404)

  const { data: updated, error: updateError } = await supabase
    .from("merchants")
    .update({ approval_status: statusValue, approved_by: manager.id, approved_at: new Date().toISOString() })
    .eq("merchant_id", merchantId)
    .select("*")
    .single()
  if (updateError) return errorResponse(request, updateError.message, 500)

  await supabase.from("users").update({ role: statusValue === "APPROVED" ? "MERCHANT" : "GENERAL_USER" }).eq("id", merchant.user_id)
  await notifyUsers([merchant.user_id], "Merchant status updated", `Your merchant application status changed to ${statusValue}`, "MERCHANT_APPROVAL", merchantId)
  return jsonResponse(request, updated)
}

async function setUserMerchantStatus(request: Request, userId: string): Promise<Response> {
  const body = await requestBody(request)
  const statusValue = typeof body.status === "string" ? body.status : typeof body.status_value === "string" ? body.status_value : ""
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const manager = userOrResponse
  if (manager.role !== "BOOTH_MANAGER") return errorResponse(request, "Forbidden", 403)
  if (!["PENDING", "APPROVED", "REJECTED"].includes(statusValue)) return errorResponse(request, "Invalid status", 400)

  const supabase = createServerClient()
  const { data: targetUser, error: userError } = await supabase.from("users").select("id,username").eq("id", userId).maybeSingle()
  if (userError) return errorResponse(request, userError.message, 500)
  if (!targetUser) return errorResponse(request, "User not found", 404)

  let merchant = await merchantForUser(userId)
  if (!merchant) {
    const merchantId = crypto.randomUUID()
    const { data, error } = await supabase.from("merchants").insert({
      merchant_id: merchantId,
      user_id: userId,
      approval_status: "PENDING",
      citizen_valid: 0,
    }).select("merchant_id,user_id,approval_status").single()
    if (error) return errorResponse(request, error.message, 500)
    merchant = data as MerchantRow
  }

  const { data: updated, error: updateError } = await supabase
    .from("merchants")
    .update({ approval_status: statusValue, approved_by: manager.id, approved_at: new Date().toISOString() })
    .eq("merchant_id", merchant.merchant_id)
    .select("*")
    .single()
  if (updateError) return errorResponse(request, updateError.message, 500)

  const role = statusValue === "APPROVED" ? "MERCHANT" : "GENERAL_USER"
  await supabase.from("users").update({ role }).eq("id", userId)
  await notifyUsers([userId], "Merchant status updated", `Your merchant application status changed to ${statusValue}`, "MERCHANT_APPROVAL", merchant.merchant_id)

  return jsonResponse(request, {
    user_id: userId,
    username: targetUser.username,
    role,
    merchant_id: updated.merchant_id,
    approval_status: updated.approval_status,
  })
}

async function updateMerchant(request: Request, merchantId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const body = await requestBody(request)
  const supabase = createServerClient()
  const { data: merchant, error } = await supabase.from("merchants").select("*").eq("merchant_id", merchantId).maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!merchant || merchant.user_id !== userOrResponse.id) return errorResponse(request, "Merchant not found", 404)

  const { data: updated, error: updateError } = await supabase
    .from("merchants")
    .update({
      seller_information: typeof body.seller_information === "string" ? body.seller_information : merchant.seller_information,
      product_description: typeof body.product_description === "string" ? body.product_description : merchant.product_description,
    })
    .eq("merchant_id", merchantId)
    .select("*")
    .single()
  if (updateError) return errorResponse(request, updateError.message, 500)
  return jsonResponse(request, updated)
}

async function listNotifications(request: Request): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userOrResponse.id)
    .order("created_at", { ascending: false })
  if (error) return errorResponse(request, error.message, 500)
  return jsonResponse(request, data ?? [])
}

async function markNotificationRead(request: Request, notificationId: string): Promise<Response> {
  const userOrResponse = await requireUser(request)
  if (userOrResponse instanceof Response) return userOrResponse
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .eq("user_id", userOrResponse.id)
    .select("*")
    .maybeSingle()
  if (error) return errorResponse(request, error.message, 500)
  if (!data) return errorResponse(request, "Notification not found", 404)
  return jsonResponse(request, data)
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
    if (method === "GET" && path === "/reservations") return await listReservations(request)
    if (method === "POST" && path === "/reservations") return await createReservation(request)
    if (method === "GET" && path === "/payments") return await listPayments(request)
    if (method === "POST" && path === "/payments") return await createPayment(request)
    if (method === "POST" && path === "/payments/upload-slip") return await uploadSlip(request)
    if (method === "GET" && path === "/merchants/pending") return await listPendingMerchants(request)
    if (method === "GET" && path === "/merchants/all") return await listUsers(request)
    if (method === "GET" && path === "/users") return await listUsers(request)
    if (method === "GET" && path === "/notifications") return await listNotifications(request)
    if (method === "GET" && path === "/events") return await events(request)

    const reservationConfirmMatch = path.match(/^\/reservations\/([^/]+)\/confirm$/)
    if (method === "PATCH" && reservationConfirmMatch) return await confirmReservation(request, decodeURIComponent(reservationConfirmMatch[1]))

    const reservationCancelMatch = path.match(/^\/reservations\/([^/]+)\/cancel$/)
    if (method === "PATCH" && reservationCancelMatch) return await cancelReservation(request, decodeURIComponent(reservationCancelMatch[1]))

    const paymentSlipMatch = path.match(/^\/payments\/([^/]+)\/slip$/)
    if (method === "GET" && paymentSlipMatch) return await getPaymentSlip(request, decodeURIComponent(paymentSlipMatch[1]))

    const paymentApproveMatch = path.match(/^\/payments\/([^/]+)\/approve$/)
    if (method === "PATCH" && paymentApproveMatch) return await approvePayment(request, decodeURIComponent(paymentApproveMatch[1]))

    const merchantApproveMatch = path.match(/^\/merchants\/([^/]+)\/approve$/)
    if (method === "PATCH" && merchantApproveMatch) return await setMerchantStatus(request, decodeURIComponent(merchantApproveMatch[1]), "APPROVED")

    const merchantRejectMatch = path.match(/^\/merchants\/([^/]+)\/reject$/)
    if (method === "PATCH" && merchantRejectMatch) return await setMerchantStatus(request, decodeURIComponent(merchantRejectMatch[1]), "REJECTED")

    const merchantStatusMatch = path.match(/^\/merchants\/([^/]+)\/status$/)
    if (method === "PATCH" && merchantStatusMatch) {
      const body = await requestBody(request)
      const statusValue = typeof body.status_value === "string" ? body.status_value : typeof body.status === "string" ? body.status : ""
      return await setMerchantStatus(request, decodeURIComponent(merchantStatusMatch[1]), statusValue)
    }

    const merchantMatch = path.match(/^\/merchants\/([^/]+)$/)
    if (method === "GET" && merchantMatch) return await getMerchant(request, decodeURIComponent(merchantMatch[1]))
    if (method === "PATCH" && merchantMatch) return await updateMerchant(request, decodeURIComponent(merchantMatch[1]))

    const userMerchantStatusMatch = path.match(/^\/users\/([^/]+)\/merchant_status$/)
    if (method === "PATCH" && userMerchantStatusMatch) return await setUserMerchantStatus(request, decodeURIComponent(userMerchantStatusMatch[1]))

    const notificationReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/)
    if (method === "PATCH" && notificationReadMatch) return await markNotificationRead(request, decodeURIComponent(notificationReadMatch[1]))

    const boothsMatch = path.match(/^\/events\/([^/]+)\/booths$/)
    if (method === "GET" && boothsMatch) return await eventBooths(request, decodeURIComponent(boothsMatch[1]))

    return errorResponse(request, "Not found", 404)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    return errorResponse(request, message, 500)
  }
})
