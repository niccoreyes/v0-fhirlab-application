"use client"
import { useRouter, usePathname } from "next/navigation"
import { Users, AlertTriangle, FileText, Plus, X } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
  useSidebarNew,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PatientList } from "@/components/patient-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import the DEFAULT_PRACTITIONER
import { DEFAULT_PRACTITIONER } from "@/lib/practitioner-api"

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { close, isMobile } = useSidebarNew()

  // Handle patient selection and navigation
  const handlePatientSelect = (patientId: string) => {
    router.push(`/dashboard/patient/${patientId}`)
    if (isMobile) {
      close()
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">HealthChat</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push("/dashboard/new-patient")
                if (isMobile) close()
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">New</span>
            </Button>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={close}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Tabs defaultValue="my-patients" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="my-patients">My Patients</TabsTrigger>
              <TabsTrigger value="high-risk">High Risk</TabsTrigger>
              <TabsTrigger value="unreviewed">Unreviewed</TabsTrigger>
            </TabsList>
            <TabsContent value="my-patients" className="mt-2">
              <PatientList filter="my-patients" onPatientSelect={close} />
            </TabsContent>
            <TabsContent value="high-risk" className="mt-2">
              <PatientList filter="high-risk" onPatientSelect={close} />
            </TabsContent>
            <TabsContent value="unreviewed" className="mt-2">
              <PatientList filter="unreviewed" onPatientSelect={close} />
            </TabsContent>
          </Tabs>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => {
                      router.push("/dashboard/patients")
                      if (isMobile) close()
                    }}
                  >
                    <Users className="h-4 w-4" />
                    <span>All Patients</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => {
                      router.push("/dashboard/alerts")
                      if (isMobile) close()
                    }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Critical Alerts</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => {
                      router.push("/dashboard/reports")
                      if (isMobile) close()
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Reports</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {DEFAULT_PRACTITIONER.name[0].given[0]?.[0] || ""}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Dr. {DEFAULT_PRACTITIONER.name[0].given[0]} {DEFAULT_PRACTITIONER.name[0].family}
            </p>
            <p className="text-xs text-gray-500 truncate">Practitioner</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
