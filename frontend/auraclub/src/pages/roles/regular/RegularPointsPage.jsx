import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function RegularPointsPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const tabs = ["overview"];
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("overview");
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPoints = async () => {
      setUserPoints(user.points);
      setLoading(false);
    };
    fetchUserPoints();
  }, [user]);

  const handleRedeem = () => navigate("/points/redeem");
  const handleTransfer = () => navigate("/points/transfer");
  const handleTransactions = () => navigate("/transactions");

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 p-4">
        {/* Header */}
        <div>
          <Label className="text-3xl font-bold">Points Dashboard</Label>
          <p className="text-gray-600 mt-1">View your points, redeem, transfer, and transactions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
          <TabsList className="mb-2 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              {/* Points Card */}
              <Card>
                <CardContent className="p-8 flex flex-col items-center gap-4">
                  {loading ? (
                    <p>Loading points...</p>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{userPoints}</span>
                      <span className="text-gray-500">Available Points</span>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={handleRedeem} variant="secondary">Redeem Points</Button>
                        <Button onClick={handleTransfer} variant="secondary">Transfer Points</Button>
                      </div>
                      <Button onClick={handleTransactions} variant="ghost" className="mt-2">
                        View Transactions
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default RegularPointsPage;
