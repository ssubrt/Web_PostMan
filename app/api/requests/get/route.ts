import { type NextRequest, NextResponse } from "next/server"
import { getEntityManager } from "@/app/lib/mikro-orm.config"
import { Request } from "@/app/lib/entities/Request.entity"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestId = searchParams.get("id")

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    const em = await getEntityManager()
    const dbRequest = await em.findOne(Request, { id: Number.parseInt(requestId) })

    if (!dbRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      request: {
        id: dbRequest.id,
        method: dbRequest.method,
        url: dbRequest.url,
        headers: dbRequest.headers ? JSON.parse(dbRequest.headers) : {},
        body: dbRequest.body,
        responseStatus: dbRequest.responseStatus,
        responseData: dbRequest.responseData,
        responseTime: dbRequest.responseTime,
        tags: dbRequest.tags,
        createdAt: dbRequest.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch request", details: (error as Error).message }, { status: 500 })
  }
}
