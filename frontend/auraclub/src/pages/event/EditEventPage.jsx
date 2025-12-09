import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, setHours, setMinutes, setSeconds, parseISO } from "date-fns";

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

export function EditEventPage({ displayType }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { event, fetchEvent, updateEvent, loading } = useEvent();

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

  // Load event data when available
  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        location: event.location || "",
        capacity: event.capacity || "",
        startDate: event.startTime ? parseISO(event.startTime) : null,
        startTime: event.startTime ? format(parseISO(event.startTime), "HH:mm") : "",
        endDate: event.endTime ? parseISO(event.endTime) : null,
        endTime: event.endTime ? format(parseISO(event.endTime), "HH:mm") : "",
        pointsTotal: event.pointsTotal || "",
        published: event.published || false,
      });
    }
  }, [event]);

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

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim(),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      // Manager-only fields
      if (displayType === "manager") {
        payload.points = formData.pointsTotal ? parseInt(formData.pointsTotal) : null;
        payload.published = formData.published;
      }

      await updateEvent(event.id, payload);

      setMessage("Event updated successfully!");
      setMessageType("success");

      setTimeout(() => navigate("/manage/events"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to update event. Please try again.");
      setMessageType("error");
    }
  };

  if (!event && !loading) {
    return (
      <Layout header sidebar>
        <div className="text-center mt-16 text-gray-500">Event not found.</div>
      </Layout>
    );
  }

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <div 
            className="rounded-full hover:bg-gray-100 p-2 cursor-pointer flex items-center justify-center"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-8 h-8 text-gray-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Guests & RSVPs</h1>
            <p className="text-gray-500 mt-1">
              Add guests, RSVP users, or mark attendance for this event
            </p>
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

              {/* Start & End */}
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Start Time *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> End Time *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                  />
                </div>
              </div>

              {/* Total points */}
              {displayType === "manager" && (
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
              )}

              {/* Publish */}
              {displayType === "manager" && (
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
              )}

              {/* Buttons */}
              <div className="flex flex-row gap-2 justify-end pt-4">
                <Button type="submit" className="bg-[#86D46E] hover:bg-[#75c35d]" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/manage/events")}
                  className="bg-[#D46E6E] hover:bg-[#c35d5d]"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default EditEventPage;
