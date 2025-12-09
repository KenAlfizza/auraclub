import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import AppManageTransactionCard from "@/components/app/appManageTransactionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, PlusCircle, CheckCircle } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTransaction } from "@/context/TransactionContext";

export function ManageTransactionPage() {
  const navigate = useNavigate();
  const itemsPerPage = 9;
  const { fetchAllTransactions, loading, error } = useTransaction();

  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSuspicious, setFilterSuspicious] = useState("");
  const [filterPromotionId, setFilterPromotionId] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    name: null,
    createdBy: null,
    type: null,
    suspicious: null,
    promotionId: null,
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const params = {
          name: appliedFilters.name,
          createdBy: appliedFilters.createdBy,
          type: appliedFilters.type,
          suspicious: appliedFilters.suspicious,
          promotionId: appliedFilters.promotionId,
          page: activePage,
          limit: itemsPerPage,
        };

        const data = await fetchAllTransactions(params);
        if (data?.results && data?.count != null) {
          setTransactions(data.results);
          setTotalCount(data.count);
        } else {
          setTransactions([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error(err);
        setTransactions([]);
        setTotalCount(0);
      }
    };
    fetchPage();
  }, [activePage, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      name: filterName || null,
      createdBy: filterCreatedBy || null,
      type: filterType || null,
      suspicious: filterSuspicious || null,
      promotionId: filterPromotionId || null,
    });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterCreatedBy("");
    setFilterType("");
    setFilterSuspicious("");
    setFilterPromotionId("");
    setAppliedFilters({
      name: null,
      createdBy: null,
      type: null,
      suspicious: null,
      promotionId: null,
    });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 p-4">
        {/* Header */}
        <div>
          <Label className="text-3xl font-bold">Manage Transactions</Label>
          <p className="text-gray-600 mt-1">
            Browse and manage all transactions including purchases, adjustments, transfers, and redemptions.
          </p>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card onClick={() => navigate("/manage/transactions/purchase/create")} className="cursor-pointer hover:bg-green-400 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <PlusCircle className="scale-125"/>
              <Label>Create Purchase</Label>
            </CardContent>
          </Card>
          <Card onClick={() => navigate("/manage/transactions/adjustment/create")} className="cursor-pointer hover:bg-green-400 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <PlusCircle className="scale-125"/>
              <Label>Adjust Transaction</Label>
            </CardContent>
          </Card>
          <Card onClick={() => navigate("/points/transfer")} className="cursor-pointer hover:bg-green-400 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <PlusCircle className="scale-125"/>
              <Label>Transfer Points</Label>
            </CardContent>
          </Card>
          <Card onClick={() => navigate("/points/redemption/create")} className="cursor-pointer hover:bg-green-400 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <PlusCircle className="scale-125"/>
              <Label>Create Redemption</Label>
            </CardContent>
          </Card>
          <Card onClick={() => navigate("/points/redemption/process")} className="cursor-pointer hover:bg-green-400 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <CheckCircle className="scale-125"/>
              <Label>Process Redemption</Label>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Header & Filters */}
        <div className="flex justify-between items-center mt-4">
          <Label className="text-2xl font-bold">All Transactions</Label>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4"/>
            Filters
            {hasActiveFilters && <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">{Object.values(appliedFilters).filter(Boolean).length}</span>}
          </Button>
        </div>

        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded">
            <Input placeholder="User Name / UTORID" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
            <Input placeholder="Created By" value={filterCreatedBy} onChange={(e) => setFilterCreatedBy(e.target.value)} />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger><SelectValue placeholder="Transaction Type"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="redemption">Redemption</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="transferTo">Transfer To</SelectItem>
                <SelectItem value="transferFrom">Transfer From</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSuspicious} onValueChange={setFilterSuspicious}>
              <SelectTrigger><SelectValue placeholder="Suspicious"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Promotion ID" value={filterPromotionId} onChange={(e) => setFilterPromotionId(e.target.value)} />
            <div className="col-span-full flex gap-2 mt-2">
              <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {transactions.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} - {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} transactions
          </div>
        )}

        {/* Transactions List */}
        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="text-center p-6">Loading transactions...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="text-red-500 text-center p-6">{error}</CardContent></Card>
          ) : transactions.length === 0 ? (
            <Card><CardContent className="text-gray-500 text-center p-6">No transactions found</CardContent></Card>
          ) : (
            transactions.map(tx => <AppManageTransactionCard key={tx.id} {...tx} clickable onClick={() => navigate(`/transactions/${tx.id}`)} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            <Button
              variant="outline"
              disabled={activePage === 1}
              onClick={() => handlePageChange(activePage - 1)}
            >
              Prev
            </Button>

            {pageNumbers.map((num) => (
              <Button
                key={num}
                variant={activePage === num ? "default" : "outline"}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </Button>
            ))}

            <Button
              variant="outline"
              disabled={activePage === totalPages}
              onClick={() => handlePageChange(activePage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ManageTransactionPage;
