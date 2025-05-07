import { redirect } from "next/navigation"

export default function Home() {
  // Skip login and redirect directly to dashboard
  redirect("/dashboard")
}
