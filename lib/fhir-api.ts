// FHIR API integration - Direct connection without authentication

const FHIR_BASE_URL = "https://cdr.fhirlab.net/fhir"

// Helper function for making FHIR API requests
export async function fhirRequest(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any) {
  const url = endpoint.startsWith("http") ? endpoint : `${FHIR_BASE_URL}/${endpoint}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FHIR API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error in FHIR request to ${endpoint}:`, error)
    throw error
  }
}

// 1. Fetch list of patients
// GET https://cdr.fhirlab.net/fhir/Patient?_sort=-_lastUpdated&_count=50
export async function fetchPatients(filter?: string) {
  try {
    const response = await fhirRequest("Patient?_sort=-_lastUpdated&_count=50")

    // Process the Bundle response
    const patients =
      response.entry?.map((entry: any) => {
        const resource = entry.resource

        // Extract patient details
        return {
          id: resource.id,
          name: {
            given: resource.name?.[0]?.given || ["Unknown"],
            family: resource.name?.[0]?.family || "Patient",
          },
          gender: resource.gender || "unknown",
          birthDate: resource.birthDate,
          lastUpdated: resource.meta?.lastUpdated || new Date().toISOString(),
          // These would be derived from other resources in a real implementation
          lastMessage: "No recent messages",
          unreadLabs: Math.random() > 0.7, // Simulated for demo
          needsFollowUp: Math.random() > 0.8, // Simulated for demo
        }
      }) || []

    // Apply client-side filtering based on the filter parameter
    if (filter === "high-risk") {
      return patients.filter((p: any) => p.needsFollowUp)
    } else if (filter === "unreviewed") {
      return patients.filter((p: any) => p.unreadLabs)
    }

    return patients
  } catch (error) {
    console.error("Error fetching patients:", error)
    throw error
  }
}

// 2a. Fetch patient details
// GET https://cdr.fhirlab.net/fhir/Patient/{{patientId}}
export async function fetchPatientDetails(patientId: string) {
  try {
    const response = await fhirRequest(`Patient/${patientId}`)

    return {
      id: response.id,
      name: {
        given: response.name?.[0]?.given || ["Unknown"],
        family: response.name?.[0]?.family || "Patient",
      },
      gender: response.gender || "unknown",
      birthDate: response.birthDate,
      address: response.address?.[0],
      telecom: response.telecom,
      maritalStatus: response.maritalStatus?.coding?.[0]?.display,
    }
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error)
    throw error
  }
}

// 2b. Fetch patient communications (messages)
// GET https://cdr.fhirlab.net/fhir/Communication?subject=Patient/{{patientId}}&_sort=-sent
export async function fetchPatientCommunications(patientId: string) {
  try {
    const response = await fhirRequest(`Communication?subject=Patient/${patientId}&_sort=-sent`)

    // Handle pagination if needed
    let allCommunications = response.entry?.map((entry: any) => entry.resource) || []
    let nextUrl = response.link?.find((link: any) => link.relation === "next")?.url

    // Follow pagination links if present
    while (nextUrl) {
      const nextPage = await fhirRequest(nextUrl)
      const nextCommunications = nextPage.entry?.map((entry: any) => entry.resource) || []
      allCommunications = [...allCommunications, ...nextCommunications]
      nextUrl = nextPage.link?.find((link: any) => link.relation === "next")?.url
    }

    return allCommunications
  } catch (error) {
    console.error(`Error fetching communications for patient ${patientId}:`, error)
    throw error
  }
}

// 2c. Fetch patient observations
// GET https://cdr.fhirlab.net/fhir/Observation?subject=Patient/{{patientId}}&_sort=-_lastUpdated&_count=20
export async function fetchPatientObservations(patientId: string) {
  try {
    const response = await fhirRequest(`Observation?subject=Patient/${patientId}&_sort=-_lastUpdated&_count=20`)

    return response.entry?.map((entry: any) => entry.resource) || []
  } catch (error) {
    console.error(`Error fetching observations for patient ${patientId}:`, error)
    throw error
  }
}

