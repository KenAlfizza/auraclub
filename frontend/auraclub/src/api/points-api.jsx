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

export const pointsAPI = {
  // Get current user points
  getCurrent: async () => {
    const response = await fetch(`${API_BASE_URL}/points/current`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get points trend (last 10 snapshots)
  getTrend: async () => {
    const response = await fetch(`${API_BASE_URL}/points/trend`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a snapshot (triggered after a transaction)
  createSnapshot: async (points) => {
    const response = await fetch(`${API_BASE_URL}/points/snapshot`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ points }),
    });
    return handleResponse(response);
  },
};
