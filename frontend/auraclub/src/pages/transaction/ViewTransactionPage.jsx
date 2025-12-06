import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  ChevronLeft,
  TrendingUp,
  Gift,
  ArrowLeftRight,
  RefreshCcw,
} from "lucide-react";

import { useTransaction } from "@/context/TransactionContext";

export function ViewTransactionPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const { fetchTransaction, setSuspicious, loading } = useTransaction();

  const [transaction, setTransaction] = useState(null);
  const [pendingSuspicious, setPendingSuspicious] = useState(null);
  const [error, setError] = useState(null);

  // Load transaction
  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const data = await fetchTransaction(transactionId);
        setTransaction(data);
        setPendingSuspicious(null);
      } catch (err) {
        console.error("Failed to fetch transaction", err);
        setError("Failed to load transaction.");
      }
    })();
  }, [transactionId]);

  const formatSafeDate = (date) => {
    try {
      return date ? new Date(date).toLocaleString() : "-";
    } catch {
      return "-";
    }
  };

  const renderIcon = () => {
    switch (transaction?.type) {
      case "purchase":
        return <TrendingUp className="w-8 h-8 text-green-800" />;
      case "redemption":
        return <Gift className="w-8 h-8 text-purple-800" />;
      case "transfer":
        return <ArrowLeftRight className="w-8 h-8 text-blue-800" />;
      case "event":
        return <Gift className="w-8 h-8 text-yellow-800" />;
      default:
        return <RefreshCcw className="w-8 h-8 text-gray-800" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout header sidebar>
        <div className="flex justify-center items-center p-12">
          Loading transaction...
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout header sidebar>
        <div className="text-red-600 text-center p-12">{error}</div>
      </Layout>
    );
  }

  // Transaction not found
  if (!transaction) {
    return (
      <Layout header sidebar>
        <div className="text-gray-600 text-center p-12">
          Transaction not found.
        </div>
      </Layout>
    );
  }

  const t = transaction;
  const isSent = t.type === "transfer" && t.amount < 0;
  const title =
    t.type === "transfer"
      ? isSent
        ? "Transfer Sent"
        : "Transfer Received"
      : t.type
      ? t.type[0].toUpperCase() + t.type.slice(1)
      : "Transaction";

  const effectiveSuspicious =
    pendingSuspicious !== null ? pendingSuspicious : t.suspicious;

  const hasUnsavedChanges =
    pendingSuspicious !== null && pendingSuspicious !== t.suspicious;

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="hover:cursor-pointer" onClick={() => navigate(-1)}>
            <ChevronLeft className="scale-125" />
          </div>
          <Label className="text-2xl font-bold">{`Transaction #${t.id}`}</Label>
        </div>

        {/* Card */}
        <Card className="w-full">
          <CardContent className="p-6">
            {/* Title */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-gray-500">Transaction #{t.id}</p>
              </div>
              <div className="rounded-full p-2 bg-gray-100">{renderIcon()}</div>
            </div>

            {/* Pending redemption */}
            {t.type === "redemption" && !t.processedBy && (
              <div className="text-yellow-700 font-semibold mb-4">
                Redemption Pending
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* UTORid / Transfer sender+recipient */}
              <div>
                <Label>
                  {t.type === "transfer"
                    ? isSent
                      ? "Sender"
                      : "Recipient"
                    : "UTORid"}
                </Label>
                <p className="font-semibold">
                  {t.type === "transfer"
                    ? isSent
                      ? t.sender
                      : t.recipient
                    : t.utorid}
                </p>
              </div>

              {t.type === "transfer" && (
                <div>
                  <Label>{isSent ? "Recipient" : "Sender"}</Label>
                  <p className="font-semibold">{isSent ? t.recipient : t.sender}</p>
                </div>
              )}

              {/* Created By */}
              {t.type !== "transfer" && (
                <div>
                  <Label>Created By</Label>
                  <p className="font-semibold">{t.createdBy || "N/A"}</p>
                </div>
              )}

              {/* Purchase spent */}
              {t.type === "purchase" && (
                <div>
                  <Label>Spent</Label>
                  <p className="font-semibold">{t.spent ?? "-"} CAD</p>
                </div>
              )}

              {/* Amount */}
              {t.type !== "transfer" && (
                <div>
                  <Label>Amount</Label>
                  <p className="font-semibold">{t.amount ?? "-"} Points</p>
                </div>
              )}

              {/* Transfer points */}
              {t.type === "transfer" && (
                <div>
                  <Label>Points</Label>
                  <p className="font-semibold">{Math.abs(t.amount)} Points</p>
                </div>
              )}

              {/* Promotions */}
              {t.promotionIds?.length > 0 && (
                <div>
                  <Label>Promotions</Label>
                  <p className="font-semibold">{t.promotionIds.join(", ")}</p>
                </div>
              )}

              {/* Processed By */}
              {t.type === "redemption" && t.processedBy && (
                <div>
                  <Label>Processed By</Label>
                  <p className="font-semibold">{t.processedBy}</p>
                </div>
              )}

              {/* Suspicious — SHADCN SWITCH */}
              <div className="flex flex-col">
                <Label>Suspicious</Label>

                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    checked={effectiveSuspicious}
                    onCheckedChange={(value) => setPendingSuspicious(value)}
                  />

                  <span
                    className={`font-semibold ${
                      effectiveSuspicious ? "text-red-600" : ""
                    }`}
                  >
                    {effectiveSuspicious ? "Suspicious" : "Not Suspicious"}
                  </span>
                </div>
              </div>

              {/* Remark */}
              <div>
                <Label>Remark</Label>
                <p className="font-semibold">{t.remark || "N/A"}</p>
              </div>

              {/* Created At */}
              <div>
                <Label>Created At</Label>
                <p className="font-semibold">{formatSafeDate(t.createdAt)}</p>
              </div>
            </div>

            {/* Save Button */}
            {hasUnsavedChanges && (
              <div className="mt-8 flex justify-end">
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  onClick={async () => {
                    try {
                      const updatedFields = await setSuspicious(
                        t.id,
                        pendingSuspicious
                      );
                      setTransaction((prev) => ({ ...prev, ...updatedFields }));
                      setPendingSuspicious(null);
                    } catch (err) {
                      console.error("Failed to update suspicious:", err);
                      setError("Failed to update suspicious status.");
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default ViewTransactionPage;
