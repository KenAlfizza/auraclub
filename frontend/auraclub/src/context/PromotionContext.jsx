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
            // Reset the promotion form
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
            setError(err.message || 'Failed to create promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Funtion to fetch all promotions
    const fetchPromotions = async (query = {}) => {
        setLoading(true)
        setError(null)
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
            
            const data = await promotionAPI.getAll(sanitizedQuery)
            setPromotions(data.results || [])
            setPromotionsCount(data.count || 0)
            return data
        } catch (err) {
            setError(err.message || "Failed to fetch promotion");
            throw err;
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
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Function to delete promotions based on id
    const deletePromotion = async (id) => {
        setLoading(true)
        setError(null)
         try {
            await promotionAPI.delete(id)
            console.log("Promotion context is deleted:", promotion.name)
            return
        } catch (err) {
            setError(err.message || "Failed to load promotion")
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Funcion to patch the promotion
    const patchPromotion = async (id, data) => {
        setLoading(true);
        setError(null);

        try {
            const sanitizedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "null" &&
                    value !== "undefined"
                )
            );
            const response = await promotionAPI.patch(id, sanitizedData);
            return response;
        } catch (err) {
            setError(err.message || "Failed to patch promotion");
            throw err
        } finally {
            setLoading(false);
        }
    };

    return (
        <PromotionContext.Provider
        value={{
            promotion,
            promotions,
            promotionsCount,
            setPromotion,
            createPromotion,
            fetchPromotion,
            deletePromotion,
            patchPromotion,
            fetchPromotions,
            loading,
            error,
        }}
        >
        {children}
        </PromotionContext.Provider>
    );

}

export const usePromotion = () => useContext(PromotionContext);
