import { type NextRequest, NextResponse } from "next/server"
import { getEntityManager } from "@/app/lib/mikro-orm.config"
import { Request } from "@/app/lib/entities/Request.entity"

const CACHE_TTL = 60 * 1000 // 1 minute cache

interface CacheEntry {
  data: any
  timestamp: number
}

const requestCache = new Map<string, CacheEntry>()

function getCacheKey(page: number, limit: number): string {
  return `history-${page}-${limit}`
}

function getFromCache(key: string): any | null {
  const entry = requestCache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    requestCache.delete(key)
    return null
  }

  return entry.data
}

function setInCache(key: string, data: any): void {
  requestCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 })
    }

    const cacheKey = getCacheKey(page, limit)
    const cachedData = getFromCache(cacheKey)

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        fromCache: true,
      })
    }

    const offset = (page - 1) * limit

    try {
      const em = await getEntityManager()

      const [requests, total] = await em.findAndCount(
        Request,
        {},
        {
          limit,
          offset,
          orderBy: { createdAt: "DESC" },
        },
      )

      const totalPages = Math.ceil(total / limit)
      const responseData = {
        requests: requests.map((req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          responseStatus: req.responseStatus,
          responseTime: req.responseTime,
          tags: req.tags,
          createdAt: req.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      }

      setInCache(cacheKey, responseData)

      return NextResponse.json({
        success: true,
        data: responseData,
        fromCache: false,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // If database fails, return empty results
      return NextResponse.json({
        success: true,
        data: {
          requests: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        fromCache: false,
      })
    }
  } catch (error) {
    console.error("Error in history route:", error)
    return NextResponse.json({ error: "Failed to fetch history", details: (error as Error).message }, { status: 500 })
  }
}
