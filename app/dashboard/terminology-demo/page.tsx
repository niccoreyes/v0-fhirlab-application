import { SnomedSearchDemo } from "@/components/snomed-search-demo"
import { TerminologyDebug } from "@/components/terminology-debug"

export default function TerminologyDemoPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">FHIR Terminology Server Integration</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates the integration with the FHIR terminology server using ValueSet/$expand instead of
        CodeSystem/$lookup for all SNOMED CT searches.
      </p>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div>
          <SnomedSearchDemo />
        </div>
        <div>
          <TerminologyDebug />
        </div>
      </div>
    </div>
  )
}
