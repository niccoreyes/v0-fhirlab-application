"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Send, Calendar, FileText, Pill, Activity, AlertCircle, ChevronDown, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import {
  fetchPatientDetails,
  fetchPatientCommunications,
  fetchPatientObservations,
  fetchPatientAllergies,
  fetchPatientConditions,
  fetchPatientMedications,
  sendCommunication,
  recordObservation,
  orderMedication,
  scheduleAppointment,
} from "@/lib/fhir-api"
import type { PatientDetails, Observation, AllergyIntolerance, Condition, Medication, ChatMessage } from "@/lib/types"
import { VitalSignForm } from "@/components/vital-sign-form"
import { MedicationOrderForm } from "@/components/medication-order-form"
import { AppointmentForm } from "@/components/appointment-form"
import { ConditionForm } from "@/components/condition-form"
import { fetchPractitionerDetails, DEFAULT_PRACTITIONER, type PractitionerDetails } from "@/lib/practitioner-api"

interface PatientChatProps {
  patientId: string
}

export function PatientChat({ patientId }: PatientChatProps) {
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [allergies, setAllergies] = useState<AllergyIntolerance[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [practitioner, setPractitioner] = useState<PractitionerDetails>(DEFAULT_PRACTITIONER)

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"))
  }, [])

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true)

        // Fetch patient details
        const patientData = await fetchPatientDetails(patientId)
        setPatient(patientData)

        // Fetch communications (messages)
        const communications = await fetchPatientCommunications(patientId)

        // Fetch observations
        const observationsData = await fetchPatientObservations(patientId)
        setObservations(observationsData)

        // Fetch allergies
        const allergiesData = await fetchPatientAllergies(patientId)
        setAllergies(allergiesData)

        // Fetch conditions
        const conditionsData = await fetchPatientConditions(patientId)
        setConditions(conditionsData)

        // Fetch medications
        const medicationsData = await fetchPatientMedications(patientId)
        setMedications(medicationsData)

        // Convert communications to chat messages
        const chatMessages = communications.map((comm) => ({
          id: comm.id,
          text: comm.payload?.[0]?.contentString || "",
          sender: comm.sender?.reference?.includes("Practitioner") ? "practitioner" : "patient",
          timestamp: comm.sent,
          type: "text",
        }))

        // Add observations as system messages
        observationsData.forEach((obs) => {
          if (obs.category?.[0]?.coding?.[0]?.code === "vital-signs") {
            chatMessages.push({
              id: obs.id,
              text: `${obs.code?.coding?.[0]?.display || "Observation"}: ${obs.valueQuantity?.value} ${
                obs.valueQuantity?.unit
              }`,
              sender: "system",
              timestamp: obs.effectiveDateTime,
              type: "observation",
              data: obs,
            })
          }
        })

        // Sort messages by timestamp
        chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        setMessages(chatMessages)
      } catch (error) {
        console.error("Error loading patient data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      loadPatientData()
    }
  }, [patientId, toast])

  useEffect(() => {
    const loadPractitionerData = async () => {
      try {
        const practitionerData = await fetchPractitionerDetails("78812")
        setPractitioner(practitionerData)
      } catch (error) {
        console.error("Error loading practitioner data:", error)
        // Keep using the default practitioner data
      }
    }

    loadPractitionerData()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !patient) return

    try {
      const tempId = `temp-${Date.now()}`
      const tempMessage: ChatMessage = {
        id: tempId,
        text: newMessage,
        sender: "practitioner",
        timestamp: new Date().toISOString(),
        type: "text",
        pending: true,
      }

      // Optimistically add message to UI
      setMessages((prev) => [...prev, tempMessage])
      setNewMessage("")

      // Send message to FHIR server with the specific Practitioner ID
      const communicationResource = {
        resourceType: "Communication",
        status: "completed",
        sent: new Date().toISOString(),
        subject: { reference: `Patient/${patientId}` },
        sender: { reference: `Practitioner/${practitioner.id}` },
        payload: [{ contentString: newMessage }],
      }

      // POST to FHIR server
      const response = await sendCommunication(communicationResource)

      // Replace temp message with actual message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                id: response.id,
                text: newMessage,
                sender: "practitioner",
                timestamp: response.sent,
                type: "text",
              }
            : msg,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })

      // Remove the pending message on error
      setMessages((prev) => prev.filter((msg) => !msg.pending))
    }
  }

  // Updated to use the new terminology-based vital sign form
  const handleRecordVitalSign = async (vitalData: any) => {
    try {
      const observationResource = {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: vitalData.system,
              code: vitalData.loincCode,
              display: vitalData.display,
            },
          ],
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: vitalData.value,
          unit: vitalData.unit,
          system: "http://unitsofmeasure.org",
        },
      }

      // POST to FHIR server
      const response = await recordObservation(observationResource)

      // Add the new observation to the messages
      const newObservationMessage: ChatMessage = {
        id: response.id,
        text: `${vitalData.display}: ${vitalData.value} ${vitalData.unit}`,
        sender: "system",
        timestamp: response.effectiveDateTime,
        type: "observation",
        data: response,
      }

      setMessages((prev) => [...prev, newObservationMessage])
      setObservations((prev) => [...prev, response])
      setActiveForm(null)

      toast({
        title: "Success",
        description: `Recorded ${vitalData.display}`,
      })
    } catch (error) {
      console.error("Error recording vital sign:", error)
      toast({
        title: "Error",
        description: "Failed to record vital sign. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Updated to use the new terminology-based medication form
  const handleOrderMedication = async (medicationData: any) => {
    try {
      const medicationRequestResource = {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          coding: [
            {
              system: medicationData.system,
              code: medicationData.rxnormCode,
              display: medicationData.medicationName,
            },
          ],
        },
        subject: { reference: `Patient/${patientId}` },
        requester: { reference: `Practitioner/${practitioner.id}` },
        dosageInstruction: [
          {
            text: medicationData.dosageInstructions,
            timing: {
              repeat: {
                frequency: medicationData.frequency,
                period: 1,
                periodUnit: "d",
              },
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: medicationData.dose,
                  unit: medicationData.doseUnit,
                },
              },
            ],
          },
        ],
      }

      // POST to FHIR server
      const response = await orderMedication(medicationRequestResource)

      // Add medication order as a system message
      const newMedicationMessage: ChatMessage = {
        id: response.id,
        text: `Medication ordered: ${medicationData.medicationName}, ${medicationData.dose} ${medicationData.doseUnit}, ${medicationData.dosageInstructions}`,
        sender: "system",
        timestamp: new Date().toISOString(),
        type: "medication",
        data: response,
      }

      setMessages((prev) => [...prev, newMedicationMessage])
      setActiveForm(null)

      toast({
        title: "Success",
        description: `Medication order for ${medicationData.medicationName} created successfully`,
      })
    } catch (error) {
      console.error("Error ordering medication:", error)
      toast({
        title: "Error",
        description: "Failed to order medication. Please try again.",
        variant: "destructive",
      })
    }
  }

  // New function to handle recording conditions
  const handleRecordCondition = async (conditionData: any) => {
    try {
      // Create the condition resource
      const conditionResource = {
        resourceType: "Condition",
        ...conditionData,
        recordedDate: new Date().toISOString(),
        recorder: { reference: `Practitioner/${practitioner.id}` },
      }

      // POST to FHIR server - we'll need to add this function to fhir-api.ts
      const response = await fetch(`https://cdr.fhirlab.net/fhir/Condition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Accept: "application/fhir+json",
        },
        body: JSON.stringify(conditionResource),
      })

      if (!response.ok) {
        throw new Error(`FHIR API error (${response.status})`)
      }

      const result = await response.json()

      // Add condition as a system message
      const newConditionMessage: ChatMessage = {
        id: result.id,
        text: `Condition recorded: ${conditionData.code.coding[0].display} (${conditionData.clinicalStatus.coding[0].display})`,
        sender: "system",
        timestamp: new Date().toISOString(),
        type: "condition",
        data: result,
      }

      setMessages((prev) => [...prev, newConditionMessage])
      setConditions((prev) => [...prev, result])
      setActiveForm(null)

      toast({
        title: "Success",
        description: `Condition ${conditionData.code.coding[0].display} recorded successfully`,
      })
    } catch (error) {
      console.error("Error recording condition:", error)
      toast({
        title: "Error",
        description: "Failed to record condition. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleScheduleAppointment = async (appointmentData: any) => {
    try {
      const appointmentResource = {
        resourceType: "Appointment",
        status: "booked",
        start: appointmentData.startTime,
        end: appointmentData.endTime,
        participant: [
          {
            actor: { reference: `Patient/${patientId}` },
            status: "accepted",
          },
          {
            actor: { reference: `Practitioner/${practitioner.id}` },
            status: "accepted",
          },
        ],
        description: appointmentData.description,
      }

      // POST to FHIR server
      const response = await scheduleAppointment(appointmentResource)

      // Add appointment as a system message
      const newAppointmentMessage: ChatMessage = {
        id: response.id,
        text: `Appointment scheduled: ${format(new Date(appointmentData.startTime), "MMM d, yyyy 'at' h:mm a")} - ${
          appointmentData.description
        }`,
        sender: "system",
        timestamp: new Date().toISOString(),
        type: "appointment",
        data: response,
      }

      setMessages((prev) => [...prev, newAppointmentMessage])
      setActiveForm(null)

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      })
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <Skeleton className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-lg`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Patient Not Found</h2>
          <p className="text-gray-600 mt-2">The requested patient could not be found.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Render the chat interface
  const renderChatContent = () => (
    <div className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "patient"
                  ? "justify-start"
                  : message.sender === "practitioner"
                    ? "justify-end"
                    : "justify-center"
              }`}
            >
              {message.type === "text" ? (
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "patient"
                      ? "bg-gray-100 text-gray-900"
                      : message.sender === "practitioner"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                  } ${message.pending ? "opacity-70" : ""}`}
                >
                  {message.sender === "practitioner" && (
                    <p className="text-xs opacity-70 mb-1">
                      Dr. {practitioner.name[0].given[0]} {practitioner.name[0].family}
                    </p>
                  )}
                  <p>{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">{format(new Date(message.timestamp), "h:mm a")}</p>
                </div>
              ) : message.type === "observation" ? (
                <Card className="w-full max-w-md">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Vital Sign Recorded
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-sm font-medium">{message.text}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </CardContent>
                </Card>
              ) : message.type === "medication" ? (
                <Card className="w-full max-w-md">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Pill className="h-4 w-4 mr-1" />
                      Medication Ordered
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-sm font-medium">{message.text}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </CardContent>
                </Card>
              ) : message.type === "condition" ? (
                <Card className="w-full max-w-md">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Condition Recorded
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-sm font-medium">{message.text}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </CardContent>
                </Card>
              ) : message.type === "appointment" ? (
                <Card className="w-full max-w-md">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Appointment Scheduled
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-sm font-medium">{message.text}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {activeForm === "vital-sign" && (
        <div className="p-4 border-t bg-gray-50">
          <VitalSignForm onSubmit={handleRecordVitalSign} onCancel={() => setActiveForm(null)} />
        </div>
      )}

      {activeForm === "medication" && (
        <div className="p-4 border-t bg-gray-50">
          <MedicationOrderForm onSubmit={handleOrderMedication} onCancel={() => setActiveForm(null)} />
        </div>
      )}

      {activeForm === "condition" && (
        <div className="p-4 border-t bg-gray-50">
          <ConditionForm patientId={patientId} onSubmit={handleRecordCondition} onCancel={() => setActiveForm(null)} />
        </div>
      )}

      {activeForm === "appointment" && (
        <div className="p-4 border-t bg-gray-50">
          <AppointmentForm onSubmit={handleScheduleAppointment} onCancel={() => setActiveForm(null)} />
        </div>
      )}

      <div className="p-4 border-t bg-white">
        {activeForm === null && (
          <>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setActiveForm("vital-sign")}>
                <Activity className="h-4 w-4 mr-1" />
                Record Vital
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setActiveForm("medication")}>
                <Pill className="h-4 w-4 mr-1" />
                Order Medication
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setActiveForm("condition")}>
                <Stethoscope className="h-4 w-4 mr-1" />
                Record Condition
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => setActiveForm("appointment")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Appointment
              </Button>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="min-h-10 max-h-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )

  // Render the summary content
  const renderSummaryContent = () => (
    <div className="h-full p-4 overflow-auto">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd>
                  {patient.name.given.join(" ")} {patient.name.family}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="capitalize">{patient.gender}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd>{patient.birthDate ? format(new Date(patient.birthDate), "MMM d, yyyy") : "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">MRN</dt>
                <dd>{patient.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 font-medium">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Allergies ({allergies.length})
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {allergies.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No known allergies</p>
            ) : (
              <ul className="space-y-2">
                {allergies.map((allergy) => (
                  <li key={allergy.id} className="p-2 bg-gray-50 rounded-md">
                    <p className="font-medium">{allergy.code?.coding[0]?.display || "Unspecified Allergy"}</p>
                    <p className="text-sm text-gray-600">Severity: {allergy.reaction?.[0]?.severity || "Unknown"}</p>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 font-medium">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Conditions ({conditions.length})
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {conditions.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No active conditions</p>
            ) : (
              <ul className="space-y-2">
                {conditions.map((condition) => (
                  <li key={condition.id} className="p-2 bg-gray-50 rounded-md">
                    <p className="font-medium">{condition.code?.coding[0]?.display || "Unspecified Condition"}</p>
                    <p className="text-sm text-gray-600">
                      Status: {condition.clinicalStatus?.coding[0]?.display || "Unknown"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 font-medium">
            <div className="flex items-center">
              <Pill className="h-4 w-4 mr-2 text-green-500" />
              Medications ({medications.length})
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {medications.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No active medications</p>
            ) : (
              <ul className="space-y-2">
                {medications.map((medication) => (
                  <li key={medication.id} className="p-2 bg-gray-50 rounded-md">
                    <p className="font-medium">
                      {medication.medicationCodeableConcept?.coding[0]?.display || "Unspecified Medication"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Dosage: {medication.dosageInstruction?.[0]?.text || "As directed"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 font-medium">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-purple-500" />
              Recent Vitals
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {observations.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No recent vital signs</p>
            ) : (
              <div className="space-y-4">
                {observations
                  .filter((obs) => obs.category?.[0]?.coding?.[0]?.code === "vital-signs")
                  .slice(0, 5)
                  .map((observation) => (
                    <div key={observation.id} className="p-2 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{observation.code?.coding[0]?.display || "Observation"}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(observation.effectiveDateTime), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {observation.valueQuantity?.value} {observation.valueQuantity?.unit}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {patient.name.given[0]?.[0] || ""}
            {patient.name.family?.[0] || ""}
          </div>
          <div>
            <h2 className="font-medium">
              {patient.name.given.join(" ")} {patient.name.family}
            </h2>
            <p className="text-sm text-gray-500">
              {patient.gender}, {patient.birthDate ? format(new Date(patient.birthDate), "MMM d, yyyy") : "Unknown DOB"}
            </p>
          </div>
        </div>
        <div>
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} className="flex-1 flex flex-col h-full" onValueChange={setActiveTab}>
          <TabsContent value="chat" className="flex-1 m-0 p-0 h-full">
            {renderChatContent()}
          </TabsContent>
          <TabsContent value="summary" className="flex-1 m-0 p-0 h-full">
            {renderSummaryContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
