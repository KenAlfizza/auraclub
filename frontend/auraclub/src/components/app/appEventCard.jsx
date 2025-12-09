import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AppEventCard({
  id,
  name,
  location,
  startTime,
  endTime,
  capacity,
  guestsCount,
  onClick,
}) {
    const navigate = useNavigate()

    return (
        <Card
        className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
        onClick={() => navigate(`/events/${id}`)}
        >
        <CardContent className="p-6 flex flex-col gap-3">
            {/* Title */}
            <h2 className="text-xl font-semibold">{name}</h2>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
            </div>

            {/* Times */}
            <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
                {new Date(startTime).toLocaleString()} – {" "}
                {new Date(endTime).toLocaleString()}
            </span>
            </div>

            {/* Capacity */}
            <div className="text-sm text-gray-700">
            Capacity: {guestsCount}/{capacity}
            </div>
        </CardContent>
        </Card>
    );
}