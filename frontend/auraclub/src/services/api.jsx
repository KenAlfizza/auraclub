const API_BASE_URL = 'http://localhost:3000'

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


}