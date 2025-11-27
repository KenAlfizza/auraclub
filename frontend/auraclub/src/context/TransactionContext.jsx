import { createContext, useContext, useState, useEffect } from "react";
import { transactionAPI } from '../api/transaction-api'

const TransactionContext = createContext()

export function TransactionProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [transactionsCount, setTransactionsCount] = useState(null);
    
    const [transaction, setTransaction] = useState({
        id: null,
        name: null,
        description: null,
        type: null,
        startTime: null,
        endTime: null,
        minSpending: null,
        rate: null,
        points: null,
        usedBy: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to create/register a transaction
    const createPurchaseTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await transactionAPI.create(
                transaction.name,
                transaction.description,
                transaction.type,
                transaction.startTime,
                transaction.endTime,
                transaction.rate,
                transaction.points
            );
            console.log('Transaction created successfully:', result);
            // Reset the transaction form
            setTransaction({
                name: null,
                description: null,
                type: null,
                startTime: null,
                endTime: null,
                minSpending: null,
                rate: null,
                points: null,
                usedBy: null,
            });
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    };

}

export const useTransaction = () => useContext(TransactionContext);
