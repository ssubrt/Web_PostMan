import { type NextRequest, NextResponse } from "next/server"
import { getEntityManager } from "@/app/lib/mikro-orm.config"
import { Request } from "@/app/lib/entities/Request.entity"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, url, headers, body: requestBody, tags } = body

    if (!method || !url) {
      return NextResponse.json({ error: "Method and URL are required" }, { status: 400 })
    }

    const startTime = Date.now()

    const defaultHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...defaultHeaders,
        ...(headers ? JSON.parse(headers) : {}),
      },
      signal: AbortSignal.timeout(30000),
    }

    if (requestBody && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = requestBody
    }

    let responseStatus = 0
    let responseData = ""
    let responseTime = 0

    try {
      const response = await fetch(url, fetchOptions)
      responseStatus = response.status
      responseData = await response.text()
      responseTime = Date.now() - startTime

      const em = await getEntityManager()
      const dbRequest = em.create(Request, {
        method,
        url,
        headers: headers || "{}",
        body: requestBody || undefined,
        responseStatus,
        responseData,
        responseTime,
        tags: tags || undefined,
        createdAt: new Date(),
      })
      await em.persistAndFlush(dbRequest)

      return NextResponse.json({
        success: true,
        request: {
          id: dbRequest.id,
          method,
          url,
          responseStatus,
          responseData,
          responseTime,
        },
      })
    } catch (fetchError) {
      responseTime = Date.now() - startTime
      const errorMessage = (fetchError as Error).message

      const em = await getEntityManager()
      const dbRequest = em.create(Request, {
        method,
        url,
        headers: headers || "{}",
        body: requestBody || undefined,
        responseStatus: 0,
        responseData: errorMessage,
        responseTime,
        tags: tags || undefined,
        createdAt: new Date(),
      })
      await em.persistAndFlush(dbRequest)

      return NextResponse.json({
        success: false,
        error: errorMessage,
        request: {
          id: dbRequest.id,
          method,
          url,
          responseStatus: 0,
          responseData: errorMessage,
          responseTime,
        },
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request", details: (error as Error).message }, { status: 500 })
  }
}
