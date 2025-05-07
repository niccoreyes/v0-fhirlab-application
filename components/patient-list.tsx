"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPatients } from "@/lib/fhir-api"
import type { PatientSummary } from "@/lib/types"

interface PatientListProps {
  filter?: "my-patients" | "high-risk" | "unreviewed"
}

export function PatientList({ filter = "my-patients" }: PatientListProps) {
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true)
        // Direct call to FHIR API without authentication
        const data = await fetchPatients(filter)
        setPatients(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch patients:", err)
        setError("Failed to load patients. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [filter])

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-md">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button className="mt-2 text-sm text-blue-500 hover:underline" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No patients found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {patients.map((patient) => (
        <button
          key={patient.id}
          className="w-full flex items-start gap-3 p-2 hover:bg-gray-100 rounded-md text-left transition-colors"
          onClick={() => router.push(`/dashboard/patient/${patient.id}`)}
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            {patient.name.given[0]?.[0] || ""}
            {patient.name.family?.[0] || ""}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start">
              <p className="font-medium truncate">
                {patient.name.given.join(" ")} {patient.name.family}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                {format(new Date(patient.lastUpdated), "h:mm a")}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{patient.lastMessage || "No recent messages"}</p>
            <div className="flex gap-1 mt-1">
              {patient.unreadLabs && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                  Unread Lab
                </Badge>
              )}
              {patient.needsFollowUp && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-800 border-red-200">
                  Follow-up
                </Badge>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
