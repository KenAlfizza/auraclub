import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import Layout from "@/pages/Layout";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Header from "@/components/app/appHeader";

import { useUser } from "@/context/UserContext";

import { ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";

export function EditUserPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { fetchUser, patchUser } = useUser();
    
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [email, setUserEmail] = useState("");
    const [verified, setUserVerified] = useState(false);
    const [suspicious, setUserSuspicious] = useState(false);
    const [role, setUserRole] = useState("");

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

                    // Initialize form fields with user data
                    setUserEmail(data.email || "");
                    setUserVerified(data.verified || false);
                    setUserSuspicious(data.suspicious || false);
                    setUserRole(data.role || "");

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form submitted!');

        try {
            let data = {}
            if (email !== user.email) {
                data.email = email
            }
            if (verified !== user.verified) {
                data.verified = verified
            }
            if (suspicious !== user.suspicious) {
                data.suspicious = suspicious
            }
            if (role !== user.role) {
                data.role = role
            }

            console.log('Updated data:', data);

            
            
            // TODO: Add your API call here to update the user
            // await updateUser(id, { email, verified, suspicious, role });
            // navigate('/manage/users/all');

            await patchUser(id, data)
            navigate('/manage/users/all')

        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const handleDiscard = () => {
        // Reset form to original user data
        if (user) {
            setUserEmail(user.email || "");
            setUserVerified(user.verified || false);
            setUserSuspicious(user.suspicious || false);
            setUserRole(user.role || "");
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
                            {user ? `Edit User #${user.id}` : "User Details"}
                        </Label>
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
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-row gap-8">
                                        <div className="flex flex-row">
                                            <img 
                                                className="scale-100 max-w-16 max-h-16 rounded-full" 
                                                src={`${API_BASE_URL}${user.avatarUrl}`}
                                                alt={`${user.name}'s avatar`}
                                            />
                                        </div>  
                                        <div>
                                            <Label className="text-base font-bold">{user.name}</Label>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold text-gray-600">
                                                    {user.utorid}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-600">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                            <div className="flex flex-col gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => {
                                                            console.log('Email changed:', e.target.value);
                                                            setUserEmail(e.target.value);
                                                        }}
                                                        disabled={loading}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="verified">Verified</Label>
                                                        <Switch
                                                            id="verified"
                                                            checked={verified}
                                                            onCheckedChange={(checked) => {
                                                                console.log('Verified changed:', checked);
                                                                setUserVerified(checked);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="suspicious">Suspicious</Label>
                                                        <Switch
                                                            id="suspicious"
                                                            checked={suspicious}
                                                            onCheckedChange={(checked) => {
                                                                console.log('Suspicious changed:', checked);
                                                                setUserSuspicious(checked);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                               <div className="grid gap-2">
                                                    <Label htmlFor="role">Role</Label>
                                                    
                                                    {role === 'regular' || role === 'cashier' ? (
                                                        // Editable select for regular/cashier roles
                                                        <Select
                                                            value={role}
                                                            onValueChange={(value) => {
                                                                console.log("Role changed:", value);
                                                                setUserRole(value);
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select role..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Roles</SelectLabel>
                                                                    <SelectItem value="regular">Regular</SelectItem>
                                                                    <SelectItem value="cashier">Cashier</SelectItem>
                                                                    <SelectItem value="manager">Manager</SelectItem>
                                                                    <SelectItem value="superuser">Super User</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        // Disabled display for other roles (admin, etc.)
                                                        <div className="flex items-center h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-700 cursor-not-allowed">
                                                            <span className="capitalize">{role || 'Unknown'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    type="button"
                                                    onClick={handleDiscard}
                                                    className="bg-gray-100 text-black hover:bg-red-400 hover:text-white transition-colors duration-200"
                                                >
                                                    Discard
                                                </Button>
                                                
                                                <Button 
                                                    type="submit"
                                                    className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                                                >
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </form>
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

export default EditUserPage;