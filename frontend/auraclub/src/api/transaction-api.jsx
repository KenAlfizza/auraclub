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

export const transactionAPI = {
    // Create purchase transaction
    createPurchaseTransaction: async (utorid, spent, promotionIds, remark, createdBy) => {
        console.log('transactionAPI.create called with:', 
            { "utorid": utorid, 
                "spent": spent, 
                "type": "purchase", 
                "promotionIds": promotionIds, 
                "remark": remark,
                "createdBy": createdBy})
        console.log('Fetching:', `${API_BASE_URL}/transactions`)

        const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    utorid, 
                    type: "purchase",
                    spent,
                    promotionIds, 
                    remark, 
                    createdBy
                })
            }
        )

        console.log('Create complete, response:', response)
        return handleResponse(response)
    },

    // Create purchase transaction
    createAdjustmentTransaction: async (utorid, amount, relatedId, remark, promotionIds, createdBy) => {
        console.log('transactionAPI.create called with:', 
            { "utorid": utorid, 
                "amount": amount, 
                "relatedId": relatedId,
                "type": "adjustment", 
                "promotionIds": promotionIds, 
                "remark": remark,
                "createdBy": createdBy})
        console.log('Fetching:', `${API_BASE_URL}/transactions`)

        const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    utorid,
                    type: "adjustment",
                    amount,
                    relatedId,
                    remark,
                    promotionIds,
                })
            }
        )

        console.log('Create complete, response:', response)
        return handleResponse(response)
    },

    // Fetch all transactions
    getAll: async (query = {}) => {
        console.log('transactionAPI.getAll called:', `${API_BASE_URL}/transactions`)
        const params = new URLSearchParams(query).toString()    
        console.log(
            "transactionAPI.getAll called:",
            `${API_BASE_URL}/transactions?${params}`
        )
        const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        )
        const transactions = await handleResponse(response)
        console.log('Fetch complete, transactions:', transactions)
        return transactions
    }

}

