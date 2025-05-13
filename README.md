# FHIRLab Clinical Messenger

A modern, chat-based orchestration platform for FHIR clinical workflows, designed to unify patient care, streamline clinical actions, and integrate seamlessly with FHIRLAB's Terminology Server and a HAPI FHIR server. The whole app was generated 80% on v0 as a proof of concept about VibeCoding on FHIR

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/niccoreyes-projects/v0-ehr-system-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/3z8M8UeDhxn)
---

## Overview

**FHIRLab Clinical Messenger** reimagines the Electronic Health Record (EHR) experience by adopting a chat/messenger paradigm for clinical orchestration powered by V0, an AI web generation platform. Instead of navigating complex forms and disparate modules, clinicians can customize and interact with patient data and perform clinical actions through a unified, conversational interface. This approach enhances usability, supports real-time collaboration, and provides a clear, chronological view of patient care.

### The project is live at:

**[https://vercel.com/niccoreyes-projects/v0-ehr-system-design](https://vercel.com/niccoreyes-projects/v0-ehr-system-design)**

### Build your app

Continue building the app on:

**[https://v0.dev/chat/projects/3z8M8UeDhxn](https://v0.dev/chat/projects/3z8M8UeDhxn)**

## Primary prompt from 


Meta prompt chat: https://chatgpt.com/share/681a01c6-48b8-800f-b4cb-4d441d991be5
```
You are an expert full‑stack health IT architect and UX/UI designer tasked with generating a complete specification and prototype for a next‑generation Electronic Health Record (EHR).  

Your system must:

1. **Front‑end: Chat‑First Interface**  
   - Look and behave exactly like a modern messaging app (e.g., Messenger or Viber).  
   - Display each patient as a chat thread in a left‑hand sidebar, sorted by most recent activity.  
   - Within each thread, show messages, images (e.g., charts, scans), structured forms (e.g., vitals, orders) and quick‑reply buttons (e.g., “Order Lab,” “Schedule Visit”).  
   - Provide separate “Practitioner” and “Patient” view modes—practitioners see clinical data, patients see education and appointment reminders.  
   - Include top‑bar global search (by name, MRN, phone) and a “New Chat” button for creating new patient threads.

2. **Backend: FHIR‑R4 Centric**  
   - Use the public FHIR R4 endpoint at `https://cdr.fhirlab.net/fhir` (no authentication).  
   - Store all patient, practitioner, encounter, observation, medication, and appointment data as FHIR resources.  
   - Implement all CRUD operations via the FHIR REST API (e.g., GET /Patient, POST /Observation).  
   - Normalize inbound chat messages to FHIR resources: free‑text “notes” become `Communication` resources, structured inputs become `Observation` or `MedicationRequest` as appropriate.

3. **Patient‑Centric Features**  
   - On entering a patient thread, automatically fetch and display:  
     - `Patient` demographics (Name, DOB, gender)  
     - Latest `AllergyIntolerance`, `Condition`, and `MedicationStatement` summaries  
     - Recent `Observation` panels (vitals, labs) as interactive cards.  
   - Allow inline updates: sending a quick‑reply “Add Allergy” opens a mini‑form that writes a new `AllergyIntolerance` resource.

4. **Practitioner‑Centric Features**  
   - Sidebar filters: show “My Patients,” “High‑risk,” “Unreviewed Labs.”  
   - In‑thread decision support: detect abnormal `Observation` values and surface guideline links.  
   - One‑click order entry: quick buttons generate a `ServiceRequest` or `MedicationRequest`.

5. **Notifications & Workflows**  
   - Real‑time push when new FHIR `DiagnosticReport` arrives or patient messages.  
   - Reminders: schedule follow‑up `Appointment` via button, generating a `Slot`/`Appointment` resource.  
   - Status badges on threads (e.g., “Unread Lab,” “Needs Sign‑off”).

6. **Voice/Video Integration**  
   - In‑chat call icons that launch WebRTC‑based telehealth sessions.  
   - Automatically create a FHIR `Encounter` resource when a call starts and close it when ended.

7. **Security & Compliance**  
   - All communication encrypted in transit (TLS) and at rest.  
   - Enforce role‑based access control: only practitioners view full clinical data; patients see their own data.  
   - Audit every FHIR interaction and chat message as FHIR `AuditEvent` resources.

8. **Design & UX Best Practices**  
   - Familiar messenger colors, large touch targets, high‑contrast text.  
   - Step‑by‑step onboarding tour that highlights:  
     1. Locating a patient thread  
     2. Reading labs in chat  
     3. Ordering a medication  
     4. Scheduling an appointment  
   - Contextual tooltips and “?” overlays for any clinical term.

**Output Requirements:**  
- **Design Document**: High‑fidelity wireframes of all screens and component specs (sidebar, chat bubbles, quick‑reply buttons, resource panels).  
- **API Mapping**: Table mapping each UI action to specific FHIR REST calls (with example requests/responses against `https://cdr.fhirlab.net/fhir`).  
- **Data Model**: JSON schema snippets for key resources in this app (Patient, Communication, Observation, Appointment, etc.).  
- **Security Plan**: Summary of encryption, RBAC rules, and audit logging.  
- **Implementation Roadmap**: Milestones and technology stack recommendations (React + WebSocket for real‑time, Node.js for FHIR proxy layer, etc.).  
- **Onboarding Guide**: Step‑by‑step flow with screenshots for bootcamp‑style training of boomer doctors.

Use clear, concise language. Structure your output in sections with headings. Provide examples and analogies to messenger apps wherever possible to reduce cognitive load for non‑technical medical staff.
```

- **Audience:**  
  - *Clinical users*: Physicians, nurses, and allied health professionals seeking intuitive, workflow-driven patient management. Clinicians can customize their user experience as hosted & vibe coded on **[https://vercel.com/niccoreyes-projects/v0-ehr-system-design](https://vercel.com/niccoreyes-projects/v0-ehr-system-design)**
  - *Technical users*: Developers and informaticists integrating FHIR-based systems or extending clinical applications with vibe coding.

---

## Key Features from initial prompt


- **Chat/Messenger Interface:**  
  Orchestrate all patient interactions—messages, vitals, medications, conditions, and appointments—within a single, chronological chat timeline.

- **FHIR Resource Integration:**  
  Direct, RESTful integration with a HAPI FHIR server for patient, communication, observation, medication, condition, and appointment resources.

- **Terminology Services:**  
  Real-time search and validation of SNOMED CT, LOINC, and RxNorm codes via a dedicated FHIR Terminology Server. (SNOMED CT - research license)

- **Clinical Action Forms:**  
  Modular forms for recording vitals, ordering medications, documenting conditions, and scheduling appointments—triggered directly from the chat UI.

- **Patient Summary View:**  
  At-a-glance summary of demographics, allergies, conditions, medications, and recent vitals.

- **Mobile-First & Accessible:**  
  Responsive design with accessibility best practices for clinical environments.

- **Extensible Architecture:**  
  Built for future integration with any vibe-codable features and additional FHIR modules.

---

## Architecture

The application is structured as a Next.js (React) frontend, orchestrating clinical workflows through RESTful APIs:

```mermaid
graph TD
    subgraph Frontend (Next.js)
        A[Patient Chat UI]
        B[Clinical Action Forms]
        C[Summary View]
        D[Terminology Search]
    end
    subgraph Backend Services
        E[HAPI FHIR Server<br/>https://cdr.fhirlab.net/fhir]
        F[Terminology Server<br/>https://tx.fhirlab.net/fhir]
    end
    A -- "FHIR REST API" --> E
    B -- "FHIR REST API" --> E
    C -- "FHIR REST API" --> E
    D -- "ValueSet/$expand & $validate-code" --> F
    E <--> F
```

- **Patient Chat UI:** Unifies all patient events (messages, vitals, medications, etc.) in a chat timeline.
- **Clinical Action Forms:** Modular forms for clinical actions, surfaced contextually in the chat.
- **Summary View:** Tabular patient summary for quick review.
- **Terminology Search:** Real-time code search/validation for SNOMED CT, LOINC, RxNorm. (For now it only uses snomed ct research license)

---

## Integrations

- **FHIRLAB (HAPI FHIR Server):**  
  - Endpoint: `https://cdr.fhirlab.net/fhir`
  - Handles all FHIR resource CRUD operations (Patient, Communication, Observation, Condition, MedicationRequest, Appointment, etc.)

- **FHIRLAB Terminology Server:**  
  - Endpoint: `https://tx.fhirlab.net/fhir`
  - Provides ValueSet expansion and code validation for SNOMED CT, LOINC, RxNorm, and more.

- **LIVE Serverless Nextjs**
  - URL: `https://v0-fhir-web-application.vercel.app`
  - Live demo of the actual application

---

## Project Structure

```
.
├── app/                  # Next.js pages and layouts
│   └── dashboard/        # Main clinical dashboard and patient views
├── components/           # UI components (chat, forms, summary, terminology search)
├── lib/                  # API integrations (FHIR, terminology, practitioner)
├── hooks/                # React hooks (e.g., mobile detection, toast)
├── public/               # Static assets
├── styles/               # Global styles (Tailwind CSS)
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

---

## Setup & Usage

### Prerequisites

- Node.js (v18+ recommended)
- pnpm, npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/v0-fhirlab-application.git
cd v0-fhirlab-application

# Install dependencies
pnpm install
# or
npm install
# or
yarn install
# o
bun i
```

### Running Locally

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
# or
bun run dev
```

- The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

By default, the app connects to public FHIRLAB endpoints. For custom deployments, set the following environment variables in a `.env.local` file:

```
NEXT_PUBLIC_FHIR_BASE_URL=https://cdr.fhirlab.net/fhir
NEXT_PUBLIC_TERMINOLOGY_SERVER_URL=https://tx.fhirlab.net/fhir
```

### Deployment

- Deploy to [Vercel](https://vercel.com/) or any platform supporting Next.js.
- The app is stateless and does not require a backend server beyond the FHIR and terminology endpoints.

---

- **Integrate Additional FHIR Modules:**  
  Extend forms and chat events to support new FHIR resource types as needed.

- **Customize Terminology:**  
  Point to custom or private terminology servers for organization-specific vocabularies.
---

## Prerequisite resources

### ValueSet - on Terminology server

```
Diagnostic attachment type
URL: http://hl7.org/fhir/ValueSet/diagnostic-based-on-snomed
```

### Practitioner Resource for Demo - on Main FHIR server

```
{
  "resourceType": "Practitioner",
  "id": "78812",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2025-05-06T15:28:00.209+00:00",
    "source": "#9134def81586e6f5"
  },
  "identifier": [
    {
      "use": "official",
      "system": "http://example.org/staff-ids",
      "value": "staff-id-12345"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Reyes",
      "given": [
        "Thomas"
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+639XXXXXXXXX",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "thomas@example.com",
      "use": "work"
    }
  ],
  "address": [
    {
      "use": "work",
      "text": "123 Example Street, City, Country"
    }
  ],
  "gender": "male"
}
```

---

## TODO fixes:
- Vitals, Medication resources should be configured to a particular valueset available on fhirlab

---

## License

[MIT](LICENSE)

---

## Acknowledgments

- [FHIRLAB](https://fhirlab.net/) for public FHIR and terminology endpoints.
- [HAPI FHIR](https://hapifhir.io/) for the FHIR server implementation.
- [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/) for the frontend stack.
