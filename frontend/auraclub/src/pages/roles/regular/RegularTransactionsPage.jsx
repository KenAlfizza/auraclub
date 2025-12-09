import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AppTransactionCard from "@/components/app/appTransactionCard";
import { useTransaction } from "@/context/TransactionContext";

export function RegularTransactionsPage() {
  const navigate = useNavigate();
  const { fetchAllUserTransactions, loading, error } = useTransaction();

  const itemsPerPage = 9;
  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const transactionTypes = ["all", "purchase", "redemption", "adjustment", "transfer", "event"];
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = { page: activePage, limit: itemsPerPage };
        if (activeTab !== "all") params.type = activeTab;

        const data = await fetchAllUserTransactions(params);
        if (data?.results && data?.count != null) {
          setTransactions(data.results);
          setTotalCount(data.count);
        } else {
          setTransactions([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setTotalCount(0);
      }
    };

    fetchTransactions();
  }, [activePage, activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Generate page numbers for pagination (simplified: show all for now)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 p-4">
        {/* Header */}
        <div>
          <Label className="text-3xl font-bold">Transactions Dashboard</Label>
          <p className="text-gray-600 mt-1">Browse your transactions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setActivePage(1); }}>
          <TabsList className="flex-wrap gap-2">
            {transactionTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type === "all" ? "All Transactions" : type.charAt(0).toUpperCase() + type.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Results count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {transactions.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} transactions
          </div>
        )}

        {/* Transactions list */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            transactions.map((tx) => (
              <AppTransactionCard
                key={tx.id}
                {...tx}
                clickable
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))
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

export default RegularTransactionsPage;
