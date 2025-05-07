"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminologySearch } from "@/components/ui/terminology-search"
import { searchSnomedTerms, validateSnomedCode, type TerminologySearchResult } from "@/lib/terminology-api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check } from "lucide-react"

export function SnomedSearchDemo() {
  const [selectedConcept, setSelectedConcept] = useState<TerminologySearchResult | null>(null)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>SNOMED CT Search with ValueSet Expansion</CardTitle>
        <CardDescription>
          This demo uses the FHIR terminology server's ValueSet/$expand operation to search for SNOMED CT concepts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search for a medical concept</label>
          <TerminologySearch
            placeholder="Type to search (e.g., diabetes, hypertension)..."
            searchFunction={searchSnomedTerms}
            validateFunction={validateSnomedCode}
            onSelect={setSelectedConcept}
            value={selectedConcept}
          />
        </div>

        {selectedConcept && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Concept:</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{selectedConcept.display}</p>
                  <p className="text-sm text-gray-500">
                    Code: {selectedConcept.code} | System: {selectedConcept.system}
                  </p>
                </div>
              </div>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                This concept was found using the ValueSet/$expand operation with the specific SNOMED CT ValueSet URI.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4">
          <p>Implementation details:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Uses <code>ValueSet/$expand</code> operation with the specific SNOMED CT ValueSet URI:
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                http://snomed.info/sct/999991001000101/version/20240701?fhir_vs
              </pre>
            </li>
            <li>
              Passes user input as the <code>filter</code> parameter
            </li>
            <li>
              Parses and renders suggestions from <code>expansion.contains</code>
            </li>
            <li>No fallback to CodeSystem/$lookup or hardcoded lists</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
