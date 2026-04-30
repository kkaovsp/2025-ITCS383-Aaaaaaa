const baseUrl = process.env.EDGE_API_BASE_URL ?? "https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api"

const seededEventId = "55555555-5555-5555-5555-555555555555"
const checks = []

function record(name, ok, detail) {
  checks.push({ name, ok, detail })
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`)
  }
  return body
}

async function login(username, password) {
  const body = new URLSearchParams({ username, password })
  const data = await jsonRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!data?.access_token) throw new Error("No access token returned")
  return data.access_token
}

async function runCheck(name, fn) {
  try {
    const detail = await fn()
    record(name, true, detail)
  } catch (error) {
    record(name, false, error instanceof Error ? error.message : String(error))
  }
}

await runCheck("health", async () => {
  const data = await jsonRequest("/health")
  if (data.status !== "ok") throw new Error(`Unexpected status: ${JSON.stringify(data)}`)
  return "status=ok"
})

await runCheck("events", async () => {
  const data = await jsonRequest("/events")
  const seeded = data.find((event) => event.event_id === seededEventId)
  if (!seeded) throw new Error("Seeded event not found")
  return `count=${data.length}; seeded=${seeded.name}`
})

await runCheck("event booths", async () => {
  const data = await jsonRequest(`/events/${seededEventId}/booths`)
  if (data.length < 2) throw new Error(`Expected at least 2 booths, got ${data.length}`)
  return `count=${data.length}`
})

let managerToken = null
await runCheck("manager login", async () => {
  managerToken = await login("boothManager", "boothManager123")
  return "token returned"
})

if (managerToken) {
  const authHeaders = { Authorization: `Bearer ${managerToken}` }

  await runCheck("manager auth/me", async () => {
    const data = await jsonRequest("/auth/me", { headers: authHeaders })
    if (data.username !== "boothManager" || data.role !== "BOOTH_MANAGER") {
      throw new Error(`Unexpected user: ${JSON.stringify(data)}`)
    }
    return `${data.username}/${data.role}`
  })

  let tempEventId = null
  let tempBoothId = null

  await runCheck("create event", async () => {
    const body = new URLSearchParams({
      name: `Smoke Test Event ${Date.now()}`,
      description: "Temporary event created by smoke test",
      location: "Test Location",
      start_date: "2026-05-01",
      end_date: "2026-05-03",
    })
    const data = await jsonRequest("/events", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!data.event_id) throw new Error(`No event_id returned: ${JSON.stringify(data)}`)
    tempEventId = data.event_id
    return tempEventId
  })

  await runCheck("update event", async () => {
    if (!tempEventId) throw new Error("Temp event was not created")
    const body = new URLSearchParams({ description: "Updated by smoke test" })
    const data = await jsonRequest(`/events/${tempEventId}`, {
      method: "PUT",
      headers: { ...authHeaders, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!data.event_id) throw new Error(`No event_id returned: ${JSON.stringify(data)}`)
    return data.event_id
  })

  await runCheck("get single event", async () => {
    if (!tempEventId) throw new Error("Temp event was not created")
    const data = await jsonRequest(`/events/${tempEventId}`)
    if (!data.event_id) throw new Error(`No event returned: ${JSON.stringify(data)}`)
    return data.name
  })

  await runCheck("create booth", async () => {
    if (!tempEventId) throw new Error("Temp event was not created")
    const body = new URLSearchParams({
      event_id: tempEventId,
      booth_number: `TEST-${Date.now()}`,
      size: "3x3",
      price: "500",
      location: "Zone A",
      type: "INDOOR",
      classification: "FIXED",
      duration_type: "SHORT_TERM",
    })
    const data = await jsonRequest("/booths", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!data.booth_id) throw new Error(`No booth_id returned: ${JSON.stringify(data)}`)
    tempBoothId = data.booth_id
    return tempBoothId
  })

  await runCheck("delete booth", async () => {
    if (!tempBoothId) throw new Error("Temp booth was not created")
    const result = await jsonRequest(`/booths/${tempBoothId}`, {
      method: "DELETE",
      headers: authHeaders,
    })
    if (result.msg !== "booth deleted") throw new Error(`Unexpected delete response: ${JSON.stringify(result)}`)
    return tempBoothId
  })

  await runCheck("delete event", async () => {
    if (!tempEventId) throw new Error("Temp event was not created")
    const result = await jsonRequest(`/events/${tempEventId}`, {
      method: "DELETE",
      headers: authHeaders,
    })
    if (result.msg !== "event deleted") throw new Error(`Unexpected delete response: ${JSON.stringify(result)}`)
    return tempEventId
  })

  await runCheck("report events", async () => {
    const data = await jsonRequest("/reports/events", { headers: authHeaders })
    if (data.length < 2) throw new Error(`Expected at least 2 report events, got ${data.length}`)
    return `count=${data.length}`
  })

  await runCheck("report rows", async () => {
    const data = await jsonRequest(`/reports/reservations-payments?event_id=${seededEventId}`, { headers: authHeaders })
    if (!data.rows || data.rows.length < 2) throw new Error(`Expected at least 2 report rows, got ${data.rows?.length ?? 0}`)
    return `rows=${data.rows.length}`
  })

  await runCheck("manager users list", async () => {
    const data = await jsonRequest("/users", { headers: authHeaders })
    if (data.length < 3) throw new Error(`Expected at least 3 users, got ${data.length}`)
    return `count=${data.length}`
  })

  await runCheck("manager reservations", async () => {
    const data = await jsonRequest("/reservations", { headers: authHeaders })
    if (data.length < 1) throw new Error(`Expected at least 1 reservation, got ${data.length}`)
    return `count=${data.length}`
  })
}

let merchantToken = null
await runCheck("merchant login", async () => {
  merchantToken = await login("demoMerchant", "merchant123")
  return "token returned"
})

if (merchantToken) {
  const authHeaders = { Authorization: `Bearer ${merchantToken}` }

  await runCheck("merchant auth/me", async () => {
    const data = await jsonRequest("/auth/me", { headers: authHeaders })
    if (data.username !== "demoMerchant" || data.role !== "MERCHANT") {
      throw new Error(`Unexpected user: ${JSON.stringify(data)}`)
    }
    return `${data.username}/${data.role}`
  })

  await runCheck("merchant reservations", async () => {
    const data = await jsonRequest("/reservations", { headers: authHeaders })
    if (data.length < 1) throw new Error(`Expected at least 1 merchant reservation, got ${data.length}`)
    return `count=${data.length}`
  })

  await runCheck("merchant notifications", async () => {
    const data = await jsonRequest("/notifications", { headers: authHeaders })
    if (data.length < 1) throw new Error(`Expected at least 1 notification, got ${data.length}`)
    return `count=${data.length}`
  })

  // Create a fresh payment for slip upload test
  let testPaymentId = null
  await runCheck("merchant create payment for slip test", async () => {
    // Use seeded reservation 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    const body = new URLSearchParams({ reservation_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", amount: "1200", method: "BANK_TRANSFER" })
    const data = await jsonRequest("/payments", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!data.payment_id) throw new Error(`No payment_id returned: ${JSON.stringify(data)}`)
    testPaymentId = data.payment_id
    return testPaymentId
  })

  // Upload a tiny valid slip file
  await runCheck("merchant upload payment slip", async () => {
    if (!testPaymentId) throw new Error("Test payment was not created")
    const formData = new FormData()
    // Create a tiny 1x1 transparent PNG
    const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 0, 0, 0, 2, 0, 1, 73, 73, 122, 0, 0, 0, 10, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    const pngBlob = new Blob([pngBytes], { type: "image/png" })
    formData.append("file", pngBlob, "smoke-test-slip.png")
    const response = await fetch(`${baseUrl}/payments/upload-slip?payment_id=${testPaymentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${merchantToken}` },
      body: formData,
    })
    const text = await response.text()
    if (!response.ok) throw new Error(`${response.status}: ${text}`)
    const data = JSON.parse(text)
    if (data.msg !== "slip uploaded") throw new Error(`Unexpected response: ${JSON.stringify(data)}`)
    return data.slip_url ?? "ok"
  })

  // Merchant can retrieve own slip as binary
  await runCheck("merchant retrieve own slip (binary)", async () => {
    if (!testPaymentId) throw new Error("Test payment was not created")
    const response = await fetch(`${baseUrl}/payments/${testPaymentId}/slip`, {
      headers: { Authorization: `Bearer ${merchantToken}` },
    })
    const contentType = response.headers.get("content-type") ?? ""
    const contentDisposition = response.headers.get("content-disposition") ?? ""
    if (response.status !== 200) {
      const text = await response.text()
      throw new Error(`${response.status}: ${text}`)
    }
    if (contentType.startsWith("application/json")) {
      throw new Error(`Expected binary slip, got JSON: ${contentType}`)
    }
    if (!contentType.startsWith("image/") && contentType !== "application/octet-stream") {
      throw new Error(`Unexpected content-type: ${contentType}`)
    }
    if (!contentDisposition.includes("inline")) {
      throw new Error(`Expected inline disposition, got: ${contentDisposition}`)
    }
    return `content-type=${contentType}; disposition=${contentDisposition}`
  })

  // Manager can retrieve any slip as binary
  await runCheck("manager retrieve merchant slip (binary)", async () => {
    if (!testPaymentId) throw new Error("Test payment was not created")
    if (!managerToken) throw new Error("Manager token not available")
    const response = await fetch(`${baseUrl}/payments/${testPaymentId}/slip`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    })
    const contentType = response.headers.get("content-type") ?? ""
    if (response.status !== 200) {
      const text = await response.text()
      throw new Error(`${response.status}: ${text}`)
    }
    if (contentType.startsWith("application/json")) {
      throw new Error(`Expected binary slip, got JSON: ${contentType}`)
    }
    return `content-type=${contentType}; status=200`
  })
}

for (const check of checks) {
  const status = check.ok ? "PASS" : "FAIL"
  console.log(`${status} ${check.name}: ${check.detail}`)
}

const failed = checks.filter((check) => !check.ok)
if (failed.length > 0) {
  console.error(`${failed.length} smoke check(s) failed`)
  process.exit(1)
}

console.log(`${checks.length}/${checks.length} smoke checks passed`)
