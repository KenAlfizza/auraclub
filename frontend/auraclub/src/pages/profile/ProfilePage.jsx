import { useNavigate } from "react-router-dom";
import { BadgeCheck, Shield } from "lucide-react";
import Layout from "../Layout";
import { useUser } from "@/context/UserContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";

export function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout header={true} sidebar={true}>
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* PROFILE CARD */}
        <Card className="p-6 text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-semibold">My Profile</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4">
            <img
              src="/src/assets/react.svg"
              className="w-32 h-32 rounded-full shadow-sm border"
            />
            <span className="text-sm text-gray-600">{user.email}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
              {user.role.toUpperCase()}
            </span>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full max-w-md text-left">
              <div><Label>UTORID</Label><div>{user.utorid}</div></div>
              <div><Label>Full Name</Label><div>{user.name}</div></div>
              <div><Label>Birthday</Label><div>
                {user.birthday ? user.birthday.split("T")[0] : "N/A"}
              </div></div>
              <div><Label>Verified</Label><div className={user.verified ? "text-green-600" : "text-red-600"}>{user.verified ? "Yes" : "No"}</div></div>
            </div>
          </CardContent>
        </Card>

        {/* ROLE + SECURITY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ROLE CARD */}
          <Card className="p-6">
            <CardHeader className="text-center">
              <CardTitle className="flex justify-center items-center gap-2">
                <Shield className="w-5 h-5" />
                My Role
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-2xl font-semibold capitalize">{user.role}</span>
            </CardContent>
          </Card>

          {/* SECURITY CARD */}
          <Card className="p-6">
            <CardHeader className="text-center">
              <CardTitle className="flex justify-center items-center gap-2">
                <BadgeCheck className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <div className="flex justify-between px-6">
                <Label className="font-medium">Created At</Label>
                <span>{String(user.createdAt).split("T")[0]}</span>
              </div>
              <div className="flex justify-between px-6">
                <Label className="font-medium">Last Login</Label>
                <span>{String(user.lastLogin).split("T")[0]}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* CHANGE PASSWORD BUTTON */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="w-1/2 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
            onClick={() => navigate("/change-password")}
          >
            Change Password
          </Button>
        </div>

      </div>
    </Layout>
  );
}

export default ProfilePage;
