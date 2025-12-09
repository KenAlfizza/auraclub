// src/context/EventContext.js
import { createContext, useContext, useState } from "react";
import { eventAPI } from "../api/event-api";

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

    const [guests, setGuests] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create a single event
    const createEvent = async (data) => {
        setLoading(true);
        setError(null);

        try {
        // Sanitize the data: remove null, undefined, or empty string
        const sanitizedData = Object.fromEntries(
            Object.entries(data).filter(
            ([_, value]) =>
                value !== null &&
                value !== undefined &&
                value !== "" &&
                value !== "null" &&
                value !== "undefined"
            )
        );

        const result = await eventAPI.create(sanitizedData);
        console.log("Event created successfully:", result);

        // Reset event form
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

        return result;
        } catch (err) {
            setError(err.message || "Failed to create event");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single event
    const fetchEvent = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await eventAPI.get(id);
            setEvent(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async (query = {}) => {
        setLoading(true);
        setError(null);

        try {
        // Sanitize query: remove null, undefined, empty string, "null", "undefined"
        const sanitizedQuery = Object.fromEntries(
            Object.entries(query).filter(([_, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "null" &&
            value !== "undefined"
            )
        );

        const data = await eventAPI.getAll(sanitizedQuery);
            setEvents(data.results || []);
            setEventsCount(data.count || 0);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch events");
        throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update an event
    const updateEvent = async (id, updatedData) => {
        setLoading(true);
        setError(null);

        try {
            const sanitizedData = Object.fromEntries(
                Object.entries(updatedData).filter(
                    ([_, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        value !== "null" &&
                        value !== "undefined"
                )
            );

            const result = await eventAPI.update(id, sanitizedData);

            // Update local state if the updated event matches current event
            if (event?.id === id) {
                setEvent(prev => ({ ...prev, ...result }));
            }

            // Optionally update the events list
            setEvents(prevEvents => prevEvents.map(e => (e.id === id ? { ...e, ...result } : e)));

            return result;
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
        setEvent(null); // Clear event after deletion
        return true;
        } catch (err) {
        if (err.status === 401) {
            setError("Unauthorized");
        } else if (err.status === 404) {
            setError("Event not found");
        } else {
            setError(err.message || "An error occurred while deleting the event");
        }
        throw err;
        } finally {
        setLoading(false);
        }
    };

    /** ----------------- Organizer methods ----------------- **/

    const fetchOrganizers = async (eventId) => {
        setLoading(true);
        setError("");
        try {
            const res = await eventAPI.getOrganizers(eventId);
            const organizersArray = res.organizers || []; // <-- extract array
            setEvent((prev) => ({ ...prev, organizers: organizersArray })); 
            return organizersArray;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };  


    const addOrganizer = async (eventId, UTORid) => {
        setLoading(true);
        setError("");
        try {
        const newOrganizer = await eventAPI.addOrganizer(eventId, UTORid);
        // Update current event's organizers list
        setEvent((prev) => ({
            ...prev,
            organizers: prev?.organizers ? [...prev.organizers, newOrganizer] : [newOrganizer],
        }));
        return newOrganizer;
        } catch (err) {
        setError(err.message);
        throw err;
        } finally {
        setLoading(false);
        }
    };

    const removeOrganizer = async (eventId, userId) => {
        setLoading(true);
        setError("");
        try {
        await eventAPI.removeOrganizer(eventId, userId);
        setEvent((prev) => ({
            ...prev,
            organizers: prev?.organizers?.filter((o) => o.id !== userId) || [],
        }));
        } catch (err) {
        setError(err.message);
        throw err;
        } finally {
        setLoading(false);
        }
    };


    // Fetch guests
    const fetchGuests = async (eventId) => {
        setLoading(true);
        setError("");
        try {
            const result = await eventAPI.getGuests(eventId);
            setGuests(result.guests || []);
            return result.guests || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Add a guest
    const addGuest = async (eventId, utorid) => {
        setLoading(true);
        setError("");
        try {
            const guest = await eventAPI.addGuest(eventId, utorid);
            setGuests((prev) => [...prev, guest]);
            return guest;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove a guest
    const removeGuest = async (eventId, userId) => {
        setLoading(true);
        setError("");
        try {
            await eventAPI.removeGuest(eventId, userId);
            setGuests((prev) => prev.filter((g) => g.id !== userId));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const rsvpSelf = async (eventId) => {
        setLoading(true);
        setError("");

        try {
            const guest = await eventAPI.rsvpSelf(eventId);

            // Add to event’s guest list if loaded
            setGuests((prev) => [...prev, guest]);

            // Update event list (events page)
            setEvents((prev) =>
            prev.map((e) =>
                e.id === eventId
                ? { ...e, userRSVP: "yes", guestsCount: e.guestsCount + 1 }
                : e
            )
            );

            return guest;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelSelfRSVP = async (eventId) => {
        setLoading(true);
        setError("");

        try {
            await eventAPI.cancelSelfRSVP(eventId);

            // Remove from guests
            setGuests((prev) => prev.filter((g) => g.eventId !== eventId));

            // Update event list
            setEvents((prev) =>
            prev.map((e) =>
                e.id === eventId
                ? { ...e, userRSVP: null, guestsCount: e.guestsCount - 1 }
                : e
            )
            );
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <EventContext.Provider
        value={{
            event,
            setEvent,
            createEvent,
            fetchEvent,
            updateEvent,
            deleteEvent,

            events,
            eventsCount,
            fetchEvents,
            
            fetchOrganizers,
            addOrganizer,
            removeOrganizer,

            guests,
            fetchGuests,
            addGuest,
            removeGuest,

            rsvpSelf,
            cancelSelfRSVP,

            loading,
            error,
        }}
        >
        {children}
        </EventContext.Provider>
    );
}

export const useEvent = () => useContext(EventContext);
