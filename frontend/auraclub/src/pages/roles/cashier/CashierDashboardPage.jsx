import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useTransaction } from "@/context/TransactionContext";
import Layout from "@/pages/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppTransactionCard from "@/components/app/appTransactionCard";

export function CashierDashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser()
  const { 
    fetchCashierTransactions, 
    cashierTransactions,
    fetchCashierStats,
    cashierStats,
    loading: txLoading, 
    error: txError 
  } = useTransaction();

  // Fetch first 5 transactions & stats
  useEffect(() => {
    fetchCashierTransactions({ page: 1, limit: 5 });
    fetchCashierStats();
  }, [user]);

  const handleViewAllTransactions = () => navigate("/cashier/transactions");
  const handleCreatePurchase = () => navigate("/cashier/purchase");
  const handleProcessRedemptions = () => navigate("/cashier/redemption");

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 p-4">

        {/* Welcome Header */}
        <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-600 mt-1">
            Here’s an overview of your account activity.
            </p>
        </div>
        
        {/* Action Buttons */}
        <Card className="flex flex-row p-6 gap-4 min-h-32 w-full">
            <Button
            onClick={handleCreatePurchase}
            className="h-full flex-1 text-xl py-4 bg-green-400 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400 rounded-lg"
            >
            Create Purchase
            </Button>

            <Button
            onClick={handleProcessRedemptions}
            className="h-full flex-1 text-xl py-4 bg-purple-400 text-white hover:bg-purple-600 focus:ring-2 focus:ring-purple-400 rounded-lg"
            >
            Process Pending Redemptions
            </Button>
        </Card>

        {/* Customer Statistics */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Customer Statistics</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cashierStats ? (
              <>
                <div className="p-4 border rounded bg-gray-50 flex flex-col items-center">
                  <p className="font-bold text-2xl">{cashierStats.totalCustomers}</p>
                  <p className="text-gray-500">Total Customers</p>
                </div>
                <div className="p-4 border rounded bg-gray-50 flex flex-col items-center">
                  <p className="font-bold text-2xl">{cashierStats.totalPointsRedeemed}</p>
                  <p className="text-gray-500">Total Points Redeemed</p>
                </div>
                <div className="p-4 border rounded bg-gray-50 flex flex-col items-center">
                  <p className="font-bold text-2xl">{cashierStats.totalPurchases}</p>
                  <p className="text-gray-500">Total Purchases</p>
                </div>
                <div className="p-4 border rounded bg-gray-50 flex flex-col items-center">
                  <p className="font-bold text-2xl">{cashierStats.averagePurchaseAmount}</p>
                  <p className="text-gray-500">Average Purchase Amount</p>
                </div>
              </>
            ) : (
              <p className="text-center col-span-4 text-gray-500">Loading statistics...</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {txLoading ? (
              <p className="text-center p-4">Loading transactions...</p>
            ) : txError ? (
              <p className="text-center text-red-500 p-4">{txError}</p>
            ) : cashierTransactions.length === 0 ? (
              <p className="text-center text-gray-500 p-4">No recent transactions</p>
            ) : (
              cashierTransactions.map((tx) => (
                <AppTransactionCard
                  key={tx.id}
                  {...tx}
                  compact
                  clickable
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                />
              ))
            )}
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleViewAllTransactions}
              >
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default CashierDashboardPage;
