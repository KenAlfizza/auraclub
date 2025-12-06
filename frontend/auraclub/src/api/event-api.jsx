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
}