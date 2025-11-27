import { useNavigate } from "react-router-dom";

import Layout from "../Layout";
import { Header } from "@/components/app/appHeader";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export function ProfilePage() {
    const { user } = useUser()
    const navigate = useNavigate();

    // Handle loading or no user state
    if (!user) {
        return (
            <Layout header={<Header />}>
                <div>Loading...</div>
            </Layout>
        )
    }

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex-row w-full max-w-xl">
                <div className="mb-2">
                    <Card className="flex-col justify-center">
                        <CardHeader className="text-center">
                            <CardTitle>My Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-8">
                            <div>
                                <img src="\src\assets\react.svg" className="w-32"/>
                            </div>
                            <div className="flex flex-row gap-8">
                                <div className="flex-1 flex-col gap-8">
                                    <div>
                                        <Label htmlFor="utorid">UTORID</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="birthday">Birthday</Label>
                                    </div>
                                </div>
                                <div className="flex-1 flex-col gap-8">
                                    <div>{user.utorid}</div>
                                    <div>{user.name}</div>
                                    <div>{user.email}</div>
                                    <div>{user.birthday}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2">
                    <Card className="w-full max-w-xl flex-col justify-center">
                        <CardHeader className="text-center">
                            <CardTitle>My Role</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <div>
                                <Label className="text-3xl" htmlFor="role">{user.role}</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full max-w-xl flex-col justify-center">
                        <CardHeader className="text-center">
                            <CardTitle>Security</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center gap-2">
                            <div>
                                <div>
                                    <Label htmlFor="verified">Verified: {user.verified ? "Yes" : "No"}</Label>
                                </div>
                                <div>
                                    <Label htmlFor="createdat">Created At: {String(user.createdAt).split('T')[0]}</Label>
                                </div>
                                <div>
                                    <Label htmlFor="lastlogin">Last Login: {String(user.lastLogin).split('T')[0]}</Label>
                                </div>
                            </div>
                            <div className="text-center">
                                <Button 
                                    variant="outline"
                                    className="bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => navigate("/change-password")}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

export default ProfilePage