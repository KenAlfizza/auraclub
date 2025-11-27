import { useNavigate } from "react-router-dom";

import Layout from "@/pages/Layout";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/app/appHeader";

import { UserPlus2 } from "lucide-react";
import { Users2 } from "lucide-react";

export function ManageUserPage() {
    const navigate = useNavigate();

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <Label className="text-2xl">Manage Users</Label>

                <div className="flex flex-row w-full gap-4">

                    <Card onClick={() => navigate("/manage/users/register")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <UserPlus2 className="scale-125"/>
                            <Label>Register User</Label>
                        </CardContent>
                    </Card>
                    
                    <Card onClick={() => navigate("/manage/users/all")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <Users2 className="scale-125"/>
                            <Label>Edit/View All</Label>
                        </CardContent>
                    </Card>

                </div>
            </div>

        </Layout>
    );
}

export default ManageUserPage;
