import Layout from "./Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterPage() {
  return (
    <Layout>
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <CardTitle>Register a new user</CardTitle>
        </CardHeader>
        <CardContent>
            <form>
            <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="utorid">UTORID</Label>
                    <Input
                        id="utorid"
                        type="utorid"
                        placeholder="johndoe1"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="name"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="johndoe1@mail.utoronto.ca"
                        required
                    />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit"
                className="w-full border border-[#6EB8D4] bg-[#6EB8D4] text-white rounded hover:bg-[#558FA5] transition-colors duration-200">
                Register
            </Button>
        </CardFooter>
        </Card>
    </Layout>
  )
}

export default RegisterPage