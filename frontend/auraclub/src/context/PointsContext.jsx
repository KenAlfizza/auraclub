import { createContext, useContext, useEffect, useState } from "react";
import { pointsAPI } from "@/api/points-api";

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const [points, setPoints] = useState(0);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshPoints = async () => {
    setLoading(true);
    try {
      const current = await pointsAPI.getCurrent();
      const trendData = await pointsAPI.getTrend();
      setPoints(current.points);
      setTrend(trendData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshPoints();
  }, []);

  return (
    <PointsContext.Provider value={{ points, trend, loading, refreshPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}
