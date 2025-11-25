import Layout from "./Layout"
import Header from "@/components/app/appHeader"
import { useUser } from "@/context/UserContext"
import { useState } from "react"

import { Label } from "@/components/ui/label";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Table } from "lucide-react";

export function DashboardPage() {
    const {getUserRole,
        getUserPoints
    } = useUser()

    const [dashboardRole, setDashboardRole] = useState('regular')


    const date = new Date();

    const todayDate = date.toLocaleDateString("en-US", {
    month: "short",   // Mmm
    day: "2-digit",   // DD
    year: "numeric"   // YYYY
    });


    if (dashboardRole === "regular") {
        return (
            <Layout header={<Header />}>
                <div className="flex flex-col w-full gap-4 h-full">
                    <Label className="text-4xl">Hello!</Label>

                    <div className="flex-1 flex flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-4">
                            <div>
                                <Card
                                    className="bg-blue-300 text-white flex flex-col justify-between w-full h-64 cursor-pointer hover:bg-blue-400 transition-colors duration-200"
                                    onClick={() => {
                                        console.log("Card clicked!");
                                        {/* Navigate to redeem point page */}
                                    }}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Point Balance</CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <Label className="text-7xl">{getUserPoints}</Label>
                                    </CardContent>

                                    <CardContent className="text-right">
                                        <Label className="text-sm">Redeem Points</Label>
                                    </CardContent>
                                </Card>
                            </div>
                            <div>
                                <Card className="w-full h-64 flex flex-col justify-between">
                                    <div>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Available Promotions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Label className="text-5xl">{/*getAvailablePromotions*/}</Label>
                                    </CardContent>
                                    </div>
                                    <CardContent className="text-right">
                                    <Button className="bg-blue-400 text-[#FFFFFF] hover:bg-blue-500 hover:text-white transition-colors duration-200">
                                        View Promotions
                                    </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Card className="flex flex-col justify-between w-full min-h-[calc(16rem+16rem+1rem)]">
                                <div>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Label className="text-5xl">{/*getUserTransactions*/}</Label>
                                </CardContent>
                                </div>

                                <CardContent className="text-right">
                                <Button className="bg-blue-400 text-[#FFFFFF] hover:bg-blue-500 hover:text-white transition-colors duration-200">
                                    View Transactions
                                </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
        </Layout>
        )
    }

    if (dashboardRole === "cashier") {
        return (
            <Layout header={<Header />}>
                <div className="flex w-full gap-4">
                    <div className="flex-1">
                        <Card 
                            className="flex flex-col justify-between w-full h-full min-h-[calc(16rem+16rem+1rem)]
                            bg-pink-400 text-white cursor-pointer hover:bg-green-500 transition-colors duration-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Calendar/>
                                    <CardTitle className="text-2xl">Today's Summary</CardTitle>
                                    
                                </div>
                                <Label className="text-5xl">{todayDate}</Label>
                            </CardHeader>
                            <CardContent>
                                <Label className="text-5xl">{/*getUserTransactions*/}</Label>
                            </CardContent>
                            <CardContent className="flex flex-row gap-4 text-left">
                                <div>
                                    <div className="flex flex-col">
                                        <Label className="text-xl">Number of Transactions</Label>
                                        <Label className="text-5xl">10</Label>
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-xl">Points Awarded</Label>
                                        <Label className="text-5xl">200</Label>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col">
                                        <Label className="text-xl">Redemption Processed</Label>
                                        <Label className="text-5xl">5</Label>
                                    </div>

                                    <div className="flex flex-col">
                                        <Label className="text-xl">Redemption Pending</Label>
                                        <Label className="text-5xl">6</Label>
                                    </div>
                                </div>
                                
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <Card
                                className="bg-white flex flex-col justify-between w-full h-64 cursor-pointer duration-200"
                                onClick={() => {
                                    console.log("Card clicked!");
                                    {/* Navigate to transactions page */}
                                }}>
                                <CardHeader>
                                    <CardTitle className="text-lg">Transactions</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <Label className="text-7xl">{/** get transactions */}</Label>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <div className="flex flex-row w-full gap-4">
                                <Button className="w-full bg-green-400">Create Transaction</Button>
                                <Button className="w-full bg-yellow-400">Process Redemption</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (dashboardRole === 'manager') {
        return (
            <Layout header={<Header />}>
                <div className="flex flex-col w-full gap-4">
                    <div className="flex w-full flex-col gap-4 md:flex-row md:items-stretch min-h-full">
                        {/* LEFT SIDE */}
                        <div className="w-full md:w-1/4 h-full">
                        <Card className="w-full h-full">
                            <CardHeader className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Calendar />
                                <CardTitle className="text-xl">Today's Overview</CardTitle>
                            </div>
                            <Label className="text-4xl whitespace-nowrap">{todayDate}</Label>
                            </CardHeader>
                            <CardContent className="mt-4" />
                        </Card>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="w-full md:flex-1 h-full min-h-full">
                        <Card className="w-full h-full">

                            <div className="flex flex-col gap-4 md:flex-row md:justify-between h-full min-h-full">

                            <Card className="flex-1 border-0 bg-transparent shadow-none h-full">
                                <CardHeader>
                                <Label className="text-lg">Events In Progress</Label>
                                </CardHeader>
                            </Card>

                            <Card className="flex-1 border-0 bg-transparent shadow-none h-full">
                                <CardHeader>
                                <Label className="text-lg">Ongoing Promotions</Label>
                                </CardHeader>
                            </Card>

                            <Card className="flex-1 border-0 bg-transparent shadow-none h-full">
                                <CardHeader>
                                    <Label className="text-lg">User Statistics</Label>
                                </CardHeader>
                            </Card>

                            </div>
                        </Card>
                        </div>

                    </div>

                    <div className="flex flex-row w-full gap-4">
                         <Card className>
                            <CardHeader>
                                <Label className="text-lg">Manage Events</Label>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full gap-2">
                                <Button>Create Event</Button>
                                <Button>Edit/View All</Button>
                            </CardContent>
                        </Card>
                        <Card className>
                            <CardHeader>
                                <Label className="text-lg">Manage Transactions</Label>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full gap-2">
                                <Button>Create Transaction</Button>
                                <Button>Process Redemption</Button>
                                <Button>Edit/View All</Button>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <Label className="text-lg whitespace-">Manage Users</Label>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full gap-2">
                                <Button>Register User</Button>
                                <Button>Edit/View All</Button>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <Label className="text-lg whitespace-">Manage Events</Label>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full gap-2">
                                <Button>Create Event</Button>
                                <Button>Edit/View All</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Layout>

        )
    }
}

export default DashboardPage