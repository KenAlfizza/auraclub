import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { usePromotion } from "@/context/PromotionContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
    // Default values if no props are passed
    id = id || "ID";
    name = name || "Start of Summer Celebration";
    type = type || "Type";
    startTime = startTime || "End Time";
    endTime = endTime || "End Time";
    minSpending = minSpending || "0";
    rate = rate || "0";
    points = points || "0";
    const isClickable = clickable !== false;  // Everything except explicit false is clickable

    const { fetchPromotion, setPromotion } = usePromotion();
    const navigate = useNavigate();

    const handleClickPromotion = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log("Navigating to promotion:", id);
        // Navigate to the promotion page with ID in URL
        navigate(`/manage/promotions/view/${id}`);
    };
    
    return (
        <Card 
            className="w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
            onClick={isClickable ? handleClickPromotion : undefined}
            role={isClickable ? "button" : undefined}
        >
            <CardHeader>
                <h2 className="text-base font-bold">Promotion #{id}</h2>
                <p className="text-xl font-semibold">{name}</p>
                <div>
                    <p className="text-sm font-semibold">
                        Starts: {format(new Date(startTime), "MMM do, yyyy h:mma")}
                    </p>
                    <p className="text-sm font-semibold">
                        Ends: {format(new Date(endTime), "MMM do, yyyy h:mma")}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col text-sm font-semibold">
                        <span>
                            Type: {type === 'automatic' ? "Automatic" : type === 'onetime' ? "One Time" : "Unknown"}
                        </span>
                        <span>Min Spend: ${minSpending}</span>
                    </div>
                    <div className="flex flex-col text-sm font-semibold">
                        <span>Rate: {rate}</span>
                        <span>Points: {points}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}       