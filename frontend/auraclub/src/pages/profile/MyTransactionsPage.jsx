import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppTransactionCard from "@/components/app/appTransactionCard";
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
import { Label } from "@/components/ui/label";
import { Filter, ChevronLeft } from "lucide-react";

import { useTransaction } from "@/context/TransactionContext";
import { useUser } from "@/context/UserContext";

export function MyTransactionsPage() {
  const navigate = useNavigate();
  const { fetchAllUserTransactions, loading, error } = useTransaction();
  const { user: currentUser } = useUser();

  const itemsPerPage = 9;
  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    type: null,
  });

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  // Fetch transactions when activePage or appliedFilters change
  useEffect(() => {
    if (!currentUser) return;

    const fetchPage = async () => {
      try {
        // Build clean params object - only include defined values
        const params = {
          page: activePage,
          limit: itemsPerPage,
        };

        // Only add type filter if it exists
        if (appliedFilters.type) {
          params.type = appliedFilters.type;
        }

        console.log('Fetching transactions with params:', params); // Debug log

        const data = await fetchAllUserTransactions(params);
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
  }, [activePage, appliedFilters, currentUser]);

  // Apply filter
  const handleApplyFilters = () => {
    setAppliedFilters({
      type: filterType || null,
    });
    setActivePage(1); // Reset to first page when applying filters
    setIsFilterOpen(false);
  };

  // Clear filter
  const handleClearFilters = () => {
    setFilterType("");
    setAppliedFilters({ type: null });
    setActivePage(1); // Reset to first page when clearing filters
    setIsFilterOpen(false);
  };

  // Navigate to single transaction view
  const handleClickTransaction = (id) => {
    navigate(`/transactions/${id}`);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
      window.scrollTo(0, 0); // Scroll to top when page changes
    }
  };

    return (
    <Layout header={true} sidebar={true}>
        <div className="flex flex-col w-full h-full gap-4">
        {/* Display backend error at the top */}
        {error && (
            <div className="text-red-600 font-semibold text-center py-2 bg-red-100 rounded">
            {error}
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
            <ChevronLeft
                className="hover:cursor-pointer scale-125"
                onClick={() => navigate("/")}
            />
            <Label className="text-2xl font-bold">My Transactions</Label>
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
                    Filter transactions by type
                </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
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
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                    </Select>
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

        {/* Applied Filters Display */}
        {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {appliedFilters.type && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                Type: {appliedFilters.type}
                </span>
            )}
            </div>
        )}

        {/* Results Count */}
        {!loading && (
            <div className="text-sm text-gray-600">
            Showing {transactions.length > 0 ? ((activePage - 1) * itemsPerPage) + 1 : 0} - {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} transactions
            </div>
        )}

        {/* Transaction List */}
        <div className="grid grid-cols-1 gap-4">
            {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
            <div className="text-center py-8">No transactions found.</div>
            ) : (
            transactions.map((tx) => (
                <AppTransactionCard
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
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(activePage - 1);
                  }}
                  className={activePage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Show first page */}
              {activePage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Show ellipsis if needed */}
              {activePage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: totalPages })
                .map((_, index) => index + 1)
                .filter(
                  (page) =>
                    page === activePage ||
                    page === activePage - 1 ||
                    page === activePage + 1
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={activePage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Show ellipsis if needed */}
              {activePage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show last page */}
              {activePage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(activePage + 1);
                  }}
                  className={activePage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
}

export default MyTransactionsPage;