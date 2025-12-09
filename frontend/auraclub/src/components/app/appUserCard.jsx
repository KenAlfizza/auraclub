import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";

import { Label } from "@radix-ui/react-label";

export default function AppUserCard({
  id,
  name,
  utorid,
  email,
  avatarUrl,
}) {
  // Default values if no props are passed
  id = id || "ID";
  name = name || "John Doe";
  utorid = utorid || "johndoe1";
  email = email || "johndoe1@mail.utoronto.ca";
  avatarUrl = avatarUrl ? API_BASE_URL + avatarUrl : "/src/assets/react.svg";

  const { fetchUser, setUser } = useUser();
  const navigate = useNavigate();

  const handleClickUser = (e) => {
    e.stopPropagation();
    navigate(`/manage/users/view/${id}`);
  };

  return (
    <Card
      className="
        w-full
        bg-white
        rounded-xl
        shadow-md
        hover:shadow-lg
        transition-shadow
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
      onClick={handleClickUser}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClickUser(e);
      }}
    >
      <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={`${name} avatar`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-1 text-left w-full">
          <Label className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {name}
          </Label>
          <p className="text-sm text-gray-600 font-medium truncate">{utorid}</p>
          <p className="text-sm text-gray-500 truncate">{email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
