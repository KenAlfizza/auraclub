import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gift, ArrowLeftRight, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AppManageTransactionCard({
  id = 0,
  utorid = "",
  amount = 0,
  spent = 0,
  type = "",
  remark = "",
  sender = null,
  recipient = null,
  isClickable = true,
}) {

  const navigate = useNavigate();

  const handleClickTransaction = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log("Navigating to transaction:", id);
    // Navigate to the promotion page with ID in URL
    navigate(`/manage/transactions/view/${id}`);

  };
  const displayType = type

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
            <span className="text-sm text-gray-500">UTORID: {utorid}</span>
            <span className="text-sm text-gray-500">${spent || 0}</span>
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-green-600">
                {amount} Points
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
            <span className="text-sm text-gray-500">UTORID: {utorid}</span>
            <span className="text-sm text-gray-500">
                ${redemptionValue.toFixed(2)} off
              </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-red-600">
                {amount} Points
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

  // TRANSFER ============================
if (displayType === "transfer") {
  const isSent = amount < 0; // If negative, user sent points
  return (
    <Card
      className="flex w-full bg-white rounded-xl shadow-sm hover:cursor-pointer hover:shadow-md transition-shadow"
      onClick={isClickable ? handleClickTransaction : undefined}
      role={isClickable ? "button" : undefined}
    >
      <CardContent className="flex justify-between items-center w-full p-6">
        <div className="flex flex-col max-w-[60%]">
          <span className="text-lg font-bold">
            {isSent ? "Transfer Sent" : "Transfer Received"}
          </span>
          <span className="text-md font-semibold text-gray-600">
            Transaction #{id}
          </span>

          {/* Show both user */}
          {sender && (
            <span className="text-sm text-gray-500">From: {sender}</span>
          )}
          {recipient && (
            <span className="text-sm text-gray-500">To: {recipient}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span
              className={`text-lg font-semibold ${
                isSent ? "text-red-600" : "text-green-600"
              }`}
            >
              {isSent ? amount : `+${amount}`} Points
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
            {utorid && (
              <span className="text-sm text-gray-500">UTORID: {utorid}</span>
            )}
            {remark && (
              <span className="text-sm text-gray-500">{remark}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-green-600">
                {amount} Points
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
          {utorid && (
              <span className="text-sm text-gray-500">UTORID: {utorid}</span>
          )}
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
