"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function TerminologyDebug() {
  const [searchTerm, setSearchTerm] = useState("diabetes")
  const [loading, setLoading] = useState(false)
  const [requestUrl, setRequestUrl] = useState("")
  const [responseData, setResponseData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return

    setLoading(true)
    setError(null)

    try {
      // SNOMED CT ValueSet URI
      const valueSetUri = "http://snomed.info/sct/999991001000101/version/20240701?fhir_vs"

      // Build the URL for the $expand operation
      const params = new URLSearchParams({
        url: valueSetUri,
        filter: searchTerm,
      })

      const url = `https://tx.fhirlab.net/fhir/ValueSet/$expand?${params.toString()}`
      setRequestUrl(url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Terminology server error: ${response.status}`)
      }

      const data = await response.json()
      setResponseData(data)
    } catch (error) {
      console.error("Error searching terminology:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Run search on initial load
  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ValueSet/$expand Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term (e.g., diabetes)"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Request URL:</h3>
          <div className="p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            <pre>{requestUrl}</pre>
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {responseData && (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Response Data:</h3>
              <div className="p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-60">
                <pre>{JSON.stringify(responseData, null, 2)}</pre>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Parsed Results:</h3>
              <div className="p-2 bg-gray-100 rounded overflow-y-auto max-h-60">
                <ul className="space-y-2">
                  {responseData.expansion?.contains?.map((item: any) => (
                    <li key={item.code} className="p-2 bg-white rounded border">
                      <p className="font-medium">{item.display}</p>
                      <p className="text-xs text-gray-500">
                        Code: {item.code} | System: {item.system}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
