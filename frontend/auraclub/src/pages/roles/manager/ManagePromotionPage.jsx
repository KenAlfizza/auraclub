import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "@/pages/Layout";
import AppPromotionCard from "@/components/app/appPromotionCard";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

import { Filter, PlusCircle } from "lucide-react";

import { usePromotion } from "@/context/PromotionContext";

export function ManagePromotionPage() {
  const navigate = useNavigate();
  const { fetchPromotions, loading, error } = usePromotion();

  const [promotions, setPromotions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ name: null, type: null });

  // Fetch promotions whenever activePage or appliedFilters change
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await fetchPromotions({
          name: filterName,
          type: filterType,
          page: activePage,
          limit: itemsPerPage,
        });
        if (data?.results) setPromotions(data.results);
        if (data?.count) setTotalPages(Math.ceil(data.count / itemsPerPage));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPage();
  }, [activePage, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ name: filterName, type: filterType });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterType("");
    setAppliedFilters({ name: "", type: "" });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = appliedFilters.name || appliedFilters.type;

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-6 p-4">
        {/* Header with title, subtitle, and buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <Label className="text-3xl font-bold">Manage Promotions</Label>
                <p className="text-gray-600 mt-1">
                Create, edit, and filter all promotions available in the system
                </p>
            </div>

          <div className="flex flex-row gap-2">
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {[appliedFilters.name, appliedFilters.type].filter(Boolean).length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Promotions</DialogTitle>
                  <DialogDescription>
                    Filter promotions by name and type
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="filter-name">Name</Label>
                    <Input
                      id="filter-name"
                      placeholder="Search by name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="filter-type">Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger id="filter-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="onetime">One Time</SelectItem>
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

            <Button
              onClick={() => navigate("/manage/promotions/create")}
              className="flex items-center gap-2 bg-green-500"
            >
              <PlusCircle /> Create Promotion
            </Button>
          </div>
        </div>

        {/* Promotions Grid */}
        <Card className="w-full">
          <CardContent className="p-2">
            {loading ? (
              <div>Loading promotions...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : promotions.length === 0 ? (
              <div>No promotions found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {promotions.map((promo) => (
                  <AppPromotionCard key={promo.id} {...promo} />
                ))}
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          <CardFooter>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => (
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

                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}

export default ManagePromotionPage;
