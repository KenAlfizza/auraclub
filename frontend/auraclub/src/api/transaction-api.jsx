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

    // Create adjustment transaction
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

    // Create redemption transaction
    createRedemptionTransaction: async (amount, remark) => {
        console.log('transactionAPI.createRedemption called with:', { amount, remark });
        const response = await fetch(`${API_BASE_URL}/users/me/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                type: "redemption",
                amount,
                remark
            })
        });

        console.log('Redemption complete, response:', response);
        return handleResponse(response);
    },

     // Process redemption transaction
    processRedemption: async (transactionId) => {
        console.log("transactionAPI.processRedemption called:", {
            transactionId,
            endpoint: `${API_BASE_URL}/transactions/${transactionId}/processed`,
            body: { processed: true }
        });

        const response = await fetch(
            `${API_BASE_URL}/transactions/${transactionId}/processed`,
            {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ processed: true })
            }
        );

        console.log("Process redemption complete, response:", response);
        return handleResponse(response);
    },

    // Fetch transaction by id
    getTransactionById: async (transactionId) => {
        const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        });

        if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch transaction");
        }

        return res.json();
    },

    // Fetch all transactions
    getAll: async (query = {}) => {
        console.log('transactionAPI.getAll called:', `${API_BASE_URL}/transactions`)
        const params = new URLSearchParams(query).toString()    
        console.log(
            "transactionAPI.getAll called:",
            `${API_BASE_URL}/transactions?${params}`
        )
        const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        )
        const transactions = await handleResponse(response)
        console.log('Fetch complete, transactions:', transactions)
        return transactions
    },

    // Fetch all transactions for the current user
    getAllUserTransaction: async (query = {}) => {
        console.log('transactionAPI.getAllUserTransaction called with query:', query);
        
        const params = new URLSearchParams(query).toString();
        const url = `${API_BASE_URL}/users/me/transactions${params ? `?${params}` : ''}`;
        
        console.log('Fetching from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        const data = await handleResponse(response);
        console.log('Fetch complete, data:', data);
        return data;
    },

    // Flag teansaction as suspicious or not
    setSuspicious: async (transactionId, suspicious) => {
        const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}/suspicious`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ suspicious }),
        }
        );
        return handleResponse(response);
    },

    // Get pending redemptions
    getPendingRedemptions: async () => {
        const response = await fetch(`${API_BASE_URL}/transactions/redemptions/pending`, {
        headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    // Fetch transactions created OR processed by the cashier
    getCashierTransactions: async (query = {}) => {
        const params = new URLSearchParams(query).toString();
        const url = `${API_BASE_URL}/transactions/cashier${params ? `?${params}` : ""}`;
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        return await handleResponse(response); // expects { count, results }
    },

    getCashierTransactionStats: async () => {
        const url = `${API_BASE_URL}/transactions/cashier/stats`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await handleResponse(response)
        return data;
    },
}

