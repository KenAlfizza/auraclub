import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, setHours, setMinutes, setSeconds } from "date-fns";

import Layout from "@/pages/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

import { ChevronLeft, MapPin, Users, Award, Clock, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useEvent } from "@/context/EventContext";

export function CreateEventPage() {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvent();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: "",
    startDate: null,
    startTime: "",
    endDate: null,
    endTime: "",
    pointsTotal: "",
    published: false,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Combine date + time into ISO string
  const getDateTimeISO = (date, time) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const dt = setSeconds(setMinutes(setHours(date, hours), minutes), 0);
    return dt.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const startTimeISO = getDateTimeISO(formData.startDate, formData.startTime);
      const endTimeISO = getDateTimeISO(formData.endDate, formData.endTime);

      await createEvent({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim(),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        startTime: startTimeISO,
        endTime: endTimeISO,
        pointsTotal: formData.pointsTotal ? parseInt(formData.pointsTotal) : null,
        published: formData.published,
      });

      setMessage("Event created successfully!");
      setMessageType("success");

      setTimeout(() => navigate("/manage/events"), 2000);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create event. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate("/manage/events")}
          />
          <div>
            <Label className="text-3xl font-bold">Create Event</Label>
            <p className="text-gray-600 mt-1">Set up a new point-earning event for users</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardContent className="p-6">
            {message && (
              <Alert variant={messageType === "error" ? "destructive" : "default"} className="mb-6">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Event Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter event name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location *
                </Label>
                <Input
                  id="location"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Capacity *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Maximum number of guests"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  min="1"
                  required
                />
              </div>

              {/* Start Date & Time */}
              <div className="flex flex-col gap-2 w-full">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Start Time *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  step="60"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col gap-2 w-full">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> End Time *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  step="60"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>

              {/* Total pointsTotal */}
              <div className="space-y-2">
                <Label htmlFor="pointsTotal" className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> Total Points Allocated *
                </Label>
                <Input
                  id="pointsTotal"
                  type="number"
                  placeholder="Total points pool for this event"
                  value={formData.pointsTotal}
                  onChange={(e) => setFormData({ ...formData, pointsTotal: e.target.value })}
                  min="1"
                  required
                />
              </div>

              {/* Publish */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Publish Event</Label>
                  <p className="text-sm text-gray-500">Make this event visible to users immediately</p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-row gap-2 justify-end pt-4">
                <Button type="submit" className="bg-[#86D46E] hover:bg-[#75c35d]" disabled={loading}>
                  {loading ? "Creating..." : "Create Event"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to discard this event? All data will be lost.")) {
                      navigate("/manage/events");
                    }
                  }}
                  className="bg-[#D46E6E] hover:bg-[#c35d5d]"
                  disabled={loading}
                >
                  Discard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default CreateEventPage;
