"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface HistoryRequest {
  id: number
  method: string
  url: string
  responseStatus?: number
  responseTime?: number
  tags?: string
  createdAt: string
}

interface HistoryResponse {
  requests: HistoryRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface RequestHistoryProps {
  refreshTrigger?: number
  onSelectRequest: (request: HistoryRequest) => void
}

export function RequestHistory({ refreshTrigger = 0, onSelectRequest }: RequestHistoryProps) {
  const [requests, setRequests] = useState<HistoryRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [fromCache, setFromCache] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/requests/history?page=${page}&limit=${limit}&sort=desc`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data.requests)
        setTotal(result.data.pagination.total)
        setTotalPages(result.data.pagination.totalPages)
        setFromCache(result.fromCache)
      } else {
        setError(result.error || "Failed to fetch history")
      }
    } catch (err) {
      setError((err as Error).message)
      console.error("Failed to fetch history:", err)
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchHistory()
  }, [page, limit, refreshTrigger, fetchHistory])

  const deleteRequest = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/requests/delete?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        setRequests((prev) => prev.filter((req) => req.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error("Failed to delete request:", error)
    }
  }, [])

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      POST: "bg-green-500/20 text-green-600 dark:text-green-400",
      PUT: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      DELETE: "bg-red-500/20 text-red-600 dark:text-red-400",
      PATCH: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      HEAD: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
    }
    return colors[method] || colors.GET
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Request History</h2>
        {fromCache && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Cached</span>}
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          <p>No requests yet. Make a request to see history.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group"
              onClick={() => onSelectRequest(req)}
            >
              <div className="flex-1 flex items-start gap-3 min-w-0">
                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getMethodColor(req.method)}`}>
                  {req.method}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate text-foreground">{req.url}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {req.responseStatus && (
                      <span
                        className={
                          req.responseStatus >= 200 && req.responseStatus < 300
                            ? "text-green-600 dark:text-green-400"
                            : req.responseStatus >= 400
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                        }
                      >
                        {req.responseStatus}
                      </span>
                    )}
                    {req.responseTime && <span>{req.responseTime}ms</span>}
                    {req.tags && <span className="bg-accent/50 px-2 py-0.5 rounded">{req.tags}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleTimeString()}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteRequest(req.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:opacity-70"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Limit selector - Moved before pagination */}
      <div className="flex items-center gap-2 text-sm border-t border-border pt-4 mt-auto">
        <label>Items per page:</label>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value))
            setPage(1)
          }}
          className="px-2 py-1 bg-card text-card-foreground border border-border rounded"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <span className="text-xs">({total} total)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-secondary disabled:opacity-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 hover:bg-secondary disabled:opacity-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
