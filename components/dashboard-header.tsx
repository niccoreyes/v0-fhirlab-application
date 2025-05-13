"use client"

import type React from "react"

import { useState } from "react"
import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search patients by name, MRN, or phone
    console.log("Searching for:", searchQuery)
  }

  const DEFAULT_PRACTITIONER = {
    name: [{ given: ["John"], family: "Doe" }],
  }

  return (
    <header className="border-b bg-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Desktop search form */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search patients by name, MRN, or phone..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Mobile search form (expandable) */}
      {showSearch && (
        <div className="absolute top-14 left-0 right-0 z-10 bg-white p-2 border-b md:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              Dr. {DEFAULT_PRACTITIONER.name[0].given[0]} {DEFAULT_PRACTITIONER.name[0].family}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Install App</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
