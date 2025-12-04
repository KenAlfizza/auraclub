import { createContext, useContext, useState } from "react";
import { transactionAPI } from '@/api/transaction-api';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {   
    const [transaction, setTransaction] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            });

            return result;
        } catch (err) {
            setError(err.message || 'Failed to create adjustment transaction');
            throw err;
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

    return (
        <TransactionContext.Provider
            value={{
                transaction,
                setTransaction,
                loading,
                error,
                fetchAllTransactions,
                createPurchaseTransaction,
                createAdjustmentTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export const useTransaction = () => useContext(TransactionContext);
