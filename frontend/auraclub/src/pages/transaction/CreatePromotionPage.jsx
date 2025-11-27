import { useNavigate } from "react-router-dom";
import { useTransaction } from "@/context/TransactionContext";

import Layout from "@/pages/Layout";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/app/appHeader";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CreateTransactionPage() {
    const navigate = useNavigate();
    const { transaction, setTransaction, createTransaction, loading, error } =
        useTransaction();

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setTransaction((prev) => ({
        ...prev,
        [name]: type === "number" ? (value ? Number(value) : null) : value || null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await createTransaction();
        alert("Transaction created successfully!");
        navigate("/dashboard");
        } catch (err) {
            console.error(err);
        }
    };

    const handleTimeChange = (field, timeValue) => {
        const [hours, minutes] = timeValue.split(":");
        // Initialize with today if no date exists
        const date = transaction[field] ? new Date(transaction[field]) : new Date();
        date.setHours(Number(hours), Number(minutes));
        setTransaction((p) => ({ ...p, [field]: date.toISOString() }));
    };

    const handleDateSelect = (field, selectedDate) => {
        // Preserve existing time if already selected
        const prevDate = transaction[field] ? new Date(transaction[field]) : new Date(selectedDate);
        const combined = new Date(selectedDate);
        combined.setHours(prevDate.getHours(), prevDate.getMinutes());
        setTransaction((p) => ({ ...p, [field]: combined.toISOString() }));
    };

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <Label className="text-2xl">Create Transaction</Label>

                <Card className="w-full pt-4">
                <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-6">
                    {/* Name */}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                            id="name"
                            name="name"
                            placeholder="My Transaction"
                            value={transaction.name ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                            id="description"
                            name="description"
                            placeholder="Description"
                            value={transaction.description ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                            value={transaction.type ?? ""}
                            onValueChange={(value) =>
                                setTransaction((prev) => ({ ...prev, type: value }))
                            }
                            >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="automatic">Automatic</SelectItem>
                                <SelectItem value="one-time">One Time</SelectItem>
                            </SelectContent>
                            </Select>

                        </div>
                        {/* Start Time */}
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="startTime">Start</Label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                data-empty={!transaction.startTime}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                <CalendarIcon />
                                {transaction.startTime
                                    ? format(new Date(transaction.startTime), "PPP")
                                    : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={
                                    transaction.startTime
                                    ? new Date(transaction.startTime)
                                    : undefined
                                }
                                onSelect={(date) => handleDateSelect("startTime", date)}
                                />
                            </PopoverContent>
                            </Popover>

                            <Select
                            value={
                                transaction.startTime
                                ? format(new Date(transaction.startTime), "HH:mm")
                                : ""
                            }
                            onValueChange={(value) => handleTimeChange("startTime", value)}>
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 24 * 2 }).map((_, i) => {
                                const h = Math.floor(i / 2)
                                    .toString()
                                    .padStart(2, "0");
                                const m = i % 2 === 0 ? "00" : "30";
                                const value = `${h}:${m}`;
                                return (
                                    <SelectItem key={value} value={value}>
                                    {value}
                                    </SelectItem>
                                );
                                })}
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="endTime">End</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!transaction.endTime}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon />
                                    {transaction.endTime
                                    ? format(new Date(transaction.endTime), "PPP")
                                    : "Pick a date"}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={
                                    transaction.endTime ? new Date(transaction.endTime) : undefined
                                    }
                                    onSelect={(date) => handleDateSelect("endTime", date)}
                                />
                                </PopoverContent>
                            </Popover>

                            {/* Time Select */}
                            <Select
                                value={
                                transaction.endTime
                                    ? format(new Date(transaction.endTime), "HH:mm")
                                    : ""
                                }
                                onValueChange={(value) => handleTimeChange("endTime", value)}
                            >
                                <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                {Array.from({ length: 24 * 2 }).map((_, i) => {
                                    const h = Math.floor(i / 2)
                                    .toString()
                                    .padStart(2, "0");
                                    const m = i % 2 === 0 ? "00" : "30";
                                    const value = `${h}:${m}`;
                                    return (
                                    <SelectItem key={value} value={value}>
                                        {value}
                                    </SelectItem>
                                    );
                                })}
                                </SelectContent>
                            </Select>
                        </div>

                    {/* Optional Fields */}
                    <div>
                        <Label htmlFor="minSpending">Minimum Spending (Optional)</Label>
                        <Input
                        id="minSpending"
                        name="minSpending"
                        value={transaction.minSpending ?? ""}
                        onChange={handleChange}
                        disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="rate">Rate (Optional)</Label>
                        <Input
                        id="rate"
                        name="rate"
                        type="number"
                        value={transaction.rate ?? ""}
                        onChange={handleChange}
                        disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="points">Points (Optional)</Label>
                        <Input
                        id="points"
                        name="points"
                        type="number"
                        value={transaction.points ?? ""}
                        onChange={handleChange}
                        disabled={loading}
                        />
                    </div>

                    {error && <p className="text-red-500">{error}</p>}
                    </div>

                    <div className="flex flex-row gap-2 justify-end">
                    <Button
                        type="submit"
                        className="bg-[#86D46E]"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboard")}
                        className="bg-[#D46E6E]"
                    >
                        Discard
                    </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
            </div>
        </Layout>
    );
}

export default CreateTransactionPage;
