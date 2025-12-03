import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import Layout from "@/pages/Layout";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import Header from "@/components/app/appHeader";

import { usePromotion } from "@/context/PromotionContext";

import { ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ViewPromotionPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get promotion ID from URL
    const { fetchPromotion, deletePromotion } = usePromotion();
    
    const [promotion, setPromotionState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadPromotion = async () => {
            if (!id) {
                setError("No promotion ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("Fetching promotion with ID:", id);
                const data = await fetchPromotion(id);
                
                if (data) {
                    setPromotionState(data);
                    console.log("Promotion loaded:", data);
                } else {
                    setError("Promotion not found");
                }
            } catch (err) {
                console.error("Error fetching promotion:", err);
                setError("Failed to load promotion");
            } finally {
                setLoading(false);
            }
        };
        loadPromotion();
    }, [id]);

    const handleDeletePromotion = async () => {
        setIsDeleting(true);
        try {
            // Delete promotion API
            await deletePromotion(id);
            console.log("Deleting promotion:", id);
            
            // Navigate back after successful deletion
            navigate("/manage/promotions/all");
        } catch (err) {
            console.error("Error deleting promotion:", err);
            setError("Failed to delete promotion");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-4">
                        <div className="hover:cursor-pointer" onClick={() => navigate(-1)}>
                            <ChevronLeft className="scale-125"/>
                        </div>

                        <Label className="text-2xl">
                            {promotion ? `Promotion #${promotion.id}` : "Promotion Details"}
                        </Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button 
                            className="bg-white text-black hover:bg-green-400"
                            onClick={() => navigate(`/manage/promotions/edit/${promotion.id}`)}
                        >
                            <Edit/>
                        </Button>

                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-black hover:bg-red-400">
                                    <Trash2/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Delete Promotion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this promotion?
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2">
                                    <Label htmlFor="id">
                                        {promotion ? `Promotion #${promotion.id}` : "Promotion Details"}
                                    </Label>
                                    <Label htmlFor="name">{promotion?.name || "Loading..."}</Label>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDeleteDialogOpen(false)}
                                        disabled={isDeleting}
                                    >
                                        No
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeletePromotion}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Yes"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                </div>
                <div className="flex flex-row w-full gap-4">
                    <Card className="w-full">
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="flex justify-center items-center p-12">
                                    <div>Loading promotion...</div>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 p-4">{error}</div>
                            ) : promotion ? (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{promotion.name}</h2>
                                        <p className="text-gray-600 mt-2">{promotion.description}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Type</p>
                                            <p className="font-semibold">
                                                {promotion.type === 'automatic' ? 'Automatic' : 'One Time'}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">Min Spending</p>
                                            <p className="font-semibold">${promotion.minSpending}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">Rate</p>
                                            <p className="font-semibold">{promotion.rate}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">Points</p>
                                            <p className="font-semibold">{promotion.points}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">Start Time</p>
                                            <p className="font-semibold">
                                                {format(new Date(promotion.startTime), "MMM do, yyyy h:mma")}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">End Time</p>
                                            <p className="font-semibold">
                                                {format(new Date(promotion.endTime), "MMM do, yyyy h:mma")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 p-4">No promotion data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

export default ViewPromotionPage;