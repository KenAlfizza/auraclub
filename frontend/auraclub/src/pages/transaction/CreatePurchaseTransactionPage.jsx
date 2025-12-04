import { useNavigate } from "react-router-dom";
import { useTransaction } from "@/context/TransactionContext";
import { useUser } from "@/context/UserContext";
import Layout from "@/pages/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export function CreatePurchaseTransactionPage() {
  const navigate = useNavigate();
  const { lookupUserPromotions } = useUser();
  const { transaction, setTransaction, createPurchaseTransaction, loading, error } =
    useTransaction();

  const [utoridInput, setUtoridInput] = useState("");
  const [userSearchResult, setUserSearchResult] = useState(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [openPromotionCombobox, setOpenPromotionCombobox] = useState(false);

  const [transactionSubmitted, setTransactionSubmitted] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // SEARCH USER
  const searchUser = async () => {
    if (!utoridInput.trim()) return;

    setHasSearched(true);
    setUserSearchLoading(true);
    setUserSearchResult(null);
    setMessage("");
    setMessageType("");

    try {
      const userData = await lookupUserPromotions(utoridInput.trim());
      setUserSearchResult(userData || null);
      setAvailablePromotions(userData?.promotions?.available || []);
    } catch (err) {
      setUserSearchResult(null);
      setAvailablePromotions([]);
      setMessage(err.message || "User not found");
      setMessageType("error");
    } finally {
      setUserSearchLoading(false);
    }
  };

  // SELECT USER
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setTransaction((prev) => ({ ...prev, utorid: user.utorid }));
    setSelectedPromotions([]);
    setFilteredPromotions(user.promotions?.available || []);
    setUtoridInput("");
    setHasSearched(false);
    setUserSearchResult(null);
  };

  // CLEAR SELECTED USER
  const clearSelectedUser = () => {
    setSelectedUser(null);
    setAvailablePromotions([]);
    setFilteredPromotions([]);
    setSelectedPromotions([]);
    setTransaction((prev) => ({ ...prev, utorid: null, promotionIds: null }));
  };

  // UPDATE PROMOTION IDS IN TRANSACTION
  useEffect(() => {
    setTransaction((prev) => ({
      ...prev,
      promotionIds: selectedPromotions.length > 0 ? selectedPromotions.map((p) => p.id) : null,
    }));
  }, [selectedPromotions, setTransaction]);

  // FILTER PROMOTIONS BASED ON SPENT
  useEffect(() => {
    const spentAmount = Number(transaction.spent) || 0;
    setFilteredPromotions(
      availablePromotions.filter(
        (p) => !selectedPromotions.some((sp) => sp.id === p.id) && p.minSpending <= spentAmount
      )
    );
  }, [transaction.spent, availablePromotions, selectedPromotions]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setTransaction((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value || "",
    }));
  };

  const handleAddPromotion = (promoId) => {
    const promo = availablePromotions.find((p) => p.id === promoId);
    if (promo && !selectedPromotions.some((p) => p.id === promo.id)) {
      setSelectedPromotions([...selectedPromotions, promo]);
    }
  };

  const handleRemovePromotion = (promoId) => {
    setSelectedPromotions(selectedPromotions.filter((p) => p.id !== promoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const response = await createPurchaseTransaction();
      if (!response) throw new Error(error || "Failed to create transaction");
      setMessage("Purchase transaction created!");
      setMessageType("success");
      setTransactionSubmitted(response);
    } catch (err) {
      setMessage(err.message || "An error occurred. Please try again.");
      setMessageType("error");
    }
  };

  // SUCCESS PAGE
  if (transactionSubmitted) {
    return (
      <Layout header sidebar>
        <div className="flex flex-col w-full h-full gap-4">
          <div className="flex flex-row items-center gap-4">
            <ChevronLeft
              className="hover:cursor-pointer scale-125"
              onClick={() => navigate("/manage/transactions")}
            />
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
                    <p className="text-sm text-gray-500">Spent</p>
                    <p className="font-semibold">{transactionSubmitted.spent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Promotions</p>
                    <p className="font-semibold">
                      {transactionSubmitted.promotions?.length
                        ? transactionSubmitted.promotions.map((p) => p.name).join(", ")
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Points Earned</p>
                    <p className="font-semibold">{transactionSubmitted.earned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold">
                      {format(new Date(transactionSubmitted.createdAt), "MM/dd/yyyy h:mma")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remark</p>
                    <p className="font-semibold">{transactionSubmitted.remark || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // MAIN FORM
  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-row items-center gap-4">
          <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate("/manage/transactions")}
          />
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
              {/* UTORID Search */}
              <div>
                <Label htmlFor="utorid">UTORID</Label>
                <div className="flex gap-2">
                  <Input
                    id="utorid"
                    placeholder="Enter UTORID..."
                    value={utoridInput}
                    onChange={(e) => setUtoridInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchUser();
                      }
                    }}
                    disabled={!!selectedUser}
                  />
                  <Button
                    type="button"
                    onClick={searchUser}
                    disabled={userSearchLoading || !!selectedUser}
                  >
                    {userSearchLoading ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Search result */}
                {userSearchResult && !selectedUser && !userSearchLoading && (
                  <div
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer mt-2"
                    onClick={() => handleUserSelect(userSearchResult)}
                  >
                    <p className="font-medium">{userSearchResult.utorid}</p>
                    <p className="text-sm text-gray-600">{userSearchResult.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Points: {userSearchResult.points} | Verified:{" "}
                      {userSearchResult.verified ? "Yes" : "No"}
                    </p>
                    {userSearchResult.promotions?.available && (
                      <p className="text-sm text-blue-600 mt-1">
                        {userSearchResult.promotions.available.length} promotion(s) available
                      </p>
                    )}
                  </div>
                )}

                {hasSearched && !userSearchResult && !userSearchLoading && (
                  <p className="text-sm text-red-500 mt-1">
                    No user found with UTORID: {utoridInput}
                  </p>
                )}

                {selectedUser && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md mt-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-700">
                        ✓ Selected: {selectedUser.utorid} ({selectedUser.name})
                      </p>
                      <p className="text-xs text-green-600">
                        Points: {selectedUser.points} | Available Promotions: {availablePromotions.length}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={clearSelectedUser}>
                      Clear
                    </Button>
                  </div>
                )}
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
                  required
                />
              </div>

              {/* Promotions */}
              <div>
                <Label htmlFor="promotions">Promotions (Optional)</Label>
                <Popover open={openPromotionCombobox} onOpenChange={setOpenPromotionCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between min-h-10 h-auto"
                      disabled={!selectedUser}
                    >
                      <div className="flex flex-wrap gap-1 flex-1 py-1">
                        {selectedPromotions.length === 0 ? (
                          <span className="text-muted-foreground truncate">
                            {!selectedUser
                              ? "Search and select user first"
                              : availablePromotions.length === 0
                              ? "No promotions available"
                              : "Select promotions"}
                          </span>
                        ) : (
                          selectedPromotions.map((promo) => (
                            <div
                              key={promo.id}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm"
                            >
                              <span>{promo.name}</span>
                              <span
                                onClick={() => handleRemovePromotion(promo.id)}
                                className="hover:bg-blue-200 rounded-full p-0.5 cursor-pointer inline-flex items-center"
                              >
                                <X className="w-3 h-3" />
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search promotions..." />
                      <CommandEmpty>
                        {filteredPromotions.length === 0
                          ? "No promotions available"
                          : "No promotions match your search"}
                      </CommandEmpty>

                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredPromotions.map((promo) => (
                          <CommandItem
                            key={promo.id}
                            value={promo.name}
                            className="flex justify-between items-center"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{promo.name}</span>
                              <span className="text-xs text-gray-500">
                                Rate: {promo.rate || 0}x | Min: ${promo.minSpending || 0} | Points: +{promo.points || 0}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddPromotion(promo.id)}
                            >
                              Add
                            </Button>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Remark */}
              <div>
                <Label htmlFor="remark">Remark (Optional)</Label>
                <Input
                  id="remark"
                  name="remark"
                  value={transaction.remark ?? ""}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              {/* Buttons */}
              <div className="flex flex-row gap-2 justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#86D46E]"
                  disabled={loading || !selectedUser}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>

                <Button
                  type="button"
                  onClick={() => navigate("/manage/transactions")}
                  className="bg-[#D46E6E]"
                >
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
