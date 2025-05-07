"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent, role: string) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would validate credentials against an auth service
      // For demo purposes, we're just redirecting to the dashboard
      setTimeout(() => {
        localStorage.setItem("userRole", role)
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <Tabs defaultValue="practitioner">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="practitioner">Practitioner</TabsTrigger>
            <TabsTrigger value="patient">Patient</TabsTrigger>
          </TabsList>
          <CardDescription className="pt-4">Sign in to access your HealthChat account</CardDescription>
        </CardHeader>
        <CardContent>
          <TabsContent value="practitioner">
            <form onSubmit={(e) => handleLogin(e, "practitioner")}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="practitioner-email">Email</Label>
                  <Input id="practitioner-email" type="email" placeholder="doctor@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="practitioner-password">Password</Label>
                  <Input id="practitioner-password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in as Practitioner"}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="patient">
            <form onSubmit={(e) => handleLogin(e, "patient")}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input id="patient-email" type="email" placeholder="patient@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patient-password">Password</Label>
                  <Input id="patient-password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in as Patient"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">Demo credentials are pre-filled. Just click Sign in.</div>
        </CardFooter>
      </Tabs>
    </Card>
  )
}
