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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Filter } from "lucide-react";
import { useEvent } from "@/context/EventContext";

export function ManageEventsPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    events,
    eventsCount,
    fetchEvents,
    deleteEvent,
    loading,
    error,
  } = useEvent();

  const [activePage, setActivePage] = useState(1);

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

  const totalPages = Math.ceil(eventsCount / itemsPerPage);

  const hasActiveFilters = Object.entries(appliedFilters).some(
    ([key, value]) => key !== "orderBy" && value !== null
  );

  // Fetch events whenever page or filters change
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents({
          page: activePage,
          limit: itemsPerPage,
          orderBy: appliedFilters.orderBy,
          name: appliedFilters.name,
          location: appliedFilters.location,
          published: appliedFilters.published,
          showFull: appliedFilters.showFull,
          started: appliedFilters.started,
          ended: appliedFilters.ended,
        });
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    loadEvents();
  }, [activePage, appliedFilters]);

  const handleApplyFilters = () => {
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

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      // Refetch after deletion
      fetchEvents({
        page: activePage,
        limit: itemsPerPage,
        orderBy: appliedFilters.orderBy,
        name: appliedFilters.name,
        location: appliedFilters.location,
        published: appliedFilters.published,
        showFull: appliedFilters.showFull,
        started: appliedFilters.started,
        ended: appliedFilters.ended,
      });
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Layout header sidebar>
      <div className="flex flex-col w-full h-full gap-4">
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
                      {Object.values(appliedFilters).filter(
                        (v) => v !== null && v !== "startTime"
                      ).length}
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
                    <Label htmlFor="filter-location">Location</Label>
                    <Input
                      id="filter-location"
                      placeholder="Search by location..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    />
                  </div>

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

            <Button onClick={() => navigate("/manage/events/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {appliedFilters.name && <Badge variant="secondary">Name: {appliedFilters.name}</Badge>}
            {appliedFilters.location && <Badge variant="secondary">Location: {appliedFilters.location}</Badge>}
            {appliedFilters.published !== null && <Badge variant="secondary">{appliedFilters.published ? "Published" : "Unpublished"}</Badge>}
            {appliedFilters.showFull !== null && <Badge variant="secondary">{appliedFilters.showFull ? "Full events" : "Available events"}</Badge>}
            {appliedFilters.started !== null && <Badge variant="secondary">{appliedFilters.started ? "Started" : "Not started"}</Badge>}
            {appliedFilters.ended !== null && <Badge variant="secondary">{appliedFilters.ended ? "Ended" : "Not ended"}</Badge>}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {events.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(activePage * itemsPerPage, eventsCount)} of {eventsCount} events
          </div>
        )}

        {/* Events list */}
        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="p-8 text-center">Loading events...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="p-8 text-center text-red-500">{error}</CardContent></Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No events found</p>
                <Button onClick={() => navigate("/manage/events/create")} className="mt-4" variant="outline">
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

export default ManageEventsPage;
