import { useNavigate } from "react-router-dom";
import { useTransaction } from "@/context/TransactionContext";
import { userAPI } from "@/api/user-api";
import Layout from "@/pages/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ChevronLeft, X, Check, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function CreatePurchaseTransactionPage() {
    const navigate = useNavigate();
    const [transactionSubmitted, setTransactionSubmitted] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [selectedPromotions, setSelectedPromotions] = useState([]);
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [loadingPromotions, setLoadingPromotions] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [openUserCombobox, setOpenUserCombobox] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { transaction, setTransaction, createPurchaseTransaction, loading, error } =
        useTransaction();

    useEffect(() => { fetchAllUsers(); }, []);

    useEffect(() => {
        const promotionIds = selectedPromotions.map(p => p.id);
        setTransaction(prev => ({
            ...prev,
            promotionIds: promotionIds.length > 0 ? promotionIds : null,
        }));
    }, [selectedPromotions, setTransaction]);

    const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
            const usersData = await userAPI.getAll();
            setAllUsers(usersData.results || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch promotions for a specific user
    const fetchPromotionsForUser = async (userId) => {
        if (!userId) return;
        setLoadingPromotions(true);
        setMessage("");
        setMessageType("");

        try {
            const userData = await userAPI.get(userId);
            const available = userData.promotions?.available || [];
            setAvailablePromotions(available);
            setSelectedPromotions([]);

            if (available.length === 0) {
                setMessage('No promotions available for this user.');
                setMessageType('default');
            } else {
                setMessage(`Loaded ${available.length} promotion(s) for ${userData.name || userData.utorid}`);
                setMessageType('default');
            }
        } catch (err) {
            console.error('Error fetching promotions:', err);
            setMessage(`Failed to load promotions: ${err.message}`);
            setMessageType('error');
            setAvailablePromotions([]);
            setSelectedPromotions([]);
        } finally {
            setLoadingPromotions(false);
        }
    };

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        setOpenUserCombobox(false);
        setTransaction(prev => ({ ...prev, utorid: user.utorid }));
        await fetchPromotionsForUser(user.id);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setTransaction(prev => ({
            ...prev,
            [name]: type === "number" ? (value ? Number(value) : null) : value || null,
        }));
    };

    const handleAddPromotion = (promotionId) => {
        const promotion = availablePromotions.find(p => p.id === promotionId);
        if (promotion && !selectedPromotions.find(p => p.id === promotionId)) {
            setSelectedPromotions([...selectedPromotions, promotion]);
        }
    };

    const handleRemovePromotion = (promotionId) => {
        setSelectedPromotions(prev => prev.filter(p => p.id !== promotionId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        try {
            const response = await createPurchaseTransaction();
            if (error) {
                setMessage(error || "Failed to create purchase transaction");
                setMessageType("error");
            } else {
                setMessage("Purchase transaction created!");
                setMessageType("success");
                setTransactionSubmitted(response);
            }
        } catch (err) {
            setMessage(err.message || "An error occurred. Please try again.");
            setMessageType("error");
        }
    };

    // JSX rendering (transaction submitted or create form)
    if (transactionSubmitted) {
        return (
            <Layout header={true} sidebar={true}>
                <div className="flex flex-col w-full h-full gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <ChevronLeft className="hover:cursor-pointer scale-125" onClick={() => navigate("/manage/transactions")}/>
                        <Label className="text-2xl">Purchase Transaction Created</Label>
                    </div>
                    <Card className="w-full">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Transaction #{transactionSubmitted.id}</h2>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <p className="text-sm text-gray-500">UTORID</p>
                                        <p className="font-semibold">{transactionSubmitted.utorid}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-semibold">{transactionSubmitted.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Spent</p>
                                        <p className="font-semibold">{transactionSubmitted.spent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Promotions</p>
                                        <p className="font-semibold">
                                            {transactionSubmitted.promotions?.length
                                                ? transactionSubmitted.promotions.map(p => p.name).join(", ")
                                                : "None"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Points Earned</p>
                                        <p className="font-semibold">{transactionSubmitted.earned}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Created By</p>
                                        <p className="font-semibold">{transactionSubmitted.createdBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p className="font-semibold">{format(new Date(transactionSubmitted.createdAt), "MM/dd/yyyy h:mma")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Remark</p>
                                        <p className="font-semibold">{transactionSubmitted.remark}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout header={true} sidebar={true}>
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex flex-row items-center gap-4">
                    <ChevronLeft className="hover:cursor-pointer scale-125" onClick={() => navigate("/manage/transactions")}/>
                    <Label className="text-2xl">Create Purchase Transaction</Label>
                </div>
                <Card className="w-full pt-4">
                    <CardContent>
                        {message && (
                            <Alert variant={messageType === "error" ? "destructive" : "default"}>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <Label htmlFor="utorid">UTORID</Label>
                                    <Popover open={openUserCombobox} onOpenChange={setOpenUserCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openUserCombobox}
                                                className="w-full justify-between"
                                                disabled={loading || loadingUsers}
                                            >
                                                {selectedUser
                                                    ? `${selectedUser.utorid} - ${selectedUser.name}`
                                                    : loadingUsers
                                                        ? "Loading users..."
                                                        : allUsers.length === 0
                                                            ? "No users available"
                                                            : "Select user..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search by UTORID or name..." />
                                                <CommandEmpty>No user found.</CommandEmpty>
                                                <CommandGroup className="max-h-64 overflow-auto">
                                                    {allUsers.map(user => (
                                                        <CommandItem key={user.id} value={`${user.utorid} ${user.name}`} onSelect={() => handleUserSelect(user)}>
                                                            <Check className={cn("mr-2 h-4 w-4", selectedUser?.id === user.id ? "opacity-100" : "opacity-0")} />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{user.utorid}</span>
                                                                <span className="text-sm text-gray-500">{user.name}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {loadingUsers && <p className="text-sm text-gray-500 mt-1">Loading users...</p>}
                                    {!loadingUsers && allUsers.length === 0 && <p className="text-sm text-red-500 mt-1">No users found. Please check your connection.</p>}
                                    {loadingPromotions && <p className="text-sm text-gray-500 mt-1">Loading available promotions...</p>}
                                </div>

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

                                <div>
                                    <Label htmlFor="promotions">Promotions (Optional)</Label>
                                    <Select onValueChange={handleAddPromotion} disabled={loading || loadingPromotions || availablePromotions.length === 0} value="">
                                        <SelectTrigger className="w-full min-h-10 h-auto">
                                            <div className="flex flex-wrap gap-1 flex-1 py-1">
                                                {selectedPromotions.length === 0
                                                    ? <span className="text-muted-foreground">{availablePromotions.length === 0 ? "Select user to load promotions" : "Select promotions to apply"}</span>
                                                    : selectedPromotions.map(promo => (
                                                        <div key={promo.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                                                            <span>{promo.name}</span>
                                                            <span
                                                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePromotion(promo.id); }}
                                                                className="hover:bg-blue-200 rounded-full p-0.5 cursor-pointer inline-flex items-center"
                                                                role="button"
                                                                aria-label={`Remove ${promo.name}`}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePromotions
                                                .filter(p => !selectedPromotions.find(sp => sp.id === p.id))
                                                .map(promo => (
                                                    <SelectItem key={promo.id} value={promo.id}>{promo.name}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="remark">Remark (Optional)</Label>
                                    <Input
                                        id="remark"
                                        name="remark"
                                        value={transaction.remark ?? ""}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                {error && <p className="text-red-500">{error}</p>}
                            </div>

                            <div className="flex flex-row gap-2 justify-end">
                                <Button type="button" onClick={handleSubmit} className="bg-[#86D46E]" disabled={loading}>
                                    {loading ? "Creating..." : "Create"}
                                </Button>
                                <Button type="button" onClick={() => navigate("/manage/transactions")} className="bg-[#D46E6E]">
                                    Discard
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

export default CreatePurchaseTransactionPage;
