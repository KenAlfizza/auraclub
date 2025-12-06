import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gift, ArrowLeftRight, RefreshCcw } from "lucide-react";

export default function AppTransactionCard({
  id = 0,
  type = "purchase",
  amount = 0,
  spent = 0,
  remark = "",
  promotionIds = [],
  createdAt = null,
  sender = null,
  recipient = null,
  isClickable = true,
  onClick,
}) {
  const handleClickTransaction = () => {
    if (onClick) onClick();
  };

  // Format createdAt as MM/DD/YYYY
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    } catch {
      return "-";
    }
  };

  // Transfer direction logic
  let displayType = type;
  if (type === "transfer") {
    displayType = amount < 0 ? "transferTo" : "transferFrom";
  }

  // PURCHASE ===============================
  if (displayType === "purchase") {
    return (
      <Card
        className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={isClickable ? handleClickTransaction : undefined}
        role={isClickable ? "button" : undefined}
      >
        <CardContent className="flex justify-between items-center w-full p-6">
          <div className="flex flex-col justify-center max-w-[60%]">
            <span className="text-lg font-bold">Purchase</span>
            <span className="text-md font-semibold text-gray-600">
              Transaction #{id}
            </span>
            <span className="text-sm text-gray-500">${spent || 0}</span>
            <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-green-600">
                +{amount} Points
              </span>
            </div>

            <div className="bg-green-100 text-green-800 rounded-full p-2">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // REDEMPTION ===============================
  if (displayType === "redemption") {
    const redemptionValue = Math.abs(amount) / 100;

    return (
      <Card
        className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={isClickable ? handleClickTransaction : undefined}
        role={isClickable ? "button" : undefined}
      >
        <CardContent className="flex justify-between items-center w-full p-6">
          <div className="flex flex-col max-w-[60%]">
            <span className="text-lg font-bold">Redemption</span>
            <span className="text-md font-semibold text-gray-600">
              Transaction #{id}
            </span>
            <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-red-600">
                {amount} Points
              </span>
              <span className="text-sm text-gray-500">
                ${redemptionValue.toFixed(2)} off
              </span>
            </div>

            <div className="bg-purple-100 text-purple-800 rounded-full p-2">
              <Gift className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TRANSFER - SENT ============================
  if (displayType === "transferTo") {
    return (
      <Card
        className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={isClickable ? handleClickTransaction : undefined}
        role={isClickable ? "button" : undefined}
      >
        <CardContent className="flex justify-between items-center w-full p-6">
          <div className="flex flex-col max-w-[60%]">
            <span className="text-lg font-bold">Transfer Sent</span>
            <span className="text-md font-semibold text-gray-600">
              Transaction #{id}
            </span>
            {recipient && (
              <span className="text-sm text-gray-500">To: {recipient}</span>
            )}
            <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-red-600">
                {amount} Points
              </span>
            </div>

            <div className="bg-orange-100 text-orange-800 rounded-full p-2">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TRANSFER - RECEIVED ============================
  if (displayType === "transferFrom") {
    return (
      <Card
        className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={isClickable ? handleClickTransaction : undefined}
        role={isClickable ? "button" : undefined}
      >
        <CardContent className="flex justify-between items-center w-full p-6">
          <div className="flex flex-col max-w-[60%]">
            <span className="text-lg font-bold">Transfer Received</span>
            <span className="text-md font-semibold text-gray-600">
              Transaction #{id}
            </span>
            {sender && (
              <span className="text-sm text-gray-500">From: {sender}</span>
            )}
            <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-green-600">
                +{amount} Points
              </span>
            </div>

            <div className="bg-blue-100 text-blue-800 rounded-full p-2">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // EVENT =========================================
  if (displayType === "event") {
    return (
      <Card
        className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={isClickable ? handleClickTransaction : undefined}
        role={isClickable ? "button" : undefined}
      >
        <CardContent className="flex justify-between items-center w-full p-6">
          <div className="flex flex-col max-w-[60%]">
            <span className="text-lg font-bold">Event Reward</span>
            <span className="text-md font-semibold text-gray-600">
              Transaction #{id}
            </span>
            <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
            {remark && (
              <span className="text-sm text-gray-500">{remark}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-green-600">
                +{amount} Points
              </span>
            </div>

            <div className="bg-yellow-100 text-yellow-800 rounded-full p-2">
              <Gift className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // DEFAULT (adjustments etc)
  return (
    <Card
      className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
      onClick={isClickable ? handleClickTransaction : undefined}
      role={isClickable ? "button" : undefined}
    >
      <CardContent className="flex justify-between items-center w-full p-6">
        <div className="flex flex-col max-w-[60%]">
          <span className="text-lg font-bold capitalize">{displayType}</span>
          <span className="text-md font-semibold text-gray-600">
            Transaction #{id}
          </span>
          <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
          {remark && (
            <span className="text-sm text-gray-500">{remark}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className={`text-lg font-semibold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
              {amount >= 0 ? "+" : ""}
              {amount} Points
            </span>
          </div>

          <div className="bg-gray-100 text-gray-800 rounded-full p-2">
            <RefreshCcw className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
