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

import { CheckCircle, FileEditIcon, PlusCircle } from "lucide-react";
import { Grip } from "lucide-react";

export function ManageTransactionPage() {
    const navigate = useNavigate();

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <Label className="text-2xl">Manage Transaction</Label>

                <div className="grid grid-cols-4 w-full gap-4 text-center">

                    <Card onClick={() => navigate("/manage/transactions/purchase/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Create Purchase Transaction</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/manage/transactions/adjustment/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Adjust Transaction</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/points/transfer")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Transfer Points</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/points/redemption/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Create Redemption</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/points/redemption/process")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <CheckCircle className="scale-125"/>
                            <Label>Process Redemption</Label>
                        </CardContent>
                    </Card>
                    
                    <Card onClick={() => navigate("/manage/transactions/all")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <Grip className="scale-125"/>
                            <Label>Edit/View All</Label>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </Layout>
    );
}

export default ManageTransactionPage;
