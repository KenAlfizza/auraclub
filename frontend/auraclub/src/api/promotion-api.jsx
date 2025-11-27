import { API_BASE_URL } from '@/config/api'

const handleResponse = async (response) => {
    let data = null;

    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }

    // If response is not OK → throw error
    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            `HTTP error! status: ${response.status}`;
        throw new Error(message);
    }

    return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const promotionAPI = {
    // Create promotion
    create: async (name, description, type, startTime, endTime, rate, points) => {
        console.log('promotionAPI.create called with:', 
            { "name": name, 
                "description": description, 
                "type": type, 
                "startTime": startTime, 
                "endTime": endTime, 
                "rate": rate, 
                "points": points })
        console.log('Fetching:', `${API_BASE_URL}/promotions`)

        const response = await fetch(`${API_BASE_URL}/promotions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name, description, type, startTime, endTime, rate, points })
            }
        )

        console.log('Create complete, response:', response)
        return handleResponse(response)
    },

    // Retrieve all promotion
    getAll: async (query = {}) => {
        console.log('promotionAPI.getAll called:', `${API_BASE_URL}/promotions`)
        const params = new URLSearchParams(query).toString()
        console.log(
            "promotionAPI.getAll called:",
            `${API_BASE_URL}/promotions?${params}`
        )

        const response = await fetch(
            `${API_BASE_URL}/promotions?${params}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        )
        console.log('Fetch complete, promotions:', response)
        const data = await handleResponse(response)
        return data
    },

    // Retrieve a single promotion with id
    get: async (id) => {
        console.log('promotionAPI.get called:', `${API_BASE_URL}/promotions/${id}`)
        const response = await fetch(
            `${API_BASE_URL}/promotions/${id}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        )
        const data = await handleResponse(response)
        console.log('Fetch complete, promotion:', data)
        return data
    },

    delete: async(id) => {
        console.log('promotionAPI.delete called:', `${API_BASE_URL}/promotions/${id}`)
        const response = await fetch(
            `${API_BASE_URL}/promotions/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        )
        return handleResponse(response);
    },

    patch: async (id, data) => {
        const url = `${API_BASE_URL}/promotions/${id}`;
        console.log("promotionAPI.patch called:", url);

        const response = await fetch(url, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        return handleResponse(response);
    },


}