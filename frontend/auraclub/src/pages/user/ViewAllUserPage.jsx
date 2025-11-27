import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppUserCard from "@/components/app/appUserCard";

import Layout from "@/pages/Layout";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

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

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";

import { Filter } from "lucide-react";
import { ChevronLeft } from "lucide-react";

export function ViewAllUserPage() {
    const navigate = useNavigate();

    const { fetchUsers, loading, error } = useUser()
    const [users, setUsers] = useState([])

    const [activePage, setActivePage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 12

    const [isFilterOpen, setIsFilterOpen] = useState(false)
  
    // Filter states
    const [filterName, setFilterName] = useState(null)
    const [filterRole, setFilterRole] = useState(null)
    const [filterVerified, setFilterVerified] = useState(null)
    const [filterActivated, setFilterActivated] = useState(null)

    const [appliedFilters, setAppliedFilters] = useState({
        name: null,
        role: null,
        verified: null,
        activated: null,
    })

    // Fetch promotions whenever activePage changes
    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await fetchUsers({ 
                    name: filterName, 
                    role: filterRole,
                    verified: filterVerified,
                    activated: filterActivated, 
                    page: activePage, 
                    limit: itemsPerPage });
                if (data?.results) {
                    setUsers(data.results);
                }
                if (data?.count) {
                    setTotalPages(Math.ceil(data.count / itemsPerPage));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPage();
    }, [activePage, appliedFilters])

    const handleApplyFilters = () => {
        setAppliedFilters({
            name: filterName,
            role: filterRole,
            verified: filterVerified,
            activated: filterActivated,
        });
        setActivePage(1); // Reset to first page when applying filters
        setIsFilterOpen(false)
    };

    const handleClearFilters = () => {
        setFilterName(null);
        setFilterRole(null);
        setFilterVerified(null);
        setFilterActivated(null);

        setAppliedFilters({ 
            name: null,
            role: null,
            verified: null,
            activated: null,
        });

        setActivePage(1)
        setIsFilterOpen(false)
    };

    const hasActiveFilters = appliedFilters.name || appliedFilters.type;

    return (
        <Layout header={true} sidebar={true}>
            <div className="w-full h-full">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row items-center gap-4">
                            <ChevronLeft className="hover:cursor-pointer scale-125" onClick={() => navigate("/manage/users")}/>
                            <Label className="text-2xl">View All Users</Label>
                        </div>
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    {
                                        [
                                        appliedFilters.name,
                                        appliedFilters.role,
                                        appliedFilters.verified,
                                        appliedFilters.activated
                                        ].filter((v) => v !== "" && v !== null).length
                                    }
                                    </span>
                                )}
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Filter Users</DialogTitle>
                                <DialogDescription>
                                    Filter users by name, role, verified, and activated.
                                </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                
                                {/* Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="filter-name">Name</Label>
                                    <Input
                                    id="filter-name"
                                    placeholder="Search by name..."
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    />
                                </div>

                                {/* Role */}
                                <div className="grid gap-2">
                                    <Label htmlFor="filter-role">Role</Label>
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                    <SelectTrigger id="filter-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="superuser">Super User</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>

                                {/* Verified */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="filter-verified">Verified</Label>
                                    <Switch
                                    id="filter-verified"
                                    checked={filterVerified}
                                    onCheckedChange={setFilterVerified}
                                    />
                                </div>

                                {/* Activated */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="filter-activated">Activated</Label>
                                    <Switch
                                    id="filter-activated"
                                    checked={filterActivated}
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

                    </div>
                    <div className="flex flex-row w-full h-full gap-4">
                        <Card className="w-full">
                            <CardContent className="p-2">
                                {loading ? (
                                    <div>Loading users...</div>
                                ) : error ? (
                                    <div className="text-red-500">{error}</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                        {users.map((user) => (
                                            <AppUserCard key={user.id} {...user} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
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
                                                onClick={() => setActivePage(prev => Math.min(prev + 1, totalPages))}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ViewAllUserPage;

