// Type definitions for the application

// Patient types
export interface PatientName {
  given: string[]
  family: string
}

export interface PatientSummary {
  id: string
  name: PatientName
  gender: string
  birthDate?: string
  lastUpdated: string
  lastMessage?: string
  unreadLabs?: boolean
  needsFollowUp?: boolean
}

export interface PatientDetails {
  id: string
  name: PatientName
  gender: string
  birthDate?: string
  address?: any
  telecom?: any[]
  maritalStatus?: string
}

// Communication types
export interface Communication {
  id: string
  status: string
  sent: string
  subject: {
    reference: string
  }
  sender: {
    reference: string
  }
  payload: {
    contentString?: string
  }[]
}

// Observation types
export interface Observation {
  id: string
  status: string
  category?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }[]
  code: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  valueQuantity?: {
    value: number
    unit: string
    system?: string
  }
}

// Allergy types
export interface AllergyIntolerance {
  id: string
  clinicalStatus?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  code?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  patient: {
    reference: string
  }
  reaction?: {
    substance?: {
      coding: {
        system: string
        code: string
        display?: string
      }[]
    }
    manifestation?: {
      coding: {
        system: string
        code: string
        display?: string
      }[]
    }[]
    severity?: string
  }[]
}

// Condition types
export interface Condition {
  id: string
  clinicalStatus?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  code?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  subject: {
    reference: string
  }
  onsetDateTime?: string
}

// Medication types
export interface Medication {
  id: string
  status: string
  intent: string
  medicationCodeableConcept?: {
    coding: {
      system: string
      code: string
      display?: string
    }[]
  }
  subject: {
    reference: string
  }
  dosageInstruction?: {
    text?: string
    timing?: {
      repeat?: {
        frequency?: number
        period?: number
        periodUnit?: string
      }
    }
    doseAndRate?: {
      doseQuantity?: {
        value: number
        unit: string
      }
    }[]
  }[]
}

// Chat message types
export interface ChatMessage {
  id: string
  text: string
  sender: "patient" | "practitioner" | "system"
  timestamp: string
  type: "text" | "observation" | "medication" | "appointment"
  data?: any
  pending?: boolean
}
