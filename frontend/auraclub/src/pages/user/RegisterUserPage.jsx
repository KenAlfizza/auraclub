import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

import Layout from "../Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus2, ChevronLeft } from "lucide-react";

export function RegisterUserPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useUser();

  const [utorid, setUtorid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (!utorid || !name || !email) {
      setRegisterError("Please fill in all fields");
      return;
    }

    try {
      await register(utorid, name, email);
      navigate("/manage/users");
    } catch (err) {
      setRegisterError(err.message || "Register failed. Please check the credentials.");
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 p-2">
        {/* Header */}
        <div className="flex items-center gap-2">
             <div 
                className="rounded-full hover:bg-gray-100 p-2 cursor-pointer flex items-center justify-center"
                onClick={() => navigate(-1)}
            >
                <ChevronLeft className="w-8 h-8 text-gray-700" />
            </div>
          <div>
            <Label className="text-3xl font-bold flex items-center gap-2">
              <UserPlus2 className="h-6 w-6" />
              Register User
            </Label>
            <p className="text-gray-600 mt-1">
              Fill in the details below to register a new user
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="w-full mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-8">
            {/* Error Messages */}
            {(registerError || error) && (
              <Badge variant="destructive" className="mb-6 w-full text-center">
                {registerError || error}
              </Badge>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="utorid">UTORID</Label>
                <Input
                  id="utorid"
                  placeholder="johndoe1"
                  value={utorid}
                  onChange={(e) => setUtorid(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe1@mail.utoronto.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  className="bg-green-500 text-white hover:bg-blue-600 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default RegisterUserPage;
