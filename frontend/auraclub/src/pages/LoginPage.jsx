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
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useUser()
  
  const [utorid, setUtorid] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')

    // Basic validation
    if (!utorid || !password) {
      setLoginError('Please fill in all fields')
      return
    }

    try {
      await login(utorid, password)
      // Login successful, redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setLoginError('Incorrect UTORID or password. Please try again.')
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
            {/* Error message display */}
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="utorid">UTORID</Label>
                  <Input
                    id="utorid"
                    type="text"
                    placeholder="johndoe1"
                    value={utorid}
                    onChange={(e) => setUtorid(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-blue-400 text-white hover:bg-blue-500 transition-colors duration-200"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
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
