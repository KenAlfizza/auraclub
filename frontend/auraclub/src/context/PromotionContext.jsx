import { createContext, useContext, useState, useEffect } from "react";
import { promotionAPI } from '../services/promotion-api'

const PromotionContext = createContext()

export function PromotionProvider({ children }) {
    const [promotions, setPromotions] = useState([]);
    const [promotionsCount, setPromotionsCount] = useState(null);
    
    const [promotion, setPromotion] = useState({
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

    // Function to create/register a promotion
    const createPromotion = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await promotionAPI.create(
                promotion.name,
                promotion.description,
                promotion.type,
                promotion.startTime,
                promotion.endTime,
                promotion.rate,
                promotion.points
            );
            console.log('Promotion created successfully:', result);
            // Optionally reset the promotion form
            setPromotion({
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
            console.error('Failed to create promotion:', err);
            setError(err.message || 'Something went wrong');
        throw err; // rethrow if you want calling components to handle it
        } finally {
            setLoading(false);
        }
    };

    // Funtion to fetch all promotions
    const fetchPromotions = async (query = {}) => {
        setLoading(true)
        setError(null)
        try {
            const data = await promotionAPI.getAll(query) // data has {count, results}
            setPromotions(data.results || []) // use results array
            setPromotionsCount(data.count || 0)
            return data
        } catch (err) {
            setError(err.message || "Failed to load promotions");
        } finally {
            setLoading(false)
        }
    }

    // Function to fetch a promotion based on id
    const fetchPromotion = async (id) => {
        setLoading(true)
        setError(null)
        try {
            const data = await promotionAPI.get(id)
            setPromotion(data)
            console.log("Promotion context is set:", promotion.name)
            return (data)
        } catch (err) {
            setError(err.message || "Failed to load promotion")
        } finally {
            setLoading(false)
        }
    }
    

    return (
        <PromotionContext.Provider
        value={{
            promotion,
            promotions,
            promotionsCount,
            setPromotion,
            createPromotion,
            fetchPromotion,
            fetchPromotions,
            loading,
            error,
        }}
        >
        {children}
        </PromotionContext.Provider>
    );

}

// Custom hook to use promotion context
export const usePromotion = () => useContext(PromotionContext);
