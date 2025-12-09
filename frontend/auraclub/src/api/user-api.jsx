import { API_BASE_URL } from '@/config/api'

async function handleResponse(response) {
  console.log('Response status:', response.status)
  console.log('Response:', response)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const userAPI = {
  // Login user with utorid and password
  login: async (utorid, password) => {
    console.log('userAPI.login called with:', { utorid, password })
    console.log('Fetching:', `${API_BASE_URL}/auth/tokens`)
    
    const response = await fetch(`${API_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utorid, password })
    })
    
    console.log('Fetch complete, response:', response)
    return handleResponse(response)
  },

  // GET current user with token
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // Register user with utorid, name, email
  register: async (utorid, name, email) => {
    console.log('userAPI.register called with:', { utorid, name, email })
    console.log('Registering:', `${API_BASE_URL}/users`)

    const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ utorid, name, email })
    })

    console.log('Register complete, response:', response)
    return handleResponse(response)
  },


  // Get list of users with filters
  getAll: async (query = {}) => {
      console.log('userAPI.getAll called:', `${API_BASE_URL}/users`)
      const params = new URLSearchParams(query).toString()
      console.log(
          "userAPI.getAll called:",
          `${API_BASE_URL}/users?${params}`
      )

      const response = await fetch(
          `${API_BASE_URL}/users?${params}`,
          {
              method: "GET",
              headers: getAuthHeaders(),
          }
      )
      console.log('Fetch complete, users:', response)
      const data = await handleResponse(response)
      return data
  },

  // Retrieve a single user with id
  get: async (id) => {
      console.log('userAPI.get called:', `${API_BASE_URL}/users/${id}`)
      const response = await fetch(
          `${API_BASE_URL}/users/${id}`,
          {
              method: "GET",
              headers: getAuthHeaders(),
          }
      )
      const data = await handleResponse(response)
      console.log('Fetch complete, user:', data)
      return data
  },

  getByUtorid: async (utorid) => {
      console.log('userAPI.fetchUserByUtorid called with:', { utorid });
      const url = `${API_BASE_URL}/users/utorid/${encodeURIComponent(utorid)}`;
      console.log('Fetching:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      console.log('Fetch complete, user data:', data);
      return data;
  },
  
  // Patch a user with specified id
  patch: async (id, data) => {
    const url = `${API_BASE_URL}/users/${id}`;
    console.log("userAPI.patch called:", url);

    const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  
  // Lookup customer promotions by utorid (for cashiers)
  lookupPromotions: async (utorid) => {
    console.log('userAPI.lookupPromotions called with:', { utorid })
    const url = `${API_BASE_URL}/users/promotions-lookup?utorid=${encodeURIComponent(utorid)}`
    console.log('Fetching:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    const data = await handleResponse(response)
    console.log('Fetch complete, customer data:', data)
    return data
  },

  // Create transfer transaction between users 
  createTransferTransaction: async (recipientId, payload) => {
    console.log('userAPI.createTransferTransaction called with:', { recipientId, payload });
    const url = `${API_BASE_URL}/users/${recipientId}/transactions`;

    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const data = await handleResponse(response)
    console.log('Fetch complete, transfer data:', data)
    return data
  },

}