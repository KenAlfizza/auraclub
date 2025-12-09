import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEvent } from "@/context/EventContext";
import AppEventCard from "@/components/app/appEventCard";

export function PublishedEventsPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const {
    events,
    eventsCount,
    fetchEvents,
    loading,
    error,
  } = useEvent();

  const [activePage, setActivePage] = useState(1);

  const totalPages = Math.ceil(eventsCount / itemsPerPage);

  // Fetch only published events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents({
          page: activePage,
          limit: itemsPerPage,
          published: true,
          orderBy: "startTime",
        });
      } catch (err) {
        console.error("Failed to fetch published events:", err);
      }
    };
    loadEvents();
  }, [activePage]);

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
        <div>
          <Label className="text-3xl font-bold">Published Events</Label>
          <p className="text-gray-600 mt-1">Browse all events currently published</p>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {events.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} - {" "}
            {Math.min(activePage * itemsPerPage, eventsCount)} of {eventsCount} published events
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
              <CardContent className="p-8 text-center text-gray-500">No published events found</CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <AppEventCard
                key={event.id}
                {...event}
                hideActions
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

export default PublishedEventsPage;
