import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import Layout from "@/pages/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export function CreateTransferTransactionPage() {
  const navigate = useNavigate();
  const { fetchUserByUtorid, transferPoints, user, loading } = useUser(); // <-- use new function

  const [recipientUTORID, setRecipientUTORID] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [transferSubmitted, setTransferSubmitted] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!recipientUTORID.trim()) {
      setMessage("Please enter a valid recipient UTORID.");
      setMessageType("error");
      return;
    }

    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      setMessage("Please enter a valid positive amount.");
      setMessageType("error");
      return;
    }

    try {
      // Fetch recipient user by UTORID
      const recipientData = await fetchUserByUtorid(recipientUTORID.trim());

      // Call transferPoints with recipient numeric ID
      const response = await transferPoints(recipientData.id, {
        type: "transfer",
        amount: transferAmount,
        remark: remark || "",
      });

      setTransferSubmitted({ ...response, recipient: recipientData, sender: user, });
    } catch (err) {
      setMessage(err.message || "Failed to create transfer transaction.");
      setMessageType("error");
    }
  };

  // Success page
  if (transferSubmitted) {
    return (
      <Layout header sidebar>
        <div className="flex flex-col w-full h-full gap-4">
          <div className="flex flex-row items-center gap-4">
            <ChevronLeft
              className="hover:cursor-pointer scale-125"
              onClick={() => navigate("/points")}
            />
            <Label className="text-2xl">Transfer Points Successful</Label>
          </div>

          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  Transaction #{transferSubmitted.id}
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">Sender</p>
                    <p className="font-semibold">{transferSubmitted.sender.name}</p>
                    <p className="text-sm">{transferSubmitted.sender.utorid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-semibold">{transferSubmitted.recipient.name}</p>
                    <p className="text-sm">{transferSubmitted.recipient.utorid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sent</p>
                    <p className="font-semibold">{Math.abs(transferSubmitted.sent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remark</p>
                    <p className="font-semibold">{transferSubmitted.remark || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold">
                      {transferSubmitted.createdAt
                        ? format(new Date(transferSubmitted.createdAt), "MM/dd/yyyy h:mma")
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Main form
  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-row items-center gap-4">
          <ChevronLeft
            className="hover:cursor-pointer scale-125"
            onClick={() => navigate(-1)}
          />
          <Label className="text-2xl">Transfer Points</Label>
        </div>

        <Card className="w-full pt-4">
          <CardContent>
            {message && (
              <Alert
                variant={messageType === "error" ? "destructive" : "default"}
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4 mt-4">
              {/* Recipient */}
              <div>
                <Label htmlFor="recipient">Recipient UTORID</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient UTORID..."
                  value={recipientUTORID}
                  onChange={(e) => setRecipientUTORID(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter points to transfer"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Remark */}
              <div>
                <Label htmlFor="remark">Remark (Optional)</Label>
                <Input
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-row gap-2 justify-end">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#86D46E]"
                  disabled={loading}
                >
                  {loading ? "Transferring..." : "Transfer"}
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

export default CreateTransferTransactionPage;
