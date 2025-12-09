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

  // Get all events
  getAll: async (query = {}) => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/events?${params.toString()}`,
      { headers: getAuthHeaders() }
    );

    return handleResponse(response);
  },

  // Get a single event
  get: async (id) => {
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

  /** ------------------- Organizers ------------------- **/

  // Get all organizers for an event
  getOrganizers: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add an organizer to an event
  addOrganizer: async (eventId, utorid) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ utorid }),
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

  /** ------------------- Guests/RSVPs ------------------- **/

  // Get all guests/RSVPs for an event
  getGuests: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add a guest (RSVP)
  addGuest: async (eventId, utorid) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ utorid }),
    });
    return handleResponse(response);
  },

  // Remove a guest
  removeGuest: async (eventId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/guests/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Self RSVP
  rsvpSelf: async (eventId) => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/guests/me`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Cancel self RSVP
  cancelSelfRSVP: async (eventId) => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/guests/me`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};


