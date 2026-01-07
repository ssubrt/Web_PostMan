import { type NextRequest, NextResponse } from "next/server"
import { getEntityManager } from "@/app/lib/mikro-orm.config"
import { Request } from "@/app/lib/entities/Request.entity"

export async function DELETE(request: NextRequest) {
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

    await em.removeAndFlush(dbRequest)

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete request", details: (error as Error).message }, { status: 500 })
  }
}
