import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useUser } from "@/context/UserContext"

import Layout from "./Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"

export function LoginPage() {
    const navigate = useNavigate()
    const { login, loading, error } = useUser()
    
    const [utorid, setUtorid] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoginError('')

        console.log('Form submitted!')
        console.log('Utorid:', utorid)
        console.log('Password:', password)
        
        // Basic validation
        if (!utorid || !password) {
        setLoginError('Please fill in all fields')
        return
        }

        try {
        const data = await login(utorid, password)





        // Login successful, redirect to profile
        navigate('/dashboard')
        } catch (err) {
            setLoginError(err.message || 'Login failed. Please check your credentials.')
        }
    }
    
    return (
        <Layout>
        <div className="flex flex-col w-full items-center gap-4">
            <img src="/src/assets/auraclub_logo.svg" className="block mx-auto scale-75" />
        <Card className="w-full max-w-md">
        <CardHeader>
            <div className="flex items-center justify-center gap-2">
                <LogIn/>
                <CardTitle className="text-2xl text-center">Login</CardTitle>
            </div>
            <CardDescription className="text-center">
                Enter your UTORID and password below
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <div className="grid gap-2">
                <Label htmlFor="utorid">UTORID</Label>
                <Input
                    id="utorid"
                    type="utorid"
                    placeholder="johndoe1"
                    value={utorid}
                    onChange={(e) => {
                        console.log('Utorid changed:', e.target.value)
                        setUtorid(e.target.value)
                    }}
                    disabled={loading}
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
                <Input 
                    id="password" 
                    type="password" 
                    onChange={(e) => {
                    console.log('Password changed')
                    setPassword(e.target.value)
                    }}
                    disabled={loading}
                    required 
                />
                </div>
            </div>
            <div className="flex justify-end">
                <Button className="bg-blue-400 text-[#FFFFFF] hover:bg-blue-500 hover:text-white transition-colors duration-200" type="submit">
                    Login
                </Button>
            </div>

            </form>
        </CardContent>
        </Card>
        </div>
    </Layout>
  )
}

export default LoginPage