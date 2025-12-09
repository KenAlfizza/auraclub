import Layout from "../../Layout"
import Header from "@/components/app/appHeader"
import { useUser } from "@/context/UserContext"
import { useState } from "react"

import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  UserPlus, 
  CalendarDays, 
  Plus, 
  FileText, 
  CheckCircle, 
  Tag,
  CreditCard,
} from "lucide-react";

export function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useUser()

    const [dashboardRole, setDashboardRole] = useState('superuser')


    const date = new Date();

    const todayDate = date.toLocaleDateString("en-US", {
    month: "short",   // Mmm
    day: "2-digit",   // DD
    year: "numeric"   // YYYY
    });


    if (dashboardRole === "regular") {
        return (
            <Layout header={true} sidebar={true}>
                <div className="flex flex-col w-full gap-4 h-full">
                    <Label className="text-4xl">Hello {user.name}!</Label>

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
                                        <Label className="text-7xl">{user.points}</Label>
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
                                        <Label className="text-5xl">{}</Label>
                                    </CardContent>
                                    </div>
                                    <CardContent className="text-right">
                                    <Button 
                                        variant="outline"
                                        className="bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                                        onClick={() => navigate("/promotions")}
                                    >
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
                                <Button 
                                    variant="outline"
                                    className="bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => navigate("/transactions")}
                                >
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
            <Layout header={<Header />} sidebar={true}>
                <div className="flex w-full gap-4">
                    <div className="flex-1">
                        <Card 
                            className="flex flex-col justify-between w-full h-full min-h-[calc(16rem+16rem+1rem)]
                            bg-pink-400 text-white cursor-pointer hover:bg-green-500 transition-colors duration-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Calendar/>
                                    <CardTitle className="text-xl sm:text-2xl">Today's Summary</CardTitle>
                                    
                                </div>
                                <Label className="text-3xl sm:text-4xl md:text-5xl">{todayDate}</Label>
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
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6"
                                    onClick={() => navigate("/manage/transactions/create")}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Transaction
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6"
                                    onClick={() => navigate("/manage/transactions/redemption")}
                                >
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Process Redemption
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (dashboardRole === 'manager' || dashboardRole === 'superuser' ) {
        return (
            <Layout header={true} sidebar={true}>
                <div className="w-full h-full">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex w-full flex-col gap-4 md:flex-row md:items-stretch min-h-full">
                        {/* LEFT SIDE */}
                        <div className="w-full md:w-1/4 h-full">
                        <Card className="w-full h-full">
                            <CardHeader className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                <CardTitle className="text-lg sm:text-xl">Today's Overview</CardTitle>
                            </div>
                            <Label className="text-2xl sm:text-3xl md:text-4xl break-words">{todayDate}</Label>
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
                                <Label className="text-base sm:text-lg">Events In Progress</Label>
                                </CardHeader>
                            </Card>

                            <Card className="flex-1 border-0 bg-transparent shadow-none h-full">
                                <CardHeader>
                                <Label className="text-base sm:text-lg">Ongoing Promotions</Label>
                                </CardHeader>
                            </Card>

                            <Card className="flex-1 border-0 bg-transparent shadow-none h-full">
                                <CardHeader>
                                    <Label className="text-base sm:text-lg">User Statistics</Label>
                                </CardHeader>
                            </Card>

                            </div>
                        </Card>
                        </div>

                    </div>

                    <div className="flex flex-col lg:flex-row w-full gap-4">
                        <Card className="w-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <Label className="text-lg sm:text-xl font-semibold">Manage Users</Label>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/users/register")}
                                >
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Register User
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/users/all")}
                                >
                                    <FileText className="mr-2 h-5 w-5" />
                                    Edit/View All
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5" />
                                    <Label className="text-lg sm:text-xl font-semibold">Manage Events</Label>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/events/create")}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Event
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/events/all")}
                                >
                                    <FileText className="mr-2 h-5 w-5" />
                                    Edit/View All
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                                    <Label className="text-lg sm:text-xl font-semibold whitespace-nowrap">Manage Transactions</Label>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/transactions/create")}
                                >
                                    <Plus className="mr-2 h-5 w-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Create Transaction</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/transactions/redemption")}
                                >
                                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Process Redemption</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/transactions/all")}
                                >
                                    <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Edit/View All</span>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5" />
                                    <Label className="text-lg sm:text-xl font-semibold">Manage Promotions</Label>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/promotions/create")}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Promotion
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full bg-white hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md py-6 text-base justify-start"
                                    onClick={() => navigate("/manage/promotions/all")}
                                >
                                    <FileText className="mr-2 h-5 w-5" />
                                    Edit/View All
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </div>
            </Layout>

        )
    }
}

export default DashboardPage