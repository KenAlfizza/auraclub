import { createContext, useContext, useState, useEffect } from "react";
import { transactionAPI } from '@/api/transaction-api'

const TransactionContext = createContext()

export function TransactionProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [transactionsCount, setTransactionsCount] = useState(null);
    
    const [transaction, setTransaction] = useState({
        utorid: null,
        spent: null,
        promotionIds: null,
        remark: null,
        createdBy: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to create/register a transaction
    const createPurchaseTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            // Remove any nulls
            const { utorid, spent, promotionIds, remark, createdBy } = transaction;
            const args = [utorid, spent, promotionIds, remark, createdBy].map(v =>
                v === null || v === undefined ? undefined : v
            );
            const result = await transactionAPI.createPurchaseTransaction(...args);

            console.log('Transaction created successfully:', result);
            // Reset the transaction form
            setTransaction({
                utorid: null,
                spent: null,
                promotionIds: null,
                remark: null,
                createdBy: null,
            });
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create transaction');
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
            createPurchaseTransaction
        }}
        >
        {children}
        </TransactionContext.Provider>
    );

}

export const useTransaction = () => useContext(TransactionContext);
