"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminologySearch } from "@/components/ui/terminology-search"
import { searchRxNormTerms, validateCode, type TerminologySearchResult } from "@/lib/terminology-api"

interface MedicationOrderFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function MedicationOrderForm({ onSubmit, onCancel }: MedicationOrderFormProps) {
  const [selectedMedication, setSelectedMedication] = useState<TerminologySearchResult | null>(null)
  const [dose, setDose] = useState("")
  const [doseUnit, setDoseUnit] = useState("mg")
  const [frequency, setFrequency] = useState("1")
  const [instructions, setInstructions] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMedication) return

    onSubmit({
      medicationName: selectedMedication.display,
      rxnormCode: selectedMedication.code,
      system: selectedMedication.system,
      dose: Number.parseFloat(dose),
      doseUnit: doseUnit,
      frequency: Number.parseInt(frequency),
      dosageInstructions: instructions,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Medication</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication">Medication</Label>
            <TerminologySearch
              placeholder="Search for medications..."
              searchFunction={searchRxNormTerms}
              validateFunction={(code) => validateCode(code, "http://www.nlm.nih.gov/research/umls/rxnorm")}
              onSelect={setSelectedMedication}
              value={selectedMedication}
              required
            />
          </div>

          {selectedMedication && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dose">Dose</Label>
                  <Input id="dose" type="text" value={dose} onChange={(e) => setDose(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dose-unit">Unit</Label>
                  <Select value={doseUnit} onValueChange={setDoseUnit}>
                    <SelectTrigger id="dose-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="mcg">mcg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mL">mL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Times per day</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Once daily</SelectItem>
                    <SelectItem value="2">Twice daily</SelectItem>
                    <SelectItem value="3">Three times daily</SelectItem>
                    <SelectItem value="4">Four times daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Take with food, etc."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedMedication || !dose}>
            Order
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
