import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useTransaction } from "@/context/TransactionContext";
import { usePoints } from "@/context/PointsContext";
import Layout from "@/pages/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppTransactionCard from "@/components/app/appTransactionCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function RegularDashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchAllUserTransactions, loading: txLoading, error: txError } = useTransaction();
  const { points, trend: pointsTrend, loading: pointsLoading } = usePoints();

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch first 5 transactions
  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const params = { page: 1, limit: 5 };
        const data = await fetchAllUserTransactions(params);
        if (data?.results) {
          setRecentTransactions(data.results);
        } else {
          setRecentTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setRecentTransactions([]);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleViewAllTransactions = () => navigate("/transactions");
  const handleRedeem = () => navigate("/points/redeem");
  const handleTransfer = () => navigate("/points/transfer");

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 p-4">
        {/* Header */}
        <div>
          <Label className="text-3xl font-bold">
            Welcome, {user?.name || "User"}
          </Label>
          <p className="text-gray-600 mt-1">
            Here’s an overview of your points and account activity.
          </p>
        </div>

        {/* Points Balance */}
        <Card className="bg-blue-400 flex text-white flex-col justify-between w-full">
          <CardHeader>
            <h2 className="text-3xl font-semibold">Current Points</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-8">
            {pointsLoading ? (
              <p className="text-gray-500">Loading points...</p>
            ) : (
              <>
                <span className="text-6xl font-bold text-center">{points}</span>
                <span className="text-gray-200 text-center">Available Points</span>
                <div className="flex gap-2 mt-2d justify-end">
                  <Button onClick={handleRedeem} variant="secondary">
                    Redeem Points
                  </Button>
                  <Button onClick={handleTransfer} variant="secondary">
                    Transfer Points
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Points Trend Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Points Trend</h2>
          </CardHeader>
          <CardContent className="p-4 h-64">
            {pointsLoading ? (
              <p className="text-center text-gray-500">Loading trend...</p>
            ) : pointsTrend.length === 0 ? (
              <p className="text-center text-gray-500">No data for points trend</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pointsTrend.map((point) => {
                    const pointDate = new Date(point.date);
                    const today = new Date();

                    // Check if the date is today
                    const isToday =
                      pointDate.getDate() === today.getDate() &&
                      pointDate.getMonth() === today.getMonth() &&
                      pointDate.getFullYear() === today.getFullYear();

                    return {
                      ...point,
                      date: isToday
                        ? pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : pointDate.toLocaleDateString([], { month: '2-digit', day: '2-digit' }), // show MM/DD for other days
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {txLoading ? (
              <p className="text-center p-4">Loading transactions...</p>
            ) : txError ? (
              <p className="text-center text-red-500 p-4">{txError}</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 p-4">No recent transactions</p>
            ) : (
              recentTransactions.map((tx) => (
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

export default RegularDashboardPage;
