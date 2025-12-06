import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppManageTransactionCard from "@/components/app/appManageTransactionCard";
import Layout from "@/pages/Layout";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, ChevronLeft } from "lucide-react";

import { useTransaction } from "@/context/TransactionContext";

export function ViewAllTransactionPage() {
  const navigate = useNavigate();
  const { fetchAllTransactions, loading, error } = useTransaction();

  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
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

  // Fetch transactions whenever activePage or appliedFilters change
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
        if (data?.results && data?.count) {
          setTransactions(data.results);
          setTotalPages(Math.ceil(data.count / itemsPerPage));
          setTotalCount(data.count || 0);
        } 
        else {
          console.error('Error fetching transactions:', err);
          setTransactions([]);
          setTotalCount(0);
          setTotalPages(1);
        }

      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactions([]);
        setTotalCount(0);
        setTotalPages(1);
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

  const handleClickTransaction = (id) => {
    navigate(`/transactions/${id}`);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  return (
    <Layout header={true} sidebar={true}>
      <div className="flex flex-col w-full h-full gap-4">
        {/* Display backend error at the top */}
        {error && (
            <div className="text-red-600 font-semibold text-center py-2 bg-red-100 rounded">
            {error}
            </div>
        )}
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ChevronLeft
              className="hover:cursor-pointer scale-125"
              onClick={() => navigate("/manage/transactions")}
            />
            <Label className="text-2xl font-bold">All Transactions</Label>
          </div>

          {/* Filters */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {Object.values(appliedFilters).filter(Boolean).length}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Filter Transactions</DialogTitle>
                <DialogDescription>
                  Filter transactions by name, type, suspicious, promotion, or creator
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="filter-name">User Name / UTORID</Label>
                  <Input
                    id="filter-name"
                    placeholder="Enter user UTORID or name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="filter-createdBy">Created By</Label>
                  <Input
                    id="filter-createdBy"
                    placeholder="Created by UTORID..."
                    value={filterCreatedBy}
                    onChange={(e) => setFilterCreatedBy(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="filter-type">Transaction Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="redemption">Redemption</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="transferTo">Transfer To</SelectItem>
                      <SelectItem value="transferFrom">Transfer From</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="filter-suspicious">Suspicious</Label>
                  <Select value={filterSuspicious} onValueChange={setFilterSuspicious}>
                    <SelectTrigger id="filter-suspicious">
                      <SelectValue placeholder="Select suspicious" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="filter-promotion">Promotion ID</Label>
                  <Input
                    id="filter-promotion"
                    placeholder="Enter promotion ID..."
                    value={filterPromotionId}
                    onChange={(e) => setFilterPromotionId(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <Button type="button" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Results Count */}
        {!loading && (
            <div className="text-sm text-gray-600">
            Showing {transactions.length > 0 ? ((activePage - 1) * itemsPerPage) + 1 : 0} - {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} transactions
            </div>
        )}

        {/* Transaction List */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div>Loading transactions...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            transactions.map((tx) => (
              <AppManageTransactionCard
                key={tx.id}
                {...tx}
                clickable={true}
                onClick={() => handleClickTransaction(tx.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>

              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                />
              </PaginationItem>

              {/* If few pages → render all */}
              {totalPages <= 7 &&
                Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={activePage === index + 1}
                      onClick={() => setActivePage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* If many pages → smart pagination */}
              {totalPages > 7 && (
                <>
                  {/* Always render page 1 */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === 1}
                      onClick={() => setActivePage(1)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {/* Ellipsis after first page */}
                  {activePage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Middle pages: active-1, active, active+1 */}
                  {[
                    activePage - 1,
                    activePage,
                    activePage + 1
                  ]
                    .filter((page) => page > 1 && page < totalPages)
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={activePage === page}
                          onClick={() => setActivePage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {/* Ellipsis before last page */}
                  {activePage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Always render last page */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === totalPages}
                      onClick={() => setActivePage(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setActivePage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        )}

      </div>
    </Layout>
  );
}

export default ViewAllTransactionPage;
