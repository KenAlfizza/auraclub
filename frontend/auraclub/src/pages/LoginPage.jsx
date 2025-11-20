import Layout from "./Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  return (
    <Layout>
        <Card className="w-full max-w-sm">
        <CardHeader>
            <img src="/src/assets/auraclub_logo.svg" className="block mx-auto scale-90" />
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
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                    Forgot password?
                    </a>
                </div>
                <Input id="password" type="password" required />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit">
            Login
            </Button>
        </CardFooter>
        </Card>
    </Layout>
  )
}

export default LoginPage