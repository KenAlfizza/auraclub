import { useNavigate } from "react-router-dom";
import { useTransaction } from "@/context/TransactionContext";
import { useUser } from "@/context/UserContext";
import Layout from "@/pages/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

export function CreateRedemptionTransactionPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRedemptionTransaction, loading, error } = useTransaction();

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [transactionSubmitted, setTransactionSubmitted] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Validate amount
    const amountNum = Number(amount);
    try {
      const response = await createRedemptionTransaction({
        type: "redemption",
        amount: amountNum,
        remark: remark || "",
      });

      if (!response) throw new Error(error || "Failed to create redemption request");
      
      setMessage("Redemption request created successfully!");
      setMessageType("success");
      setTransactionSubmitted(response);
    } catch (err) {
      setMessage(err.message || "An error occurred. Please try again.");
      setMessageType("error");
    }
  };

  // Calculate redemption value (1 cent per point)
  const redemptionValue = amount ? (Number(amount) / 100).toFixed(2) : "0.00";

  // SUCCESS PAGE WITH QR CODE
  if (transactionSubmitted) {
    return (
      <Layout header sidebar>
        <div className="flex flex-col w-full h-full gap-4">
          <div className="flex flex-row items-center gap-4">
            <ChevronLeft
              className="hover:cursor-pointer scale-125"
              onClick={() => navigate("/transactions")}
            />
            <Label className="text-2xl">Redemption Request Created</Label>
          </div>

          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Redemption Request #{transactionSubmitted.id}
                  </h2>
                  <p className="text-gray-600">
                    Show this QR code to a cashier to process your redemption
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center py-6">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QRCodeSVG
                      value={JSON.stringify({
                        id: transactionSubmitted.id,
                        type: "redemption",
                        amount: transactionSubmitted.amount,
                        utorid: transactionSubmitted.utorid,
                      })}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-6">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-semibold">#{transactionSubmitted.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-yellow-600">Pending Processing</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Points to Redeem</p>
                    <p className="font-semibold">{transactionSubmitted.amount} points</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Redemption Value</p>
                    <p className="font-semibold text-green-600">
                      ${(transactionSubmitted.amount / 100).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">UTORID</p>
                    <p className="font-semibold">{transactionSubmitted.utorid}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Remark</p>
                    <p className="font-semibold">{transactionSubmitted.remark || "-"}</p>
                  </div>
                </div>

                {/* Info Alert */}
                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> This redemption request will remain pending until
                    processed by a cashier. Once processed, {transactionSubmitted.amount} points
                    will be deducted from your balance and you'll receive $
                    {(transactionSubmitted.amount / 100).toFixed(2)} off your purchase.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button onClick={() => navigate("/transactions")} className="w-full md:w-auto">
                    View My Transactions
                  </Button>
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
            onClick={() => navigate(-1)}
          />
          <Label className="text-2xl">Create Redemption Request</Label>
        </div>

        <Card className="w-full pt-4">
          <CardContent>
            {message && (
              <Alert variant={messageType === "error" ? "destructive" : "default"}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4 mt-4">
              {/* User Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Your UTORID</p>
                      <p className="font-semibold">{user?.utorid || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Points</p>
                      <p className="font-semibold text-blue-600">{user?.points || 0} points</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <p
                        className={`font-semibold ${
                          user?.verified ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user?.verified ? "Verified ✓" : "Not Verified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Redemption Rate</p>
                      <p className="font-semibold">1 point = $0.01</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Warning */}
              {!user?.verified && (
                <Alert variant="destructive">
                  <AlertDescription>
                    You must be verified by a manager before you can redeem points. Please contact
                    a manager to verify your student information.
                  </AlertDescription>
                </Alert>
              )}

              {/* Amount to Redeem */}
              <div>
                <Label htmlFor="amount">Points to Redeem *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Enter points amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={user?.points || 0}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Redemption value: <span className="font-semibold text-green-600">${redemptionValue}</span>
                </p>
              </div>

              {/* Remark */}
              <div>
                <Label htmlFor="remark">Remark (Optional)</Label>
                <Input
                  id="remark"
                  name="remark"
                  placeholder="Add a note about this redemption"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              {/* Info about the process */}
              <Alert>
                <AlertDescription>
                  <strong>How it works:</strong> This will create a redemption request that must be
                  processed by a cashier. Once processed, the points will be deducted from your
                  balance and applied to your purchase.
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex flex-row gap-2 justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#86D46E]"
                  disabled={loading || !user?.verified || !amount}
                >
                  {loading ? "Creating..." : "Create Redemption Request"}
                </Button>

                <Button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="bg-[#D46E6E]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default CreateRedemptionTransactionPage;