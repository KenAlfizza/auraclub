import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/context/EventContext";

// Icons used in CreateEventPage
import {
  CalendarPlus,
  CalendarDays,
  Tag,
  FileText,
  ChevronLeft,
  Users,
  MapPin,
  Hash,
  CreditCard,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";

export function ViewEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { event, fetchEvent, loading, error } = useEvent();

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
            <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate("/manage/events")}
            />
            <div>
            <Label className="text-3xl font-bold">Event Details</Label>
            <p className="text-gray-600 mt-1">View and manage this event</p>
            </div>
        </div>

        {/* Status Banner */}
        <StatusBanner loading={loading} error={error} />

        {/* Main Card */}
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Title + Actions */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Tag size={18} /> {event?.name ?? "Untitled Event"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{event?.location ?? "No location"}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(`/manage/events/edit/${id}`)}>
                  <Edit/>
                </Button>
                <Button variant="destructive" onClick={() => console.log("delete", id)}>
                  <Trash2/>
                </Button>
              </div>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <FileText size={16} /> Description
                  </Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{event?.description ?? "No description."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <Clock size={14} /> Start Time
                    </Label>
                    <p className="mt-1 text-gray-700">{event?.startTime ? new Date(event.startTime).toLocaleString() : "-"}</p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <Clock size={14} /> End Time
                    </Label>
                    <p className="mt-1 text-gray-700">{event?.endTime ? new Date(event.endTime).toLocaleString() : "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <Hash size={14} /> Capacity
                    </Label>
                    <p className="mt-1 text-gray-700">{event?.capacity ?? "-"}</p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <CreditCard size={14} /> Points Total
                    </Label>
                    <p className="mt-1 text-gray-700">{event?.pointsTotal ?? "-"}</p>
                  </div>
                </div>

              </div>

              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin size={16} /> Location
                  </Label>
                  <p className="mt-1 text-gray-700">{event?.location ?? "-"}</p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Users size={16} /> Organizers / Guests
                  </Label>
                  <p className="mt-1 text-gray-700">{(event?.organizersCount ?? 0)} organizers · {(event?.guestsCount ?? 0)} guests</p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarPlus size={16} /> Remaining Points
                  </Label>
                  <p className="mt-1 text-gray-700">{event?.pointsRemain ?? "-"}</p>
                </div>

              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2">
              <Button onClick={() => console.log("toggle publish", id)}>
                {event?.published ? "Unpublish" : "Publish"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatusBanner({ loading, error }) {
  if (!loading && !error) return null;

  return (
    <div className="w-full mb-4">
      {loading && (
        <div className="w-full bg-blue-100 text-blue-700 p-3 rounded-md">Loading...</div>
      )}

      {error && (
        <div className="w-full bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
      )}
    </div>
  );
}

export default ViewEventPage;
