import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { useUser } from "@/context/UserContext";

import { ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export function ViewUserPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { fetchUser, deleteUser } = useUser();
    
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (!id) {
                setError("No user ID provided");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await fetchUser(id);
                if (data) setUserState(data);
                else setError("User not found");
            } catch (err) {
                console.error(err);
                setError("Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [id]);

    const handleDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await deleteUser(id);
            navigate("/manage/users");
        } catch (err) {
            console.error(err);
            setError("Failed to delete user");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Layout header sidebar>
            <div className="flex flex-col w-full h-full gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="hover:cursor-pointer rounded-full p-2 hover:bg-gray-100" onClick={() => navigate(-1)}>
                            <ChevronLeft className="w-8 h-8 text-gray-700"/>
                        </div>
                        <div>
                            <Label className="text-3xl font-bold">{user ? user.name : "User Details"}</Label>
                            <p className="text-gray-600 mt-1">View detailed information about this user</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            className="bg-white text-black hover:bg-green-400"
                            onClick={() => navigate(`/manage/users/edit/${user?.id}`)}
                            disabled={!user}
                        >
                            <Edit />
                        </Button>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-black hover:bg-red-400" disabled={!user}>
                                    <Trash2/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this user?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                                        No
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : "Yes"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* User Info Cards */}
                {loading ? (
                    <Card className="col-span-full shadow rounded-xl">
                        <CardContent className="p-8 text-center">Loading user...</CardContent>
                    </Card>
                ) : error ? (
                    <Card className="col-span-full shadow rounded-xl">
                        <CardContent className="p-8 text-center text-red-500">{error}</CardContent>
                    </Card>
                ) : user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* General Info */}
                        <Card className="shadow rounded-xl">
                            <CardContent className="p-6">
                                <Label className="text-xl font-semibold mb-4">General Info</Label>
                                <div className="grid gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">UTORID</p>
                                        <p className="font-semibold">{user.utorid}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-semibold">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Birthday</p>
                                        <p className="font-semibold">{user.birthday ? String(user.birthday).split("T")[0] : "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Role</p>
                                        <p className="font-semibold">{user.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Info */}
                        <Card className="shadow rounded-xl">
                            <CardContent className="p-6">
                                <Label className="text-xl font-semibold mb-4">Activity Info</Label>
                                <div className="grid gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Points</p>
                                        <p className="font-semibold">{user.points}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p className="font-semibold">{user.createdAt ? String(user.createdAt).split("T")[0] : "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Login</p>
                                        <p className="font-semibold">{user.lastLogin ? String(user.lastLogin).split("T")[0] : "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Verified</p>
                                        <p className="font-semibold">{user.verified ? "Yes" : "No"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Promotions</p>
                                        <p className="font-semibold">{user.promotions?.length || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="shadow rounded-xl">
                        <CardContent className="p-6 text-center text-gray-500">No user data available</CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}

export default ViewUserPage;
