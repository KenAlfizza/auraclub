import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

import { authAPI } from "@/api/auth-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import Layout from "../Layout";

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false); 
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            setMessageType("error");
            return;
        }

        // Check if new password is same as old password
        if (oldPassword === newPassword) {
            setMessage("New password must be different from the current password.");
            setMessageType("error");
            return;
        }

        setLoading(true);

        try {
            // Replace with your actual API endpoint
            const response = await authAPI.changePassword({old: oldPassword, new: newPassword});
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to change password");
                setMessageType("error");
            } else {
                setMessage(data.message || "Password change successful!");
                setMessageType("success");
                setSuccess(true);
                setTimeout(() => {
                    navigate("/profile");
                }, 3000);
            }
        } catch (err) {
            setMessage(err.message || "An error occurred. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // Check if passwords match for visual feedback
    const passwordsMatch = confirmPassword && newPassword === confirmPassword;
    const passwordsDontMatch = confirmPassword && newPassword !== confirmPassword;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Password Changed Successfully!</h2>
                                <p className="text-gray-600 mt-2">
                                    {"Your password has been successfully changed. Redirecting to profile..."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col w-full items-center gap-4">
            <img src="/src/assets/auraclub_logo.svg" className="block mx-auto scale-75" />
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <Lock/>
                        <CardTitle className="text-2xl text-center">Change Password</CardTitle>
                    </div>
                    <CardDescription className="text-center">
                        Enter your current and new password below
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {message && (
                            <Alert variant={messageType === "error" ? "destructive" : "default"}>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="oldPassword"
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="Enter current password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className={
                                        passwordsDontMatch 
                                            ? "border-red-500 focus:border-red-500" 
                                            : passwordsMatch 
                                            ? "border-green-500 focus:border-green-500" 
                                            : ""
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordsDontMatch && (
                                <p className="text-sm text-red-600">Passwords do not match</p>
                            )}
                            {passwordsMatch && (
                                <p className="text-sm text-green-600">✓ Passwords match</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !newPassword || !confirmPassword || passwordsDontMatch}
                        >
                            {loading ? "Changing Password..." : "Change Password"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate("/profile")}
                            disabled={loading}
                        >
                            Back to Profile
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            </div>
        </Layout>
    );
}

export default ChangePasswordPage;