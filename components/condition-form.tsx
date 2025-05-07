"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminologySearch } from "@/components/ui/terminology-search"
import { searchSnomedTerms, validateSnomedCode, type TerminologySearchResult } from "@/lib/terminology-api"

interface ConditionFormProps {
  patientId: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ConditionForm({ patientId, onSubmit, onCancel }: ConditionFormProps) {
  const [selectedCondition, setSelectedCondition] = useState<TerminologySearchResult | null>(null)
  const [clinicalStatus, setClinicalStatus] = useState("active")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCondition) return

    onSubmit({
      code: {
        coding: [
          {
            system: selectedCondition.system,
            code: selectedCondition.code,
            display: selectedCondition.display,
          },
        ],
        text: selectedCondition.display,
      },
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: clinicalStatus,
            display:
              clinicalStatus === "active"
                ? "Active"
                : clinicalStatus === "recurrence"
                  ? "Recurrence"
                  : clinicalStatus === "relapse"
                    ? "Relapse"
                    : clinicalStatus === "inactive"
                      ? "Inactive"
                      : clinicalStatus === "remission"
                        ? "Remission"
                        : clinicalStatus === "resolved"
                          ? "Resolved"
                          : "Unknown",
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      note: notes ? [{ text: notes }] : undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Condition</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <TerminologySearch
              placeholder="Search for conditions (e.g., diabetes, hypertension)..."
              searchFunction={searchSnomedTerms}
              validateFunction={validateSnomedCode}
              onSelect={setSelectedCondition}
              value={selectedCondition}
              required
            />
          </div>

          {selectedCondition && (
            <>
              <div className="space-y-2">
                <Label htmlFor="clinical-status">Clinical Status</Label>
                <Select value={clinicalStatus} onValueChange={setClinicalStatus}>
                  <SelectTrigger id="clinical-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="recurrence">Recurrence</SelectItem>
                    <SelectItem value="relapse">Relapse</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="remission">Remission</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the condition"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedCondition}>
            Record
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
