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
    console.log("eventAPI.create called with:", data);

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  // Get all event
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: getAuthHeaders(),
    });
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
    console.log(`eventAPI.update called for event ${id} with:`, data);

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


}