import { PatientChat } from "@/components/patient-chat"

export default function PatientPage({ params }: { params: { id: string } }) {
  return <PatientChat patientId={params.id} />
}
