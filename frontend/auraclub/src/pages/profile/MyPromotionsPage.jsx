import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppPromotionCard from "@/components/app/appPromotionCard";

import Layout from "@/pages/Layout";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { useUser } from "@/context/UserContext";

import { Filter, ChevronLeft } from "lucide-react";

export function MyPromotionsPage() {
    const navigate = useNavigate();
    const { user, loading, error } = useUser();
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [usedPromotions, setUsedPromotions] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
  
    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({
        name: null,
        type: null,
    });

    // Fetch promotions whenever the page is loaded
    useEffect(() => {
        // Only fetch if user and user.promotions exist
        if (user && user.promotions) {
            console.log("User promotions:", user.promotions);
            setAvailablePromotions(user.promotions.available || []);
            setUsedPromotions(user.promotions.used || []);
        }
    }, [user]); // Add user as a dependency

    useEffect(() => {
        console.log("Available:", availablePromotions);
        console.log("Used:", usedPromotions);
    }, [availablePromotions, usedPromotions]);

    return (
        <Layout header={true} sidebar={true}>
            <div className="w-full h-full">
            <div className="flex flex-col w-full gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <ChevronLeft
                        className="hover:cursor-pointer scale-125"
                        onClick={() => navigate("/")}
                        />
                        <Label className="text-2xl font-bold">My Promotions</Label>
                    </div>
                </div>
                <div className="flex flex-col w-full h-full gap-4">
                    <Card className="w-full">
                        <CardHeader className="pb-0">
                            <Label className="text-2xl">Available Promotions</Label>
                        </CardHeader>
                        <CardContent className="p-2">
                            {loading ? (
                                <div>Loading available promotions...</div>
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {availablePromotions.map((promo) => (
                                        <AppPromotionCard key={promo.id} {...promo} clickable={false}/>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter>
                        </CardFooter>
                    </Card>

                    <Card className="w-full">
                        <CardHeader className="pb-0">
                            <Label className="text-2xl">Used Promotions</Label>
                        </CardHeader>
                        <CardContent className="p-2">
                            {loading ? (
                                <div>Loading used promotions...</div>
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {usedPromotions.map((promo) => (
                                        <AppPromotionCard key={promo.id} {...promo} clickable={false} />
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            </div>
        </Layout>
    );
}

export default MyPromotionsPage
