import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col md:flex-row">
        {/* Sidebar is rendered here but will be a Sheet on mobile */}
        <DashboardSidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
