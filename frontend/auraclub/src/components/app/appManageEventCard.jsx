import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Calendar,
  MapPin,
  Coins,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { format } from "date-fns";

export default function AppManageEventCard({
  id,
  name,
  location,
  startTime,
  endTime,
  capacity,
  pointsRemain,
  pointsAwarded,
  published,
  organizersCount,
  onDelete, // keep same delete logic
}) {
  const navigate = useNavigate();
  const { updateEvent } = useEvent();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [publishAction, setPublishAction] = useState(null); // "publish" | "unpublish"

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  const formatTime = (date) => {
    try {
      return format(new Date(date), "h:mm a");
    } catch {
      return "-";
    }
  };

  const confirmPublish = async () => {
    if (!publishAction) return;

    const newStatus = publishAction === "publish";

    await updateEvent(id, { published: newStatus });

    setShowPublishPopup(false);
    setPublishAction(null);
  };

  const renderPublishPopup = () => {
    if (!showPublishPopup) return null;

    const isPublish = publishAction === "publish";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            Confirm {isPublish ? "Publish" : "Unpublish"}
          </h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to {isPublish ? "publish" : "unpublish"} this event?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPublishPopup(false)}>
              Cancel
            </Button>
            <Button
              className={isPublish ? "bg-green-600 text-white" : "bg-red-600 text-white"}
              onClick={confirmPublish}
            >
              {isPublish ? "Publish" : "Unpublish"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="flex justify-between items-center w-full p-6">
          {/* Left column */}
          <div className="flex flex-col justify-center max-w-[65%] gap-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{name}</span>

              {published ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-200">
                  <Edit className="w-3 h-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(startTime)} at {formatTime(startTime)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {capacity} guests
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm mt-1">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Remain:</span>
                <span className="text-blue-600 font-semibold">{pointsRemain}</span>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Awarded:</span>
                <span className="text-green-600 font-semibold">
                  {pointsAwarded}
                </span>
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Event Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate(`/manage/events/${id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate(`/manage/events/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Event
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate(`/manage/events/${id}/organizers`)}>
                <Users className="mr-2 h-4 w-4" /> Manage Organizers
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate(`/manage/events/${id}/guests`)}>
                <UserPlus className="mr-2 h-4 w-4" /> Manage Guests
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate(`/manage/events/${id}/awards`)}>
                <Coins className="mr-2 h-4 w-4 text-yellow-500" /> Award Points
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Publish / Unpublish */}
              {!published ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPublishAction("publish");
                    setShowPublishPopup(true);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Publish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setPublishAction("unpublish");
                    setShowPublishPopup(true);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Unpublish
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Delete */}
              <DropdownMenuItem
                onClick={() => setShowDeletePopup(true)}
                className="text-red-600 focus:text-red-600"
                disabled={published}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Delete popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => onDelete(id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish / Unpublish popup */}
      {renderPublishPopup()}
    </>
  );
}
