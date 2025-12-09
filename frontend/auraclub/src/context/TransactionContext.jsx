import { createContext, useContext, useState } from "react";
import { transactionAPI } from '@/api/transaction-api';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {   
    const [transaction, setTransaction] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pendingRedemptions, setPendingRedemptions] = useState()

    const [cashierTransactions, setCashierTransactions] = useState([]);
    const [cashierTotalCount, setCashierTotalCount] = useState(0);
    const [cashierStats, setCashierStats] = useState(null)

    // Function to create/register a purchase transaction
    const createPurchaseTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            const { utorid, spent, promotionIds, remark, createdBy } = transaction;
            const args = [utorid, spent, promotionIds, remark, createdBy].map(v =>
                v === null || v === undefined ? undefined : v
            );
            const result = await transactionAPI.createPurchaseTransaction(...args);

            console.log('Purchase transaction created:', result);

            // Reset transaction with createdAt
            setTransaction({
                utorid: null,
                spent: null,
                promotionIds: null,
                remark: null,
                createdBy: null,
                createdAt: null,
            });

            return result;
        } catch (err) {
            setError(err.message || 'Failed to create purchase transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Function to create adjustment transaction
    const createAdjustmentTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            const { utorid, amount, relatedId, remark, promotionIds } = transaction;
            const args = [utorid, amount, relatedId, remark, promotionIds].map(v =>
                v === null || v === undefined ? undefined : v
            );
            const result = await transactionAPI.createAdjustmentTransaction(...args);

            console.log('Adjustment transaction created:', result);

            // Reset transaction with createdAt
            setTransaction({
                utorid: null,
                amount: null,
                relatedId: null,
                remark: null,
                promotionIds: null,
                createdAt: null,
                processedBy: null,
            });

            return result;
        } catch (err) {
            setError(err.message || 'Failed to create adjustment transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Redemption
    const createRedemptionTransaction = async ({ amount, remark }) => {
        setLoading(true);
        setError(null);
        try {
            const result = await transactionAPI.createRedemptionTransaction(amount, remark);
            return result;
        } catch (err) {
            setError(err.message || "Failed to create redemption transaction");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Process the redemption transaction
    const processRedemption = async (transactionId) => {
        setLoading(true);
        setError(null);
        try {
        const processedTransaction = await transactionAPI.processRedemption(transactionId);
        setTransaction(processedTransaction);
        return processedTransaction;
        } catch (err) {
        setError(err.message || "Failed to process redemption");
        return null;
        } finally {
        setLoading(false);
        }
    };

    // Fetch redemption transaction details (lookup only)
    const fetchRedemptionDetails = async (transactionId) => {
        setLoading(true);
        setError(null);

        try {
        const transaction = await transactionAPI.getTransactionById(transactionId);
            // Validate that the transaction is of type 'redemption'
            if (transaction.type !== "redemption") {
                setError("Transaction is not a redemption type");
                return null;
            }
            console.log(transaction)
            return transaction;

        } catch (err) {
            setError(err.message || "Failed to fetch transaction");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Fetch a transaction by transactionId
    const fetchTransaction = async (transactionId) => {
        setLoading(true)
        setError(null)

        try {
            const transaction = await transactionAPI.getTransactionById(transactionId)
            return transaction
        } catch (err) {
            setError(err.message || "Failed to fetch transaction");
            throw err
        } finally {
            setLoading(false);
        }
    };

    // Fetch all transactions
    const fetchAllTransactions = async (query = {}) => {
        setLoading(true);
        setError(null);

        try {
            const sanitizedQuery = Object.fromEntries(
                Object.entries(query).filter(([_, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "null" &&
                    value !== "undefined"
                )
            );
            const transactions = await transactionAPI.getAll(sanitizedQuery);
            return transactions;
        } catch (err) {
            setError(err.message || "Failed to fetch transactions");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch all transactions for the current user
    const fetchAllUserTransactions = async (query = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Sanitize query - remove null, undefined, empty string values
            const sanitizedQuery = Object.fromEntries(
            Object.entries(query).filter(([_, value]) =>
                value !== null &&
                value !== undefined &&
                value !== "" &&
                value !== "null" &&
                value !== "undefined"
            )
            );

            console.log('fetchAllUserTransactions called with sanitized query:', sanitizedQuery);

            const data = await transactionAPI.getAllUserTransaction(sanitizedQuery);

            // Backend should return { count, results }
            return data;
        } catch (err) {
            // Capture backend error message if present
            const backendMessage = err.response?.data?.message;
            const errorMessage = backendMessage || err.message || "Failed to fetch transactions";

            setError(errorMessage);
            console.error('Error fetching transactions:', errorMessage);

            // Still throw so caller can handle if needed
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Set transaction to be suspicious or not
    const setSuspicious = async (transactionId, suspicious) => {
    try {
        const updated = await transactionAPI.setSuspicious(transactionId, suspicious);

        // Update local state for the single transaction
        setTransaction((prev) =>
            prev?.id === updated.id
                ? { 
                    ...prev,                  // keep existing fields
                    suspicious: updated.suspicious // only update the changed field
                }
                : prev
            );

        return updated;
    } catch (error) {
        console.error("Failed to set suspicious:", error);
        throw error;
    }
    };

    const fetchPendingRedemptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await transactionAPI.getPendingRedemptions();
            setPendingRedemptions(data);
        } catch (err) {
        console.error("Failed to fetch pending redemptions", err);
            setError(err.message);
            setPendingRedemptions([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transactions created or processed by the cashier
    const fetchCashierTransactions = async (query = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await transactionAPI.getCashierTransactions(query);
            setCashierTransactions(data.results); // store results in state
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch cashier transactions");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch cashier dashboard statistics
    const fetchCashierStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await transactionAPI.getCashierTransactionStats();
            setCashierStats(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch cashier dashboard stats");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <TransactionContext.Provider
            value={{
                transaction,
                setTransaction,
                loading,
                error,
                fetchTransaction,
                fetchAllTransactions,
                fetchAllUserTransactions,
                
                fetchRedemptionDetails,
                createPurchaseTransaction,
                createAdjustmentTransaction,
                
                pendingRedemptions,
                fetchPendingRedemptions,
                createRedemptionTransaction,
                processRedemption,

                cashierTransactions,
                cashierTotalCount,
                fetchCashierTransactions,
                cashierStats,
                fetchCashierStats,

                setSuspicious,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export const useTransaction = () => useContext(TransactionContext);
