import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from '@/config/api'

import { Label } from "@radix-ui/react-label";

export default function AppUserCard({
    id,
    name,
    utorid,
    email,
    avatarUrl,
}) {
    // Default values if no props are passed
    id = id || "ID"
    name = name || "John Doe"
    utorid = utorid || "johndoe1"
    email = email || "johndoe1@mail.utoronto.ca"
    avatarUrl = API_BASE_URL+avatarUrl || "/src/assets/react.svg"

    const { fetchUser, setUser } = useUser();
    const navigate = useNavigate();

    const handleClickUser = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log("Navigating to user:", id);
        // Navigate to the user page with ID in URL
        navigate(`/manage/users/view/${id}`);
    };
    
    return (
        <Card 
            className="
            w-full 
            bg-gray-200 
            rounded-xl 
            shadow-sm 
            hover:cursor-pointer 
            hover:shadow-md 
            transition-shadow
            pt-4"

            onClick={handleClickUser}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClickUser(e);
                }
            }}
        >
            <CardContent className="flex flex-row gap-4">
                <div className="flex flex-row">
                    <img className="scale-100 max-w-16 max-h-16" src={avatarUrl}></img>
                </div>  
                <div>
                    <Label className="text-base font-bold">{name}</Label>
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">
                            {utorid}
                        </p>
                        <p className="text-sm font-semibold">
                            {email}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}