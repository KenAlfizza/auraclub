import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { useTransaction } from "@/context/TransactionContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";

export function ProcessRedemptionPage() {
  const navigate = useNavigate();
  const { fetchRedemptionDetails, processRedemption, loading } = useTransaction();

  const [transactionId, setTransactionId] = useState("");
  const [transactionData, setTransactionData] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Lookup transaction details
  const handleLookup = async () => {
    setMessage("");
    setMessageType("");
    setTransactionData(null);

    if (!transactionId) {
      setMessage("Please enter a transaction ID");
      setMessageType("error");
      return;
    }

    try {
      const transaction = await fetchRedemptionDetails(transactionId);
      setTransactionData(transaction);
    } catch (err) {
      setMessage(err.message || "Transaction not found or invalid");
      setMessageType("error");
    }
  };

  // Process redemption
  const handleProcess = async () => {
    if (!transactionData) return;

    setMessage("");
    setMessageType("");

    try {
      const updatedTransaction = await processRedemption(transactionId);
      setTransactionData(updatedTransaction);
      setMessage("Redemption successfully processed!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to process redemption");
      setMessageType("error");
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate("/manage/transactions")}
          />
          <Label className="text-2xl">Process Redemption</Label>
        </div>

        {/* Lookup Card */}
        <Card className="w-full pt-4">
          <CardContent>
            {message && (
              <Alert variant={messageType === "error" ? "destructive" : "default"}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4 mt-4">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <div className="flex gap-2">
                <Input
                  id="transactionId"
                  type="number"
                  placeholder="Enter redemption transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <Button type="button" onClick={handleLookup} disabled={loading}>
                  {loading ? "Looking up..." : "Lookup"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details Card */}
        {transactionData && (
          <Card className="w-full bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-semibold">{transactionData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer UTORID</p>
                  <p className="font-semibold">{transactionData.utorid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold">
                    {transactionData.redeemed || transactionData.amount} points
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remark</p>
                  <p className="font-semibold">{transactionData.remark || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-semibold">{transactionData.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processed By</p>
                  <p className="font-semibold">{transactionData.processedBy || "-"}</p>
                </div>
              </div>

              {/* Process Redemption Button */}
              {!transactionData.processedBy && (
                <div className="flex flex-row gap-2 justify-end mt-4">
                  <Button
                    type="button"
                    onClick={handleProcess}
                    className="bg-[#86D46E]"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Process Redemption"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/manage/transactions")}
                    className="bg-[#D46E6E]"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default ProcessRedemptionPage;
