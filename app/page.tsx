"use client"

import { useState, useCallback } from "react"
import { RequestBuilder } from "./components/request-builder"
import { RequestHistory } from "./components/request-history"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const handleRequestSaved = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleSelectRequest = useCallback((request: any) => {
    setSelectedRequest(request)
  }, [])

  const handleResponse = useCallback(() => {
    // Response is handled in the RequestBuilder component
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">REST Client</h1>
          <p className="text-muted-foreground text-sm mt-1">Test APIs with full request/response history</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Request Builder - Main Area */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex-1 overflow-auto">
              <RequestBuilder onResponse={handleResponse} onRequestSaved={handleRequestSaved} selectedRequest={selectedRequest} />
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex-1 overflow-auto">
              <RequestHistory refreshTrigger={refreshTrigger} onSelectRequest={handleSelectRequest} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
