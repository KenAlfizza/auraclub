import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/context/EventContext";
import { useUser } from "@/context/UserContext";
import {
  Calendar,
  FileText,
  ChevronLeft,
  Users,
  MapPin,
  Edit,
  Trash2,
  Coins,
} from "lucide-react";

export function ViewEventPage({ displayType }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    event,
    fetchEvent,
    updateEvent,
    deleteEvent,
    guests,
    rsvpSelf,
    cancelSelfRSVP,
    loading,
    error,
  } = useEvent();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [publishAction, setPublishAction] = useState(null);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [rsvpLoading, setRSVPLoading] = useState(false);

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  // Check if the current user has RSVP'd
  useEffect(() => {
    if (user?.utorid && guests.length > 0) {
      setIsRSVPed(guests.some((g) => g.utorid === user.utorid));
    }
  }, [guests, user]);

  // ----- RSVP / Un-RSVP Handlers -----
  const handleRSVP = async () => {
    if (!id || !user?.utorid) return;
    setRSVPLoading(true);
    try {
      await rsvpSelf(id)
      setIsRSVPed(true);
    } catch (err) {
      console.error("Failed to RSVP:", err);
    } finally {
      setRSVPLoading(false);
    }
  };

  const handleUnRSVP = async () => {
    if (!id || !user?.utorid) return;
    setRSVPLoading(true);
    try {
      const guest = guests.find((g) => g.userId === user.id);
      if (!guest) throw new Error("You haven't RSVP'd yet");
      await cancelSelfRSVP(id)
      setIsRSVPed(false);
    } catch (err) {
      console.error("Failed to cancel RSVP:", err);
    } finally {
      setRSVPLoading(false);
    }
  };

  // ----- Delete Event -----
  const confirmDelete = async () => {
    try {
      await deleteEvent(id);
      setShowDeletePopup(false);
      navigate("/manage/events");
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // ----- Publish/Unpublish Event -----
  const confirmPublish = async () => {
    if (!publishAction) return;
    const newStatus = publishAction === "publish";
    try {
      await updateEvent(id, { published: newStatus });
      await fetchEvent(id);
    } catch (err) {
      console.error("Failed to update publish status:", err);
    } finally {
      setShowPublishPopup(false);
      setPublishAction(null);
    }
  };

  // ----- Render Helpers -----
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

  const renderDeletePopup = () =>
    showDeletePopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <Card className="w-80 p-6 shadow-lg">
          <CardContent className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
            <p className="text-gray-700">
              Are you sure you want to delete this event? This action cannot be
              undone.
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

  const renderPublishPopup = () =>
    showPublishPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <Card className="w-80 p-6 shadow-lg">
          <CardContent className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">
              Confirm {publishAction === "publish" ? "Publish" : "Unpublish"}
            </h3>
            <p className="text-gray-700">
              Are you sure you want to {publishAction} this event?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPublishPopup(false)}
              >
                Cancel
              </Button>
              <Button
                variant={publishAction === "publish" ? "default" : "destructive"}
                onClick={confirmPublish}
              >
                {publishAction === "publish" ? "Publish" : "Unpublish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  // ----- Footer Actions -----
  const renderFooterActions = () => {
    if (displayType === "regular") {
      const eventEnded = new Date() > new Date(event?.endTime);
      const eventFull = event?.capacity <= guests.length;

      return (
        <div className="flex justify-end gap-2 mt-4">
          {!isRSVPed ? (
            <Button
              disabled={eventFull || eventEnded || rsvpLoading}
              onClick={handleRSVP}
            >
              {rsvpLoading ? "RSVPing..." : "RSVP"}
            </Button>
          ) : (
            <Button
              disabled={eventEnded || rsvpLoading}
              onClick={handleUnRSVP}
              variant="destructive"
            >
              {rsvpLoading ? "Cancelling..." : "Un-RSVP"}
            </Button>
          )}
        </div>
      );
    }

    if (displayType === "organizer") {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => console.log("Add Guest")}>Add Guest</Button>
          <Button onClick={() => console.log("Award Points")}>Award Points</Button>
        </div>
      );
    }

    if (displayType === "manager") {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={() => {
              setPublishAction(event?.published ? "unpublish" : "publish");
              setShowPublishPopup(true);
            }}
          >
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
            <EventDetails event={event} guests={guests} displayType={displayType} />
            {renderFooterActions()}
          </CardContent>
        </Card>
        {renderDeletePopup()}
        {renderPublishPopup()}
      </div>
    </Layout>
  );
}

function EventDetails({ event, guests, displayType }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{event?.name ?? "Untitled Event"}</h2>
          <h3 className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={16} /> {event?.location ?? "No location"}
          </h3>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <FileText size={16} /> Description
        </Label>
        <p className="mt-1 text-gray-700 whitespace-pre-wrap">
          {event?.description ?? "No description."}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Calendar size={14} /> Start Time
          </Label>
          <p className="mt-1 text-gray-700">
            {event?.startTime ? new Date(event.startTime).toLocaleString() : "-"}
          </p>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Calendar size={14} /> End Time
          </Label>
          <p className="mt-1 text-gray-700">
            {event?.endTime ? new Date(event.endTime).toLocaleString() : "-"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
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
            {(event?.organizers?.length ?? 0)} organizers · {(guests?.length ?? 0)} guests
          </p>
        </div>
      </div>
    </>
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
