import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function AppPromotionCard({
  id,
  name,
  type,
  startTime,
  endTime,
  minSpending,
  rate,
  points,
  clickable,
}) {
  const isClickable = clickable !== false;
  const navigate = useNavigate();

  const handleClickPromotion = (e) => {
    e.stopPropagation();
    if (isClickable) navigate(`/manage/promotions/view/${id}`);
  };

  const typeLabel = type === "automatic" ? "Automatic" : type === "onetime" ? "One Time" : "Unknown";

  return (
    <Card
      className="w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      onClick={isClickable ? handleClickPromotion : undefined}
      role={isClickable ? "button" : undefined}
    >
      <CardHeader className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold line-clamp-2">{name}</h2>
          <Badge variant={type === "automatic" ? "default" : "secondary"}>{typeLabel}</Badge>
        </div>

        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Starts: {format(new Date(startTime), "MMM do, yyyy h:mma")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Ends: {format(new Date(endTime), "MMM do, yyyy h:mma")}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">Min Spend: <span className="font-semibold">${minSpending}</span></span>
            <span className="text-sm text-gray-700">Rate: <span className="font-semibold">{rate}</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">Points: <span className="font-semibold">{points}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
