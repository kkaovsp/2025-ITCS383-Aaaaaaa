import { handleOptions } from "../_shared/cors.ts"
import { createServerClient } from "../_shared/supabaseClient.ts"
import { errorResponse, jsonResponse } from "../_shared/json.ts"

function apiPath(request: Request): string {
  const url = new URL(request.url)
  let path = url.pathname
  path = path.replace(/^\/functions\/v1\/api/, "")
  path = path.replace(/^\/api/, "")
  return path || "/"
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  const method = request.method
  const path = apiPath(request)

  try {
    if (method === "GET" && (path === "/" || path === "/health")) {
      return jsonResponse(request, { status: "ok" })
    }

    if (method === "GET" && path === "/events") {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from("events")
        .select("event_id,name,description,location,start_date,end_date,created_by,created_at")
        .order("start_date", { ascending: true })

      if (error) return errorResponse(request, error.message, 500)
      return jsonResponse(request, data ?? [])
    }

    const boothsMatch = path.match(/^\/events\/([^/]+)\/booths$/)
    if (method === "GET" && boothsMatch) {
      const eventId = decodeURIComponent(boothsMatch[1])
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from("booths")
        .select("booth_id,event_id,booth_number,size,price,location,type,classification,duration_type,electricity,water_supply,outlets,status")
        .eq("event_id", eventId)
        .order("booth_number", { ascending: true })

      if (error) return errorResponse(request, error.message, 500)
      return jsonResponse(request, data ?? [])
    }

    return errorResponse(request, "Not found", 404)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    return errorResponse(request, message, 500)
  }
})
