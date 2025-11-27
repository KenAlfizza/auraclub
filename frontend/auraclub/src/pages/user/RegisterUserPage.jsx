import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useUser } from "@/context/UserContext"

import Layout from "../Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus2 } from "lucide-react"

export function RegisterUserPage() {
    const navigate = useNavigate()

    const {register, loading, error} = useUser()

    const [utorid, setUtorid] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setRegisterError('')

        console.log('Form submitted!')
        
        // Basic validation
        if (!utorid || !name || !email) {
            setRegisterError('Please fill in all fields')
            return
        }

        try {
            await register(utorid, name, email)
            // Register successful, redirect to profile
            navigate('/profile')
        } catch (err) {
            setRegisterError(err.message || 'Register failed. Please check the credentials.')
        }
    }

    return (
    <Layout header={true} sidebar={true}>
        <Card className="w-full max-w-md">
        <CardHeader>
            <div className="flex items-center justify-center gap-2">
                <UserPlus2/>
                <CardTitle className="text-2xl text-center">Register User</CardTitle>
            </div>
            <CardDescription className="text-center">
                Enter UTORID, name, and email below
            </CardDescription>
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
                        onChange={(e) => {
                            console.log('Utorid changed:', e.target.value)
                            setUtorid(e.target.value)
                        }}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="name"
                        placeholder="John Doe"
                        onChange={(e) => {
                            console.log('Name changed:', e.target.value)
                            setName(e.target.value)
                        }}
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
                        onChange={(e) => {
                            console.log('Email changed:', e.target.value)
                            setEmail(e.target.value)
                        }}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <Button className="bg-blue-400 text-[#FFFFFF] hover:bg-blue-500 hover:text-white transition-colors duration-200" type="submit">
                        Register
                    </Button>
                </div>
                </div>
            </form>
        </CardContent>
        </Card>
    </Layout>
  )
}

export default RegisterUserPage