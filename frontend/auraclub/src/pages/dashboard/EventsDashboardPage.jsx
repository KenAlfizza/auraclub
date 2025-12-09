import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/pages/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEvent } from "@/context/EventContext";
import AppEventCard from "@/components/app/appEventCard";

export function EventsDashboardPage() {
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const { events, eventsCount, fetchEvents, loading, error } = useEvent();
  const [activePage, setActivePage] = useState(1);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "ongoing" | "rsvp"

  const totalPages = Math.ceil(eventsCount / itemsPerPage);

  // Fetch events based on the active tab
  useEffect(() => {
    const loadEvents = async () => {
      const now = new Date().toISOString();
      let params = { page: activePage, limit: itemsPerPage, orderBy: "startTime" };
      try {
        if (activeTab === "rsvp") {
          params.rsvp = true
        } else {
          if (activeTab === "upcoming") params.status = "upcoming";
          else if (activeTab === "ongoing") params.status = "ongoing";
          else params.status = "past";
          await fetchEvents(params);
        }

      } catch (err) {
        console.error(`Failed to fetch ${activeTab} events:`, err);
      }
    };

    loadEvents();
  }, [activePage, activeTab]);

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
          <Label className="text-3xl font-bold">Events Dashboard</Label>
          <p className="text-gray-600 mt-1">Browse and manage your events</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          {["upcoming", "ongoing", "past"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => { setActiveTab(tab); setActivePage(1); }}
            >
              {tab === "upcoming" ? "Upcoming Events" : 
              tab === "ongoing" ? "Ongoing Events" : 
              tab === "past" ? "Past Events" : 
              "RSVPed Events"}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Showing {events.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(activePage * itemsPerPage, eventsCount)} of {eventsCount}{" "}
            {activeTab === "upcoming" ? "upcoming" : 
            activeTab === "ongoing" ? "ongoing" : 
            activeTab === "past" ? "past" :
            "RSVPed"} events
          </div>
        )}

        {/* Events list */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">Loading events...</CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center text-red-500">{error}</CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">No events found</CardContent>
            </Card>
          ) : (
            events.map((event) => <AppEventCard key={event.id} {...event} hideActions />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  activePage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default EventsDashboardPage;
