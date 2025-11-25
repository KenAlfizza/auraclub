import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useUser } from "@/context/UserContext"

import Layout from "./Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
        await login(utorid, password)
        // Login successful, redirect to profile
        navigate('/profile')
        } catch (err) {
            setLoginError(err.message || 'Login failed. Please check your credentials.')
        }
    }
    
    return (
    <Layout>
        <Card className="w-full max-w-sm">
        <CardHeader>
            <img src="/src/assets/auraclub_logo.svg" className="block mx-auto scale-90" />
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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
                <Button type="submit">
                Login
                </Button>
            </form>
        </CardContent>
        </Card>
    </Layout>
  )
}

export default LoginPage