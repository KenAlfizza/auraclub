import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUser } from "@/context/UserContext";

import { ChevronLeft, Loader2 } from "lucide-react";

export function EditProfilePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, fetchCurrentUser, updateUser } = useUser();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        birthday: "",
        role: "",
        points: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await fetchCurrentUser();
                if (data) {
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        birthday: data.birthday ? data.birthday.split("T")[0] : "",
                        role: data.role || "",
                        points: data.points || 0,
                    });
                }
            } catch {
                setMessageType("error");
                setMessage("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [id]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setSaving(true);

        try {
            await updateUser(id, {
                ...formData,
                points: Number(formData.points)
            });

            setMessage("User updated successfully!");
            setMessageType("success");

            setTimeout(() => navigate(`/manage/users/view/${id}`), 1200);
        } catch (err) {
            console.error(err);
            setMessage("Failed to update user");
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout header sidebar>
            <div className="flex flex-col w-full h-full gap-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="hover:cursor-pointer rounded-full p-2 hover:bg-gray-100" 
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft className="w-8 h-8 text-gray-700" />
                    </div>
                    <div>
                        <Label className="text-3xl font-bold">Edit User</Label>
                        <p className="text-gray-600 mt-1">
                            Modify this user's information and settings
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="shadow rounded-xl w-full">
                    <CardContent className="p-6">
                        {message && (
                            <Alert
                                variant={messageType === "error" ? "destructive" : "default"}
                                className="mb-6"
                            >
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        {loading ? (
                            <p className="text-center py-6">Loading user...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* UTORID */}
                                <div className="flex flex-col gap-2">
                                    <Label>UTORID</Label>
                                    <p>{user.utorid}</p>
                                </div>

                                {/* Name */}
                                <div className="flex flex-col gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Birthday */}
                                <div className="flex flex-col gap-2">
                                    <Label>Birthday</Label>
                                    <Input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                    />
                                </div>


                                {/* Action Buttons */}
                                <div className="col-span-full flex justify-end gap-3 mt-4">
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="bg-[#86D46E] hover:bg-[#75c35d]"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

export default EditProfilePage;
