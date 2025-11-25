import { useNavigate } from "react-router-dom";
import { usePromotion } from "@/context/PromotionContext";

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

export function EditPromotionPage() {
    const navigate = useNavigate();
    const { promotion, setPromotion, patchPromotion, loading, error } =
        usePromotion();

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setPromotion((prev) => ({
        ...prev,
        [name]: type === "number" ? (value ? Number(value) : null) : value || null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patchPromotion(promotion.id, { ...promotion });
            alert("Promotion edited successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
        }
    };

    const handleTimeChange = (field, timeValue) => {
        const [hours, minutes] = timeValue.split(":");
        // Initialize with today if no date exists
        const date = promotion[field] ? new Date(promotion[field]) : new Date();
        date.setHours(Number(hours), Number(minutes));
        setPromotion((p) => ({ ...p, [field]: date.toISOString() }));
    };

    const handleDateSelect = (field, selectedDate) => {
        // Preserve existing time if already selected
        const prevDate = promotion[field] ? new Date(promotion[field]) : new Date(selectedDate);
        const combined = new Date(selectedDate);
        combined.setHours(prevDate.getHours(), prevDate.getMinutes());
        setPromotion((p) => ({ ...p, [field]: combined.toISOString() }));
    };

    return (
        <Layout header={<Header />}>
            <div className="flex flex-col w-full h-full gap-4">
                <Label className="text-2xl">Edit Promotion #{promotion.id}</Label>
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
                            placeholder="My Promotion"
                            value={promotion.name ?? ""}
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
                            value={promotion.description ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                            value={promotion.type ?? ""}
                            onValueChange={(value) =>
                                setPromotion((prev) => ({ ...prev, type: value }))
                            }
                            >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select promotion type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="automatic">Automatic</SelectItem>
                                <SelectItem value="onetime">One Time</SelectItem>
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
                                data-empty={!promotion.startTime}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                <CalendarIcon />
                                {promotion.startTime
                                    ? format(new Date(promotion.startTime), "PPP")
                                    : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={
                                    promotion.startTime
                                    ? new Date(promotion.startTime)
                                    : undefined
                                }
                                onSelect={(date) => handleDateSelect("startTime", date)}
                                />
                            </PopoverContent>
                            </Popover>

                            <Select
                            value={
                                promotion.startTime
                                ? format(new Date(promotion.startTime), "HH:mm")
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
                                    data-empty={!promotion.endTime}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon />
                                    {promotion.endTime
                                    ? format(new Date(promotion.endTime), "PPP")
                                    : "Pick a date"}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={
                                    promotion.endTime ? new Date(promotion.endTime) : undefined
                                    }
                                    onSelect={(date) => handleDateSelect("endTime", date)}
                                />
                                </PopoverContent>
                            </Popover>

                            {/* Time Select */}
                            <Select
                                value={
                                promotion.endTime
                                    ? format(new Date(promotion.endTime), "HH:mm")
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
                        value={promotion.minSpending ?? ""}
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
                        value={promotion.rate ?? ""}
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
                        value={promotion.points ?? ""}
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
                        // onClick={() => handleEditPromotion}
                    >
                        {loading ? "Saving..." : "Save"}
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

export default EditPromotionPage;
