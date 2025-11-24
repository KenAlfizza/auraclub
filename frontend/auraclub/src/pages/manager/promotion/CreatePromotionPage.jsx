import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useUser } from "@/context/UserContext"

import Layout from "@/pages/Layout"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/app/app-header"


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
 

export function CreatePromotionPage() {

    const navigate = useNavigate()

    const {register, loading, error} = useUser()
    
    const [name, setName] = useState(null)
    const [description, setDescription] = useState(null)
    const [type, setType] = useState(null)
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [rate, setRate] = useState(null)
    const [points, setPoints] = useState(null)

    const handleSubmit = async (e) => {
        // e.preventDefault()
        // setRegisterError('')

        // console.log('Form submitted!')
        
        // // Basic validation
        // if (!utorid || !name || !email) {
        //     setRegisterError('Please fill in all fields')
        //     return
        // }

        // try {
        //     await register(utorid, name, email)
        //     // Register successful, redirect to profile
        //     navigate('/profile')
        // } catch (err) {
        //     setRegisterError(err.message || 'Register failed. Please check the credentials.')
        // }
    }

    return (
    <Layout header={<Header/>}>
        <Card className="w-1/2">
        <CardHeader className="text-center">
            <CardTitle>Create Promotion</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-6">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="name"
                        placeholder="My Promotion"
                        onChange={(e) => {
                            console.log('Promotion name changed:', e.target.value)
                            setName(e.target.value)
                        }}
                        disabled={loading}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        type="description"
                        placeholder="Description"
                        onChange={(e) => {
                            console.log('Promotion description changed:', e.target.value)
                            setDescription(e.target.value)
                        }}
                        disabled={loading}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="type">Type</Label>
                    <Select onValueChange={(value) => {
                            setType(value)
                            console.log('Promotion type changed:', value)}}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select promotion type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="one-time">One Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-row gap-2 w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <Label htmlFor="startDate" className="px-1">
                            Start Date
                        </Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            data-empty={!startDate}
                            className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                            >
                            <CalendarIcon />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                        </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <Label htmlFor="endDate" className="px-1">
                            End Date
                        </Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            data-empty={!endDate}
                            className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                            >
                            <CalendarIcon />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                        </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div>
                    <Label htmlFor="minSpending">Minimum Spending (Optional)</Label>
                    <Input
                        id="minSpending"
                        type="minSpending"
                        placeholder=""
                        onChange={(e) => {
                            console.log('Promotion minSpending changed:', e.target.value)
                            setC(e.target.value)
                        }}
                        disabled={loading}
                    />
                </div>
                <div>
                    <Label htmlFor="rate">Rate (Optional)</Label>
                    <Input
                        id="rate"
                        type="rate"
                        placeholder=""
                        onChange={(e) => {
                            console.log('Promotion rate changed:', e.target.value)
                            setC(e.target.value)
                        }}
                        disabled={loading}
                    />
                </div>

                <div>
                    <Label htmlFor="points">Points (Optional)</Label>
                    <Input
                        id="points"
                        type="points"
                        placeholder=""
                        onChange={(e) => {
                            console.log('Promotion points changed:', e.target.value)
                            setPoints(e.target.value)
                        }}
                        disabled={loading}
                    />
                </div>
                
            </div>
            <div className="flex flex-row gap-2 justify-end">
                    <Button className="bg-[#86D46E]">Create</Button>
                    <Button onClick={() => navigate('/dashboard')} className="bg-[#D46E6E]">Discard</Button>
            </div>
            </form>
        </CardContent>
        </Card>
    </Layout>
  )
}

export default  CreatePromotionPage