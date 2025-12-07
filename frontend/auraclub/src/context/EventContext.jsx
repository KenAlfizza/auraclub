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

    return (
        <EventContext.Provider
        value={{
            event,
            events,
            eventsCount,
            setEvent,
            createEvent,
            fetchEvent,
            fetchEvents,
            updateEvent,
            deleteEvent,
            loading,
            error,
        }}
        >
        {children}
        </EventContext.Provider>
    );
}

export const useEvent = () => useContext(EventContext);
