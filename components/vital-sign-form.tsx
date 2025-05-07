"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminologySearch } from "@/components/ui/terminology-search"
import { searchLoincTerms, validateCode, type TerminologySearchResult } from "@/lib/terminology-api"

interface VitalSignFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function VitalSignForm({ onSubmit, onCancel }: VitalSignFormProps) {
  const [selectedVital, setSelectedVital] = useState<TerminologySearchResult | null>(null)
  const [vitalValue, setVitalValue] = useState("")
  const [unit, setUnit] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVital || !vitalValue || !unit) return

    onSubmit({
      display: selectedVital.display,
      loincCode: selectedVital.code,
      system: selectedVital.system,
      value: Number.parseFloat(vitalValue),
      unit: unit,
    })
  }

  // Determine appropriate unit based on selected vital
  const handleVitalSelect = (vital: TerminologySearchResult) => {
    setSelectedVital(vital)

    // Set default unit based on the selected vital sign
    // This is a simplified approach - in a real app, you might want to
    // query the terminology server for valid units for this observation
    if (vital.code === "8867-4")
      setUnit("bpm") // Heart rate
    else if (vital.code === "8310-5")
      setUnit("°C") // Temperature
    else if (vital.code === "8480-6")
      setUnit("mmHg") // Systolic BP
    else if (vital.code === "8462-4")
      setUnit("mmHg") // Diastolic BP
    else if (vital.code === "8287-5")
      setUnit("cm") // Height
    else if (vital.code === "29463-7")
      setUnit("kg") // Weight
    else if (vital.code === "59408-5")
      setUnit("%") // Oxygen saturation
    else if (vital.code === "9279-1")
      setUnit("breaths/min") // Respiratory rate
    else setUnit("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Vital Sign</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vital-type">Vital Sign Type</Label>
            <TerminologySearch
              placeholder="Search for vital signs..."
              searchFunction={searchLoincTerms}
              validateFunction={(code) => validateCode(code, "http://loinc.org")}
              onSelect={handleVitalSelect}
              value={selectedVital}
              required
            />
          </div>

          {selectedVital && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vital-value">Value</Label>
                <Input
                  id="vital-value"
                  type="text"
                  placeholder="Enter value"
                  value={vitalValue}
                  onChange={(e) => setVitalValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vital-unit">Unit</Label>
                <Input
                  id="vital-unit"
                  type="text"
                  placeholder="Enter unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedVital || !vitalValue || !unit}>
            Record
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
