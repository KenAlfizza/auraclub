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

                <div className="flex flex-row w-full gap-4">

                    <Card onClick={() => navigate("/manage/transactions/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Create Transaction</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/manage/transactions/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Create Adjustment Transaction</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/manage/transactions/create")}
                        className="w-full cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                        >
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <PlusCircle className="scale-125"/>
                            <Label>Create Transfer</Label>
                        </CardContent>
                    </Card>

                    <Card onClick={() => navigate("/manage/transactions/create")}
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
