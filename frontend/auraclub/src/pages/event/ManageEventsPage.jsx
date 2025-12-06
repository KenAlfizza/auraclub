import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import AppManageEventCard from "@/components/app/AppManageEventCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

export function ManageEventsPage() {
  const navigate = useNavigate();

  const itemsPerPage = 10;
  const [events, setEvents] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterPublished, setFilterPublished] = useState("");
  const [filterShowFull, setFilterShowFull] = useState("");
  const [filterStarted, setFilterStarted] = useState("");
  const [filterEnded, setFilterEnded] = useState("");
  const [orderBy, setOrderBy] = useState("startTime");

  const [appliedFilters, setAppliedFilters] = useState({
    name: null,
    location: null,
    published: null,
    showFull: null,
    started: null,
    ended: null,
    orderBy: "startTime",
  });

  const hasActiveFilters = Object.entries(appliedFilters).some(
    ([key, value]) => key !== "orderBy" && value !== null
  );

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query params
        const params = {
          page: activePage,
          limit: itemsPerPage,
          orderBy: appliedFilters.orderBy,
        };

        if (appliedFilters.name) params.name = appliedFilters.name;
        if (appliedFilters.location) params.location = appliedFilters.location;
        if (appliedFilters.published !== null) params.published = appliedFilters.published;
        if (appliedFilters.showFull !== null) params.showFull = appliedFilters.showFull;
        if (appliedFilters.started !== null) params.started = appliedFilters.started;
        if (appliedFilters.ended !== null) params.ended = appliedFilters.ended;

        // TODO: Replace with actual API call
        // const data = await eventAPI.getAll(params);
        
        // Mock data for demonstration
        const mockData = {
          count: 25,
          results: Array.from({ length: itemsPerPage }, (_, i) => ({
            id: (activePage - 1) * itemsPerPage + i + 1,
            name: `Event ${(activePage - 1) * itemsPerPage + i + 1}`,
            location: "Location A",
            startTime: new Date(Date.now() + i * 86400000).toISOString(),
            endTime: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
            capacity: 50,
            pointsRemain: 500,
            pointsAwarded: 100,
            published: i % 2 === 0,
            organizersCount: 2,
            guestsCount: 30,
          })),
        };

        setEvents(mockData.results);
        setTotalCount(mockData.count);
        setTotalPages(Math.ceil(mockData.count / itemsPerPage));
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message || "Failed to fetch events");
        setEvents([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activePage, appliedFilters]);

  // Apply filters
  const handleApplyFilters = () => {
    // Validate: cannot filter by both started and ended
    if (filterStarted && filterEnded) {
      alert("Cannot filter by both 'started' and 'ended' simultaneously");
      return;
    }

    setAppliedFilters({
      name: filterName || null,
      location: filterLocation || null,
      published: filterPublished === "" ? null : filterPublished === "true",
      showFull: filterShowFull === "" ? null : filterShowFull === "true",
      started: filterStarted === "" ? null : filterStarted === "true",
      ended: filterEnded === "" ? null : filterEnded === "true",
      orderBy: orderBy || "startTime",
    });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterName("");
    setFilterLocation("");
    setFilterPublished("");
    setFilterShowFull("");
    setFilterStarted("");
    setFilterEnded("");
    setOrderBy("startTime");
    setAppliedFilters({
      name: null,
      location: null,
      published: null,
      showFull: null,
      started: null,
      ended: null,
      orderBy: "startTime",
    });
    setActivePage(1);
    setIsFilterOpen(false);
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      // TODO: Replace with actual API call
      // await eventAPI.delete(eventId);
      console.log("Deleting event:", eventId);
      // Refresh events list
      // fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (eventId, currentStatus) => {
    try {
      // TODO: Replace with actual API call
      // await eventAPI.update(eventId, { published: !currentStatus });
      console.log("Toggling publish for event:", eventId);
      // Refresh events list
      // fetchEvents();
    } catch (err) {
      console.error("Error toggling publish status:", err);
      alert("Failed to update publish status");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-3xl font-bold">Manage Events</Label>
            <p className="text-gray-600 mt-1">
              Create, edit, and manage all events
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
                      {Object.values(appliedFilters).filter((v) => v !== null && v !== "startTime").length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Filter Events</DialogTitle>
                  <DialogDescription>
                    Apply filters to narrow down the events list
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Name Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-name">Name</Label>
                    <Input
                      id="filter-name"
                      placeholder="Search by name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>

                  {/* Location Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-location">Location</Label>
                    <Input
                      id="filter-location"
                      placeholder="Search by location..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    />
                  </div>

                  {/* Published Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-published">Published Status</Label>
                    <Select value={filterPublished} onValueChange={setFilterPublished}>
                      <SelectTrigger id="filter-published">
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Published</SelectItem>
                        <SelectItem value="false">Unpublished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Full Events */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-full">Show Full Events</Label>
                    <Select value={filterShowFull} onValueChange={setFilterShowFull}>
                      <SelectTrigger id="filter-full">
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Full events only</SelectItem>
                        <SelectItem value="false">Available events only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Started Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-started">Started</Label>
                    <Select
                      value={filterStarted}
                      onValueChange={setFilterStarted}
                      disabled={filterEnded !== ""}
                    >
                      <SelectTrigger id="filter-started">
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Started</SelectItem>
                        <SelectItem value="false">Not started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ended Filter */}
                  <div className="grid gap-2">
                    <Label htmlFor="filter-ended">Ended</Label>
                    <Select
                      value={filterEnded}
                      onValueChange={setFilterEnded}
                      disabled={filterStarted !== ""}
                    >
                      <SelectTrigger id="filter-ended">
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ended</SelectItem>
                        <SelectItem value="false">Not ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order By */}
                  <div className="grid gap-2">
                    <Label htmlFor="order-by">Order By</Label>
                    <Select value={orderBy} onValueChange={setOrderBy}>
                      <SelectTrigger id="order-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startTime">Start Time</SelectItem>
                        <SelectItem value="endTime">End Time</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="capacity">Capacity</SelectItem>
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

            {/* Create Event Button */}
            <Button onClick={() => navigate("/manage/events/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {appliedFilters.name && (
              <Badge variant="secondary">Name: {appliedFilters.name}</Badge>
            )}
            {appliedFilters.location && (
              <Badge variant="secondary">Location: {appliedFilters.location}</Badge>
            )}
            {appliedFilters.published !== null && (
              <Badge variant="secondary">
                {appliedFilters.published ? "Published" : "Unpublished"}
              </Badge>
            )}
            {appliedFilters.showFull !== null && (
              <Badge variant="secondary">
                {appliedFilters.showFull ? "Full events" : "Available events"}
              </Badge>
            )}
            {appliedFilters.started !== null && (
              <Badge variant="secondary">
                {appliedFilters.started ? "Started" : "Not started"}
              </Badge>
            )}
            {appliedFilters.ended !== null && (
              <Badge variant="secondary">
                {appliedFilters.ended ? "Ended" : "Not ended"}
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {events.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(activePage * itemsPerPage, totalCount)} of {totalCount} events
          </div>
        )}

        {/* Events List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p>Loading events...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center text-red-500">
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No events found</p>
                <Button
                  onClick={() => navigate("/manage/events/create")}
                  className="mt-4"
                  variant="outline"
                >
                  Create your first event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <AppManageEventCard
                key={event.id}
                {...event}
                onDelete={handleDeleteEvent}
                onTogglePublish={handleTogglePublish}
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

              {activePage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

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

              {activePage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

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
                  className={
                    activePage === totalPages ? "pointer-events-none opacity-50" : ""
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

export default ManageEventsPage;