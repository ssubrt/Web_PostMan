// In-memory request store with persistence patterns
interface StoredRequest {
  id: number
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
  url: string
  headers: string
  body?: string
  responseStatus?: number
  responseData?: string
  responseTime?: number
  tags?: string
  createdAt: string
}

class RequestStore {
  private requests: Map<number, StoredRequest> = new Map()
  private nextId = 1

  addRequest(data: Omit<StoredRequest, "id" | "createdAt">): StoredRequest {
    const request: StoredRequest = {
      ...data,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    }
    this.requests.set(request.id, request)
    return request
  }

  getRequests(limit = 10, offset = 0): { requests: StoredRequest[]; total: number } {
    const allRequests = Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return {
      requests: allRequests.slice(offset, offset + limit),
      total: allRequests.length,
    }
  }

  getRequest(id: number): StoredRequest | undefined {
    return this.requests.get(id)
  }

  deleteRequest(id: number): boolean {
    return this.requests.delete(id)
  }

  clear(): void {
    this.requests.clear()
    this.nextId = 1
  }
}

export const store = new RequestStore()
