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

export function CreateRedemptionTransactionPage() {
    const navigate = useNavigate();
    const { transaction, createTransaction, loading, error } =
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

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <Label className="text-2xl">Create Redemption Transaction</Label>

                <Card className="w-full pt-4">
                <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-6">
                    {/* Name */}
                        <div>
                            <Label htmlFor="utorid">UTORID</Label>
                            <Input
                            id="utorid"
                            name="utorid"
                            placeholder="Customer UTORID"
                            value={transaction.utorid ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            />
                        </div>

                        {/* Spent */}
                        <div>
                            <Label htmlFor="spent">Spent ($)</Label>
                            <Input
                            id="spent"
                            name="spent"
                            type="number"
                            placeholder="$0"
                            value={transaction.spent ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            />
                        </div>

                        
                        {/* Optional Fields */}
                        <div>
                            <Label htmlFor="promotionIds">Promotion IDs (Optional)</Label>
                            <Input
                            id="promotionIds"
                            name="promotionIds"
                            value={transaction.promotionIds ?? ""}
                            onChange={handleChange}
                            disabled={loading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="remark">Remark (Optional)</Label>
                            <Input
                            id="remark"
                            name="remark"
                            type="number"
                            value={transaction.rate ?? ""}
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
                            onClick={() => navigate("/manage/transactions")}
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

export default CreateRedemptionTransactionPage;
