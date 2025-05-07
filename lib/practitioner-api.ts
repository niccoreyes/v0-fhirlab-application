import { fhirRequest } from "./fhir-api"

export interface PractitionerDetails {
  id: string
  name: {
    given: string[]
    family: string
  }[]
  telecom?: {
    system: string
    value: string
  }[]
  address?: {
    text: string
  }[]
  identifier?: {
    system: string
    value: string
  }[]
  gender?: string
}

// Default practitioner data to use if fetch fails
export const DEFAULT_PRACTITIONER: PractitionerDetails = {
  id: "78812",
  name: [{ family: "Reyes", given: ["Thomas"] }],
  telecom: [
    { system: "phone", value: "+639XXXXXXXXX" },
    { system: "email", value: "thomas@example.com" },
  ],
  address: [{ text: "123 Example Street, City, Country" }],
  identifier: [{ system: "http://example.org/staff-ids", value: "staff-id-12345" }],
  gender: "male",
}

// Fetch practitioner details from FHIR server
export async function fetchPractitionerDetails(practitionerId: string): Promise<PractitionerDetails> {
  try {
    const response = await fhirRequest(`Practitioner/${practitionerId}`)
    return response
  } catch (error) {
    console.error(`Error fetching practitioner ${practitionerId}:`, error)
    // Return default practitioner data if fetch fails
    return DEFAULT_PRACTITIONER
  }
}
