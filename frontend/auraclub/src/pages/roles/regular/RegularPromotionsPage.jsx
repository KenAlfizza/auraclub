import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppPromotionCard from "@/components/app/appPromotionCard";

import Layout from "@/pages/Layout";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";

export function RegularPromotionsPage() {
  const navigate = useNavigate();
  const { user, loading, error } = useUser();

  const itemsPerPage = 6; // Number of promotions per page
  const [activePage, setActivePage] = useState(1);

  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [usedPromotions, setUsedPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    if (user && user.promotions) {
      setAvailablePromotions(user.promotions.available || []);
      setUsedPromotions(user.promotions.used || []);
    }
  }, [user]);

  const getCurrentPromotions = () => (activeTab === "available" ? availablePromotions : usedPromotions);

  const renderPromotions = (promotions) => {
    if (loading) return <div className="text-center py-8">Loading promotions...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!promotions || promotions.length === 0)
      return <div className="text-center py-8 text-gray-500">No promotions found</div>;

    // Pagination logic
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, promotions.length);
    const paginatedPromotions = promotions.slice(startIndex, endIndex);

    return (
      <>
        <div className="text-sm text-gray-600 mb-2">
          Showing {paginatedPromotions.length > 0 ? startIndex + 1 : 0} - {endIndex} of {promotions.length} promotions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPromotions.map((promo) => (
            <AppPromotionCard key={promo.id} {...promo} clickable={false} />
          ))}
        </div>
      </>
    );
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 p-4">
        {/* Header */}
        <div>
          <Label className="text-3xl font-bold">Promotions Dashboard</Label>
          <p className="text-gray-600 mt-1">Browse your available and used promotions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setActivePage(1); }} className="w-full">
          <TabsList className="mb-2 gap-2">
            <TabsTrigger value="available">
              Available <Badge variant="outline">{availablePromotions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="used">
              Used <Badge variant="secondary">{usedPromotions.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <TabsContent value="available">{renderPromotions(availablePromotions)}</TabsContent>
          <TabsContent value="used">{renderPromotions(usedPromotions)}</TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default RegularPromotionsPage;
