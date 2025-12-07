import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/context/EventContext";
import {
  CalendarPlus,
  Calendar,
  FileText,
  ChevronLeft,
  Users,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Coins,
} from "lucide-react";

export function ViewEventPage({ displayType }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { event, fetchEvent, deleteEvent, updateEvent, loading, error } = useEvent();

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  if (!event && !loading) {
    return (
      <Layout header sidebar>
        <div className="text-center mt-16 text-gray-500">Event not found.</div>
      </Layout>
    );
  }

  const confirmDelete = async () => {
    try {
      await deleteEvent(id);
      setShowDeletePopup(false);
      navigate("/manage/events"); // Go back to events list
    } catch (err) {
      // Error is already set in context, StatusBanner will show it
    }
  };

  const confirmPublish = async () => {
    if (!publishAction) return;

    const newStatus = publishAction === "publish";

    await updateEvent(id, { published: newStatus });

    setShowPublishPopup(false);
    setPublishAction(null);
  };

  const renderHeader = () => (
    <div className="flex flex-row items-center gap-4">
      <ChevronLeft
        className="hover:cursor-pointer scale-125"
        onClick={() =>
          displayType === "manager"
            ? navigate("/manage/events")
            : navigate("/events")
        }
      />
      <div>
        <Label className="text-3xl font-bold">Event Details</Label>
        <p className="text-gray-600 mt-1">
          {displayType === "manager"
            ? "View and manage this event"
            : displayType === "organizer"
            ? "Manage your event"
            : "View this event"}
        </p>
      </div>
    </div>
  );

   const renderPublishPopup = () => {
    if (!showPublishPopup) return null;
    const isPublish = publishAction === "publish";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <Card className="w-80 p-6 shadow-lg">
          <CardContent className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">
              Confirm {isPublish ? "Publish" : "Unpublish"}
            </h3>
            <p className="text-gray-700">
              Are you sure you want to {isPublish ? "publish" : "unpublish"} this event?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPublishPopup(false)}>
                Cancel
              </Button>
              <Button
                variant={isPublish ? "default" : "destructive"}
                onClick={confirmPublish}
              >
                {isPublish ? "Publish" : "Unpublish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDeletePopup = () => {
    if (!showDeletePopup) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <Card className="w-80 p-6 shadow-lg">
          <CardContent className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
            <p className="text-gray-700">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEventDetails = () => (
    <>
      {/* Title + Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar size={20} /> {event?.name ?? "Untitled Event"}
          </h2>
          <h3 className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={16} /> {event?.location ?? "No location"}
          </h3>
        </div>

        {(displayType === "organizer" || displayType === "manager") && (
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/manage/events/${id}/edit`)}>
              <Edit />
            </Button>
            {displayType === "manager" && (
              <Button
                variant="destructive"
                onClick={() => setShowDeletePopup(true)}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <FileText size={16} /> Description
        </Label>
        <p className="mt-1 text-gray-700 whitespace-pre-wrap">
          {event?.description ?? "No description."}
        </p>
      </div>

      {/* Event Grid Details */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Clock size={14} /> Start Time
            </Label>
            <p className="mt-1 text-gray-700">
              {event?.startTime
                ? new Date(event.startTime).toLocaleString()
                : "-"}
            </p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Clock size={14} /> End Time
            </Label>
            <p className="mt-1 text-gray-700">
              {event?.endTime ? new Date(event.endTime).toLocaleString() : "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Users size={14} /> Capacity
            </Label>
            <p className="mt-1 text-gray-700">{event?.capacity ?? "-"}</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Users size={14} /> Organizers / Guests
            </Label>
            <p className="mt-1 text-gray-700">
              {(event?.organizersCount ?? 0)} organizers ·{" "}
              {(event?.guestsCount ?? 0)} guests
            </p>
          </div>
        </div>

        {(displayType === "organizer" || displayType === "manager") && (
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Coins size={14} /> Points Total
              </Label>
              <p className="mt-1 text-gray-700">{event?.pointsTotal ?? "-"}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Coins size={14} /> Remaining Points
              </Label>
              <p className="mt-1 text-gray-700">{event?.pointsRemain ?? "-"}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderFooterActions = () => {
    if (displayType === "regular") {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            disabled={
              event?.capacity <= event?.guestsCount ||
              new Date() > new Date(event?.endTime)
            }
            onClick={() => console.log("RSVP")}
          >
            RSVP
          </Button>
          <Button
            disabled={new Date() > new Date(event?.endTime)}
            onClick={() => console.log("Un-RSVP")}
          >
            Un-RSVP
          </Button>
        </div>
      );
    }

    if (displayType === "organizer") {
      return (
        <div className="flex gap-2 mt-4">
          <Button onClick={() => console.log("Add Guest")}>Add Guest</Button>
          <Button onClick={() => console.log("Award Points")}>Award Points</Button>
        </div>
      );
    }

    if (displayType === "manager") {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={renderPublishPopup}>
            {event?.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      );
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 mx-auto">
        {renderHeader()}
        <StatusBanner loading={loading} error={error} />
        <Card>
          <CardContent className="space-y-6 p-6">
            {renderEventDetails()}
            {renderFooterActions()}
          </CardContent>
        </Card>
        {renderDeletePopup()}
      </div>
    </Layout>
  );
}

function StatusBanner({ loading, error }) {
  if (!loading && !error) return null;

  return (
    <div className="w-full mb-4">
      {loading && (
        <div className="w-full bg-blue-100 text-blue-700 p-3 rounded-md">
          Loading...
        </div>
      )}

      {error && (
        <div className="w-full bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
      )}
    </div>
  );
}

export default ViewEventPage;
