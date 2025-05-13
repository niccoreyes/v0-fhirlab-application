"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { createContext, useContext, useState, useEffect } from "react"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "100%"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Context for sidebar state
type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile when component mounts
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On larger screens, default to open
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggle = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  return <SidebarContext.Provider value={{ isOpen, toggle, close, open, isMobile }}>{children}</SidebarContext.Provider>
}

export function useSidebarNew() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebarNew must be used within a SidebarProvider")
  }
  return context
}

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, isMobile, close } = useSidebarNew()

  // Handle sheet close event - moved outside conditional rendering
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      close()
    }
  }

  // For mobile, use a Sheet component instead of a fixed sidebar
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="left" className="p-0 w-[85%] max-w-[400px]" {...props}>
          <div className={cn("h-full flex flex-col", className)}>{props.children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  // For desktop, use the regular sidebar
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-sidebar-background transition-transform duration-300 ease-in-out md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t", className)} {...props} />
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebarNew()

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600",
        className,
      )}
      aria-label="Toggle sidebar"
      {...props}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-2", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-3 py-2 text-xs font-medium text-gray-500", className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenuButton({
  className,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  if (asChild) {
    return props.children
  }

  return (
    <button
      {...props}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        className,
      )}
    />
  )
}

// Legacy sidebar components for backward compatibility
// These are simplified to avoid the same hook errors

type SidebarState = "open" | "collapsed"

type SidebarContextOldType = {
  state: SidebarState
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContextOld = createContext<SidebarContextOldType | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContextOld)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  if (asChild) {
    return (
      <Slot
        ref={ref}
        data-sidebar="menu-action"
        className={cn(
          "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <button
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

// Export other components that were previously defined
// These are simplified to avoid the same hook errors
export { useSidebar }
