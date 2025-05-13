import { PatientChat } from "@/components/patient-chat"

export default async function PatientPage(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return <PatientChat patientId={params.id} />;
}