// 2d. Fetch patient allergies
// GET https://cdr.fhirlab.net/fhir/AllergyIntolerance?patient={{patientId}}
export async function fetchPatientAllergies(patientId: string) {
  try {
    const response = await fhirRequest(`AllergyIntolerance?patient=${patientId}`)

    return response.entry?.map((entry: any) => entry.resource) || []
  } catch (error) {
    console.error(`Error fetching allergies for patient ${patientId}:`, error)
    throw error
  }
}

// 2e. Fetch patient conditions
// GET https://cdr.fhirlab.net/fhir/Condition?subject=Patient/{{patientId}}
export async function fetchPatientConditions(patientId: string) {
  try {
    const response = await fhirRequest(`Condition?subject=Patient/${patientId}`)

    return response.entry?.map((entry: any) => entry.resource) || []
  } catch (error) {
    console.error(`Error fetching conditions for patient ${patientId}:`, error)
    throw error
  }
}

// 2f. Fetch patient medications
// GET https://cdr.fhirlab.net/fhir/MedicationRequest?subject=Patient/{{patientId}}
export async function fetchPatientMedications(patientId: string) {
  try {
    const response = await fhirRequest(`MedicationRequest?subject=Patient/${patientId}`)

    return response.entry?.map((entry: any) => entry.resource) || []
  } catch (error) {
    console.error(`Error fetching medications for patient ${patientId}:`, error)
    throw error
  }
}

// 3. Send a communication (message)
// POST https://cdr.fhirlab.net/fhir/Communication
export async function sendCommunication(communicationResource: any) {
  try {
    // Ensure the resource has the required fields
    const resource = {
      resourceType: "Communication",
      status: "completed",
      sent: new Date().toISOString(),
      ...communicationResource,
    }

    return await fhirRequest("Communication", "POST", resource)
  } catch (error) {
    console.error("Error sending communication:", error)
    throw error
  }
}

// 4. Record an observation (vital sign)
// POST https://cdr.fhirlab.net/fhir/Observation
export async function recordObservation(observationResource: any) {
  try {
    // Ensure the resource has the required fields
    const resource = {
      resourceType: "Observation",
      status: "final",
      ...observationResource,
    }

    return await fhirRequest("Observation", "POST", resource)
  } catch (error) {
    console.error("Error recording observation:", error)
    throw error
  }
}

// 5. Order a medication
// POST https://cdr.fhirlab.net/fhir/MedicationRequest
export async function orderMedication(medicationRequestResource: any) {
  try {
    // Ensure the resource has the required fields
    const resource = {
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      ...medicationRequestResource,
    }

    return await fhirRequest("MedicationRequest", "POST", resource)
  } catch (error) {
    console.error("Error ordering medication:", error)
    throw error
  }
}

// 6. Schedule an appointment
// POST https://cdr.fhirlab.net/fhir/Appointment
export async function scheduleAppointment(appointmentResource: any) {
  try {
    // Ensure the resource has the required fields
    const resource = {
      resourceType: "Appointment",
      status: "booked",
      ...appointmentResource,
    }

    return await fhirRequest("Appointment", "POST", resource)
  } catch (error) {
    console.error("Error scheduling appointment:", error)
    throw error
  }
}

// 7a. Update a resource
// PUT https://cdr.fhirlab.net/fhir/{{ResourceType}}/{{id}}
export async function updateResource(resourceType: string, id: string, resource: any) {
  try {
    return await fhirRequest(`${resourceType}/${id}`, "PUT", resource)
  } catch (error) {
    console.error(`Error updating ${resourceType}/${id}:`, error)
    throw error
  }
}

// 7b. Delete a resource
// DELETE https://cdr.fhirlab.net/fhir/{{ResourceType}}/{{id}}
export async function deleteResource(resourceType: string, id: string) {
  try {
    return await fhirRequest(`${resourceType}/${id}`, "DELETE")
  } catch (error) {
    console.error(`Error deleting ${resourceType}/${id}:`, error)
    throw error
  }
}

// Helper function to retry a failed request with exponential backoff
export async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let retries = 0
  let delay = initialDelay

  while (retries < maxRetries) {
    try {
      return await fn()
    } catch (error) {
      retries++
      if (retries >= maxRetries) throw error

      // Only retry for certain errors (e.g., 429, 503)
      const status = (error as any).status || 0
      if (status !== 429 && status !== 503) throw error

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2
    }
  }
}
