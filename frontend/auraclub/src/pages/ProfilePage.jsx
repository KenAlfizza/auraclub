import Layout from "./Layout";
import { Header } from "@/components/ui/header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export function ProfilePage() {
  return (
    <Layout header={<Header />}>
        <div className="flex-row w-full max-w-xl">
            <div className="mb-2">
                <Card className="flex-col justify-center">
                    <CardHeader className="text-center">
                        <CardTitle>My Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-8">
                        <div>
                            <img src="\src\assets\react.svg" class="w-32"/>
                        </div>
                        <div className="flex-row">
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
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
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
                            <Label className="text-3xl" htmlFor="role">Manager</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-xl flex-col justify-center">
                    <CardHeader className="text-center">
                        <CardTitle>Security</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-col justify-center">
                        <div>
                            <Label htmlFor="verified">Verified</Label>
                        </div>
                        <div>
                            <Label htmlFor="changepassword">Change Password</Label>
                        </div>
                        <div>
                            <Label htmlFor="lastlogin">Last Login</Label>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </Layout>
  );
}

export default ProfilePage()
