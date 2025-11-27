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

import { useUser } from "@/context/UserContext";

import { ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                console.log("Fetching user with ID:", id);
                const data = await fetchUser(id);
                
                if (data) {
                    setUserState(data);
                    console.log("User loaded:", data);
                } else {
                    setError("User not found");
                }
            } catch (err) {
                console.error("Error fetching user:", err);
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
            console.log("Deleting user:", id);
            
            navigate("/manage/users/all");
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user");
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
                        <div className="hover:cursor-pointer" onClick={() => navigate("/manage/users/all")}>
                            <ChevronLeft className="scale-125"/>
                        </div>

                        <Label className="text-2xl">
                            {user ? `User #${user.id}` : "User Details"}
                        </Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button 
                            className="bg-white text-black hover:bg-green-400"
                            onClick={() => navigate(`/manage/users/edit/${user?.id}`)}
                            disabled={!user}
                        >
                            <Edit/>
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
                                <div className="grid gap-2">
                                    <Label htmlFor="id">
                                        {user ? `User #${user.id}` : "User Details"}
                                    </Label>
                                    <Label htmlFor="name">{user?.name || "Loading..."}</Label>
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
                                        onClick={handleDeleteUser}
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
                                    <div>Loading user...</div>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 p-4">{error}</div>
                            ) : user ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Avatar on the left */}
                                        <div className="flex justify-center md:justify-start items-center">
                                            <img 
                                                src={`${API_BASE_URL}` + user.avatarUrl} 
                                                className="w-32 h-32 rounded-full object-cover bg-gray-300"
                                                alt="User avatar"
                                            />
                                        </div>
                                        
                                        {/* User Info Grid on the right */}
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div>
                                                    <p className="text-sm text-gray-500">UTORID</p>
                                                    <p className="font-semibold">{user.utorid}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-semibold">{user.name}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500 break-words">Email</p>
                                                    <p className="font-semibold">{user.email}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Birthday</p>
                                                    <p className="font-semibold">{user.birthday ? String(user.birthday).split('T')[0] : 'N/A'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Role</p>
                                                    <p className="font-semibold">{user.role}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Points</p>
                                                    <p className="font-semibold">{user.points}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Created At</p>
                                                    <p className="font-semibold">{user.createdAt ? String(user.createdAt).split('T')[0] : 'N/A'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Last Login</p>
                                                    <p className="font-semibold">{user.lastLogin ? String(user.lastLogin).split('T')[0] : 'N/A'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Verified</p>
                                                    <p className="font-semibold">{user.verified ? 'Yes' : 'No'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Promotions</p>
                                                    <p className="font-semibold">{user.promotions?.length || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 p-4">No user data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

export default ViewUserPage;