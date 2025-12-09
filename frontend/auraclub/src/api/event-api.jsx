import { API_BASE_URL } from "@/config/api";

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  return data;
};

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const eventAPI = {
  // Create a new event
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get a single event
  getEvent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update an event
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete an event
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get all events
  getEvents: async (query = {}) => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Convert value to string
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get all organizers for an event
  getOrganizers: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add an organizer to an event
  addOrganizer: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  // Remove an organizer from an event
  removeOrganizer: async (eventId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/organizers/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Get all guests for an event
  getGuests: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add a guest to an event
  addGuest: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  // Remove a guest from an event
  removeGuest: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get all RSVPs for an event
  getRSVPs: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvps`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Self RSVP for the authenticated user
  rsvpSelf: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvps/me`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel self RSVP for the authenticated user
  cancelSelfRSVP: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvps/me`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Manager/Organizer RSVP for another user
  rsvpUser: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvps`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  // Cancel RSVP for another user
  cancelUserRSVP: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvps`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  // Mark attendance for a guest
  markAttendance: async (eventId, userId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  // Award points to a guest
  awardPoints: async (eventId, payload) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/transactions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...payload, type: "event" }), // include type
    });
    return handleResponse(response);
  },

};
