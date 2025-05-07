// FHIR Terminology Server API integration

const TERMINOLOGY_SERVER_URL = "https://tx.fhirlab.net/fhir"

// SNOMED CT ValueSet URI - specific version as requested
const SNOMED_CT_VALUESET_URI = "http://snomed.info/sct/999991001000101/version/20240701?fhir_vs"
const SNOMED_CT_SYSTEM = "http://snomed.info/sct"

// Types for terminology responses
export interface CodeableConcept {
  system: string
  code: string
  display: string
}

export interface TerminologySearchResult {
  system: string
  code: string
  display: string
}

export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * Search for terms using ValueSet expansion
 * @param searchTerm The search term
 * @param valueSetUri The ValueSet URI to expand (defaults to SNOMED CT)
 */
export async function searchTerms(
  searchTerm: string,
  valueSetUri: string = SNOMED_CT_VALUESET_URI,
): Promise<TerminologySearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) return []

  try {
    // Build the URL for the $expand operation
    const params = new URLSearchParams({
      url: valueSetUri,
      filter: searchTerm,
    })

    const response = await fetch(`${TERMINOLOGY_SERVER_URL}/ValueSet/$expand?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Terminology server error: ${response.status}`)
    }

    const data = await response.json()

    // Extract concepts from the expansion
    if (data.expansion && data.expansion.contains) {
      return data.expansion.contains.map((item: any) => ({
        system: item.system,
        code: item.code,
        display: item.display,
      }))
    }

    return []
  } catch (error) {
    console.error("Error searching terminology:", error)
    return []
  }
}

/**
 * Search for SNOMED CT terms using ValueSet expansion
 * @param searchTerm The search term
 */
export async function searchSnomedTerms(searchTerm: string): Promise<TerminologySearchResult[]> {
  return searchTerms(searchTerm, SNOMED_CT_VALUESET_URI)
}

/**
 * Search for LOINC terms using ValueSet expansion
 * @param searchTerm The search term
 */
export async function searchLoincTerms(searchTerm: string): Promise<TerminologySearchResult[]> {
  // Use a LOINC ValueSet URI for expansion
  return searchTerms(searchTerm, "http://loinc.org?fhir_vs")
}

/**
 * Search for RxNorm terms using ValueSet expansion
 * @param searchTerm The search term
 */
export async function searchRxNormTerms(searchTerm: string): Promise<TerminologySearchResult[]> {
  // Use an RxNorm ValueSet URI for expansion
  return searchTerms(searchTerm, "http://www.nlm.nih.gov/research/umls/rxnorm?fhir_vs")
}

/**
 * Validate if a code is valid in a code system
 * @param code The code to validate
 * @param system The code system URI
 * @param version Optional version of the code system
 */
export async function validateCode(
  code: string,
  system: string = SNOMED_CT_SYSTEM,
  version?: string,
): Promise<ValidationResult> {
  try {
    const params = new URLSearchParams({
      code,
      system,
    })

    if (version) {
      params.append("version", version)
    }

    const response = await fetch(`${TERMINOLOGY_SERVER_URL}/CodeSystem/$validate-code?${params.toString()}`)
    const data = await response.json()

    if (!response.ok) {
      return {
        isValid: false,
        message: data.issue?.[0]?.diagnostics || "Invalid code",
      }
    }

    const result = data.parameter?.find((p: any) => p.name === "result")?.valueBoolean
    const message = data.parameter?.find((p: any) => p.name === "message")?.valueString

    return {
      isValid: result === true,
      message: message,
    }
  } catch (error) {
    console.error("Error validating code:", error)
    return {
      isValid: false,
      message: "Error validating code",
    }
  }
}

/**
 * Validate a SNOMED CT code
 * @param code The SNOMED CT code to validate
 */
export async function validateSnomedCode(code: string): Promise<ValidationResult> {
  return validateCode(code, SNOMED_CT_SYSTEM)
}

// Common code systems
export const CODE_SYSTEMS = {
  SNOMED: SNOMED_CT_SYSTEM,
  LOINC: "http://loinc.org",
  RXNORM: "http://www.nlm.nih.gov/research/umls/rxnorm",
  ICD10: "http://hl7.org/fhir/sid/icd-10",
}

// Remove any VALUE_SETS constants that might have been used before
// as we're now using direct ValueSet URIs in the searchTerms function
