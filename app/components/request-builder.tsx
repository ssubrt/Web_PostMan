"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Loader2, Send, Copy, Check } from "lucide-react"

export interface RequestData {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
  url: string
  headers: Record<string, string>
  body: string
  tags: string
}

interface RequestBuilderProps {
  onResponse: (response: any) => void
  onRequestSaved: (request: any) => void
  selectedRequest?: any
}

export function RequestBuilder({ onResponse, onRequestSaved, selectedRequest }: RequestBuilderProps) {
  const [method, setMethod] = useState<RequestData["method"]>("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [headerInput, setHeaderInput] = useState({ key: "", value: "" })
  const [responseData, setResponseData] = useState<any>(null)
  const [responseTime, setResponseTime] = useState(0)
  const [responseStatus, setResponseStatus] = useState(0)
  const [copied, setCopied] = useState(false)
  const [responseFormat, setResponseFormat] = useState<"pretty" | "raw" | "preview">("pretty")
  const copyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Load selected request from history
  useEffect(() => {
    const loadRequestDetails = async () => {
      if (selectedRequest?.id) {
        try {
          const response = await fetch(`/api/requests/get?id=${selectedRequest.id}`)
          const result = await response.json()
          
          if (result.success && result.request) {
            const req = result.request
            setMethod(req.method)
            setUrl(req.url)
            setHeaders(req.headers || {})
            setBody(req.body || "")
            setTags(req.tags || "")
            
            // Also populate response if available
            if (req.responseData) {
              setResponseData(req.responseData)
              setResponseStatus(req.responseStatus || 0)
              setResponseTime(req.responseTime || 0)
            }
          }
        } catch (error) {
          console.error("Failed to load request details:", error)
        }
      }
    }
    
    loadRequestDetails()
  }, [selectedRequest])

  const sendRequest = useCallback(async () => {
    if (!url.trim()) {
      alert("Please enter a URL")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/requests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url,
          headers: Object.keys(headers).length > 0 ? JSON.stringify(headers) : "{}",
          body: body || null,
          tags: tags || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setResponseData(result.request.responseData)
        setResponseTime(result.request.responseTime)
        setResponseStatus(result.request.responseStatus)
        onRequestSaved(result.request)
        onResponse({
          status: result.request.responseStatus,
          data: result.request.responseData,
          time: result.request.responseTime,
        })
      } else {
        setResponseData(result.error)
        onResponse({
          status: 0,
          data: result.error,
          time: 0,
        })
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setResponseData(errorMessage)
      onResponse({
        status: 0,
        data: errorMessage,
        time: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [method, url, headers, body, tags, onResponse, onRequestSaved])

  const addHeader = useCallback(() => {
    if (headerInput.key && headerInput.value) {
      setHeaders((prev) => ({
        ...prev,
        [headerInput.key]: headerInput.value,
      }))
      setHeaderInput({ key: "", value: "" })
    }
  }, [headerInput])

  const removeHeader = useCallback((key: string) => {
    setHeaders((prev) => {
      const newHeaders = { ...prev }
      delete newHeaders[key]
      return newHeaders
    })
  }, [])

  const copyResponseToClipboard = useCallback(() => {
    if (responseData) {
      const textToCopy = typeof responseData === "string" ? responseData : JSON.stringify(responseData, null, 2)
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }, [responseData])

  const formatResponse = useCallback(() => {
    if (!responseData) return ""

    const dataStr = typeof responseData === "string" ? responseData : JSON.stringify(responseData, null, 2)

    switch (responseFormat) {
      case "pretty":
        try {
          const parsed = typeof responseData === "string" ? JSON.parse(responseData) : responseData
          return JSON.stringify(parsed, null, 2)
        } catch {
          return dataStr
        }
      case "raw":
        return typeof responseData === "string" ? responseData : JSON.stringify(responseData)
      case "preview":
        return dataStr
      default:
        return dataStr
    }
  }, [responseData, responseFormat])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Method and URL Section */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as RequestData["method"])}
          className="px-3 py-2 bg-card text-card-foreground border border-border rounded-lg font-mono text-sm font-semibold w-24"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
          <option>HEAD</option>
        </select>
        <input
          type="text"
          placeholder="Enter URL (e.g., https://jsonplaceholder.typicode.com/posts)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 bg-card text-card-foreground border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground"
        />
        <button
          onClick={sendRequest}
          disabled={loading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button className="px-4 py-2 font-semibold text-primary border-b-2 border-primary">Headers</button>
        <button className="px-4 py-2 text-muted-foreground hover:text-foreground">Body</button>
      </div>

      {/* Headers Section */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Header Key"
            value={headerInput.key}
            onChange={(e) => setHeaderInput({ ...headerInput, key: e.target.value })}
            className="flex-1 px-3 py-2 bg-card text-card-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Header Value"
            value={headerInput.value}
            onChange={(e) => setHeaderInput({ ...headerInput, value: e.target.value })}
            className="flex-1 px-3 py-2 bg-card text-card-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground"
          />
          <button
            onClick={addHeader}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 font-semibold text-sm"
          >
            Add
          </button>
        </div>

        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="flex gap-2 p-2 bg-card border border-border rounded-lg text-sm">
            <span className="flex-1 font-mono text-foreground">{key}:</span>
            <span className="flex-1 font-mono text-muted-foreground">{value}</span>
            <button
              onClick={() => removeHeader(key)}
              className="text-destructive hover:opacity-80 font-semibold text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Body Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Body (for POST/PUT/PATCH)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          className="flex-1 px-4 py-3 bg-card text-card-foreground border border-border rounded-lg font-mono text-sm placeholder:text-muted-foreground resize-none"
        />
      </div>

      {/* Tags Section */}
      <div className="flex gap-2">
        <label className="text-sm font-semibold">Tags:</label>
        <input
          type="text"
          placeholder="e.g., testing, api, important"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="flex-1 px-3 py-2 bg-card text-card-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Response Section */}
      {responseData && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                    : responseStatus >= 400
                      ? "bg-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {responseStatus || "Error"}
              </span>
              <span className="text-sm text-muted-foreground">{responseTime}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={responseFormat}
                onChange={(e) => setResponseFormat(e.target.value as "pretty" | "raw" | "preview")}
                className="px-3 py-1 bg-card text-card-foreground border border-border rounded text-sm"
              >
                <option value="pretty">Pretty JSON</option>
                <option value="raw">Raw</option>
                <option value="preview">Preview</option>
              </select>
              <button
                onClick={copyResponseToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground rounded hover:opacity-80 text-sm font-semibold"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 max-h-40 overflow-auto">
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {formatResponse()}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
