"use client"

import { useEffect, useState } from "react"

interface HealthStatus {
  api: string
  database: string
  redis: string
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>BlinkRoom - Health Status</h1>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {health && (
        <div>
          <p>API: {health.api}</p>
          <p>Database: {health.database}</p>
          <p>Redis: {health.redis}</p>
        </div>
      )}

      <button onClick={fetchHealth} disabled={loading}>
        Refresh
      </button>
    </div>
  )
}