import { useNavigate } from "react-router-dom";
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
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function AppManageEventCard({
  id = 0,
  name = "Event Name",
  location = "Location",
  startTime = new Date().toISOString(),
  endTime = new Date().toISOString(),
  capacity = 0,
  pointsRemain = 0,
  pointsAwarded = 0,
  published = false,
  organizersCount = 0,
  guestsCount = 0,
  onDelete,
  onTogglePublish,
}) {
  const navigate = useNavigate();

  // Check if event is full
  const isEventFull = guestsCount >= capacity;

  // Format date
  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  // Format time
  const formatTime = (date) => {
    try {
      return format(new Date(date), "h:mm a");
    } catch {
      return "-";
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (published) {
      alert("Cannot delete a published event");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      if (onDelete) onDelete(id);
    }
  };

  // Handle publish toggle
  const handleTogglePublish = () => {
    if (onTogglePublish) onTogglePublish(id, published);
  };

  return (
    <Card className="flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex justify-between items-center w-full p-6">
        {/* Left column - Event Info */}
        <div className="flex flex-col justify-center max-w-[65%] gap-2">
          {/* Event name with badges */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">{name}</span>
            {published ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-200">
                <XCircle className="w-3 h-3 mr-1" />
                Draft
              </Badge>
            )}
            {isEventFull && (
              <Badge variant="destructive">Full</Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(startTime)} at {formatTime(startTime)}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {guestsCount}/{capacity} guests
            </span>
          </div>

          {/* Points Info */}
          <div className="flex items-center gap-4 text-sm mt-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Remain:</span>
              <span className="text-blue-600 font-semibold">
                {pointsRemain}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Awarded:</span>
              <span className="text-green-600 font-semibold">
                {pointsAwarded}
              </span>
            </div>
          </div>
        </div>

        {/* Right column - Actions Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Event Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => navigate(`/manage/events/${id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => navigate(`/manage/events/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => navigate(`/manage/events/${id}/organizers`)}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Organizers
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => navigate(`/manage/events/${id}/guests`)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Guests
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleTogglePublish}>
                {published ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
                disabled={published}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}