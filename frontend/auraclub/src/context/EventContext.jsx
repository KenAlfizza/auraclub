import { createContext, useContext, useState } from "react";
import { eventAPI } from "../api/event-api";
import { userAPI } from "../api/user-api";

const EventContext = createContext();

export function EventProvider({ children }) {
    const [event, setEvent] = useState({
        name: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        totalPoints: "",
        published: false,
    });

    const [events, setEvents] = useState([]);
    const [eventsCount, setEventsCount] = useState(null);
    const [organizers, setOrganizers] = useState([]);
    const [guests, setGuests] = useState([]);
    const [rsvps, setRSVPs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Utility: Get user ID from UTORid (optional, for backward compatibility)
    const resolveUserId = async (utorid) => {
        try {
        const user = await userAPI.getByUtorid(utorid);
        if (!user) throw new Error(`User with UTORid "${utorid}" not found`);
        return user.id;
        } catch (err) {
        throw new Error(err.message || "Failed to resolve utorid");
        }
    };

    // Fetch single event by ID
    const fetchEvent = async (eventId) => {
        setLoading(true);
        try {
            const event = await eventAPI.getEvent(eventId);
            console.log("Fetched event:", event); // debug
            setEvent(event);
        } catch (err) {
            console.error("Failed to fetch event:", err);
        } finally {
            setLoading(false);
        }
    };

    // Create a new event
    const createEvent = async (eventData) => {
        setLoading(true);
        setError(null);
        try {
            const newEvent = await eventAPI.create(eventData);
            setEvent(newEvent);
            return newEvent;
        } catch (err) {
            console.error(err);
            setError("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    // Update an event
    const updateEvent = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await eventAPI.update(id, data);
            // Update local context state if this event is the current one
            if (event.id === id) {
                setEvent((prev) => ({ ...prev, ...updated }));
            }
            // Update in the events list
            setEvents((prev) =>
                prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
            );
            return updated;
        } catch (err) {
            setError(err.message || "Failed to update event");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete an event
    const deleteEvent = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await eventAPI.delete(id);

            // Remove from local events list
            setEvents((prev) => prev.filter((e) => e.id !== id));

            // Clear current event if it was deleted
            if (event.id === id) {
            setEvent({
                name: "",
                description: "",
                location: "",
                startTime: "",
                endTime: "",
                capacity: "",
                totalPoints: "",
                published: false,
            });
            }
            return true;
        } catch (err) {
            setError(err.message || "Failed to delete event");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch all events (with optional filters and pagination)
    const fetchEvents = async (query = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await eventAPI.getEvents(query);
            setEvents(result.results || []);
            setEventsCount(result.count || 0);
            return result.results || [];
        } catch (err) {
            setError(err.message || "Failed to fetch events");
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch all organizers for an event
    const fetchOrganizers = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await eventAPI.getOrganizers(eventId);
            setOrganizers(data.organizers || []);
            return data.organizers;
        } catch (err) {
            console.error(err);
            setError("Failed to fetch organizers");
        } finally {
            setLoading(false);
        }
    };

    // Add an organizer to an event
    const addOrganizer = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            const organizer = await eventAPI.addOrganizer(eventId, userId);
            setOrganizers((prev) => [...prev, organizer]);
            return organizer;
        } catch (err) {
            console.error(err);
            setError("Failed to add organizer");
        } finally {
            setLoading(false);
        }
    };

    // Remove an organizer from an event
    const removeOrganizer = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            await eventAPI.removeOrganizer(eventId, userId);
            setOrganizers((prev) => prev.filter((o) => o.id !== userId));
        } catch (err) {
            console.error(err);
            setError("Failed to remove organizer");
        } finally {
            setLoading(false);
        }
    };

    // Fetch guests for a specific event
    const fetchGuests = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await eventAPI.getGuests(eventId); 
            setGuests(result.guests || []);
            return result.guests || [];
        } catch (err) {
            setError(err.message || "Failed to fetch guests");
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Add guest (requires userId)
    const addGuest = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            const guest = await eventAPI.addGuest(eventId, userId);
            setGuests((prev) => [...prev, guest]);
            return guest;
        } catch (err) {
            setError(err.message || "Failed to add guest");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove guest (requires userId)
    const removeGuest = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            await eventAPI.removeGuest(eventId, userId);
            setGuests((prev) => prev.filter((g) => g.userId !== userId));
        } catch (err) {
            setError(err.message || "Failed to remove guest");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Mark attendance for a guest (requires userId)
    const markAttendance = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            const updatedGuest = await eventAPI.markAttendance(eventId, userId);
            setRSVPs((prev) => prev.filter((r) => r.userId !== userId));
            setGuests((prev) => {
                const exists = prev.some((g) => g.userId === userId);
                return exists ? prev : [...prev, updatedGuest];
            });
            return updatedGuest;
        } catch (err) {
            setError(err.message || "Failed to mark attendance");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch RSVPs for a specific event
    const fetchRSVPs = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await eventAPI.getRSVPs(eventId);
            setRSVPs(result.rsvps || []);
            return result.rsvps || [];
        } catch (err) {
            setError(err.message || "Failed to fetch RSVPs");
            return [];
        } finally {
            setLoading(false);
        }
    };

    // RSVP self
    const rsvpSelf = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            return await eventAPI.rsvpSelf(eventId);
        } catch (err) {
            setError(err.message || "Failed to RSVP");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cancel self RSVP
    const cancelSelfRSVP = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            return await eventAPI.cancelSelfRSVP(eventId);
        } catch (err) {
            setError(err.message || "Failed to cancel RSVP");
            throw err;
        } finally {
            
        }
    };

    // RSVP another user (requires userId)
    const rsvpUser = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            const guest = await eventAPI.rsvpUser(eventId, userId);
            setRSVPs((prev) => prev.filter((r) => r.userId !== userId));
            return guest;
        } catch (err) {
            setError(err.message || "Failed to RSVP user");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cancel another user's RSVP (requires userId)
    const cancelUserRSVP = async (eventId, userId) => {
        setLoading(true);
        setError(null);
        try {
            return await eventAPI.cancelUserRSVP(eventId, userId);
        } catch (err) {
            setError(err.message || "Failed to cancel RSVP");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Award points to a guest
    const awardPoints = async (eventId, payload) => {
    setLoading(true);
    try {
            await eventAPI.awardPoints(eventId, payload);
            // refresh event and guest list
            await fetchEvent(eventId);
            await fetchGuests(eventId);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <EventContext.Provider
        value={{
            loading,
            error,

            event,
            fetchEvent,
            createEvent,
            updateEvent,
            deleteEvent,

            events,
            eventsCount,
            fetchEvents,
            
            organizers,
            fetchOrganizers,
            addOrganizer,
            removeOrganizer,

            guests,
            fetchGuests,
            addGuest,
            removeGuest,

            rsvps,
            fetchRSVPs,
            rsvpSelf,
            cancelSelfRSVP,
            rsvpUser,
            cancelUserRSVP,
            markAttendance,

            awardPoints,

            resolveUserId,
        }}
        >
        {children}
        </EventContext.Provider>
    );
}

export const useEvent = () => useContext(EventContext);
