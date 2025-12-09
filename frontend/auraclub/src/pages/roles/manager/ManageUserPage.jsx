import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppUserCard from "@/components/app/appUserCard";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Filter, UserPlus2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function ManageUserPage() {
  const navigate = useNavigate();
  const { fetchUsers, loading, error } = useUser();

  const itemsPerPage = 12;
  const [users, setUsers] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterVerified, setFilterVerified] = useState(null);
  const [filterActivated, setFilterActivated] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({
    name: null,
    role: null,
    verified: null,
    activated: null,
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await fetchUsers({
          name: appliedFilters.name,
          role: appliedFilters.role,
          verified: appliedFilters.verified,
          activated: appliedFilters.activated,
          page: activePage,
          limit: itemsPerPage,
        });
        setUsers(data?.results || []);
        setTotalCount(data?.count || 0);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setTotalCount(0);
      }
    };
    fetchPage();
  }, [activePage, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      name: filterName || null,
      role: filterRole || null,
      verified: filterVerified,
      activated: filterActivated,
    });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterRole("");
    setFilterVerified(null);
    setFilterActivated(null);
    setAppliedFilters({
      name: null,
      role: null,
      verified: null,
      activated: null,
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

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-3xl font-bold">Manage Users</Label>
            <p className="text-gray-600 mt-1">
              View and manage all system users
            </p>
          </div>

          <div className="flex gap-2">
            {/* Filter Button */}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.values(appliedFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Filter Users</DialogTitle>
                  <DialogDescription>
                    Apply filters to narrow down the users list
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
                    <Label htmlFor="filter-role">Role</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger id="filter-role">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="superuser">Super User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="filter-verified">Verified</Label>
                    <Switch 
                      id="filter-verified"
                      checked={filterVerified || false} 
                      onCheckedChange={setFilterVerified} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="filter-activated">Activated</Label>
                    <Switch 
                      id="filter-activated"
                      checked={filterActivated || false} 
                      onCheckedChange={setFilterActivated} 
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

            <Button onClick={() => navigate("/manage/users/register")} className="gap-2 bg-green-500">
              <UserPlus2 className="h-4 w-4" />
              Register User
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {appliedFilters.name && <Badge variant="secondary">Name: {appliedFilters.name}</Badge>}
            {appliedFilters.role && <Badge variant="secondary">Role: {appliedFilters.role}</Badge>}
            {appliedFilters.verified && <Badge variant="secondary">Verified</Badge>}
            {appliedFilters.activated && <Badge variant="secondary">Activated</Badge>}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {users.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} users
          </div>
        )}

        {/* Users List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">Loading users...</CardContent>
            </Card>
          ) : error ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-red-500">{error}</CardContent>
            </Card>
          ) : users.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No users found</p>
                <Button onClick={() => navigate("/manage/users/register")} className="mt-4" variant="outline">
                  Register your first user
                </Button>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => <AppUserCard key={user.id} {...user} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(activePage - 1); }}
                  className={activePage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages })
                .map((_, i) => i + 1)
                .filter(page => page === activePage || page === activePage - 1 || page === activePage + 1)
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={activePage === page}
                      onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(activePage + 1); }}
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

export default ManageUserPage;