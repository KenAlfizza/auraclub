import { API_BASE_URL } from '@/config/api'

async function handleResponse(response) {
  console.log('Response status:', response.status)
  console.log('Response:', response)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }
  return response
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}


export const authAPI = {
    // Patch password of current user
    changePassword: async (data) => {
    const url = `${API_BASE_URL}/users/me/password`;
    console.log("authAPI.patch called:", url);

    const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    return handleResponse(response);
    },

}