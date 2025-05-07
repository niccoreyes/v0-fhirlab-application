"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { addMinutes, format, addDays } from "date-fns"

interface AppointmentFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AppointmentForm({ onSubmit, onCancel }: AppointmentFormProps) {
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"))
  const [time, setTime] = useState("09:00")
  const [duration, setDuration] = useState("30")
  const [appointmentType, setAppointmentType] = useState("Follow-up")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create start and end times
    const startDate = new Date(`${date}T${time}`)
    const endDate = addMinutes(startDate, Number.parseInt(duration))

    onSubmit({
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      appointmentType,
      description: description || appointmentType,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Appointment</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointment-type">Appointment Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger id="appointment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Annual Physical">Annual Physical</SelectItem>
                <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                <SelectItem value="Specialist Consult">Specialist Consult</SelectItem>
                <SelectItem value="Lab Review">Lab Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the appointment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Schedule</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
